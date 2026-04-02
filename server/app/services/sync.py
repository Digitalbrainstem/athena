from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field

import aiosqlite

from app.db.connection import db_transaction, get_db

logger = logging.getLogger("nexus.sync")


@dataclass
class SyncUploadPayload:
    """Data a client uploads during sync."""

    learning_events: list[dict] = field(default_factory=list)
    mastery: list[dict] = field(default_factory=list)
    quest_progress: list[dict] = field(default_factory=list)
    companion: dict | None = None
    world_state: dict | None = None
    accessibility_settings: dict | None = None


@dataclass
class SyncResult:
    """Result returned after a merge operation."""

    events_merged: int = 0
    mastery_updated: int = 0
    quests_updated: int = 0
    companion_updated: bool = False
    world_state_updated: bool = False
    accessibility_updated: bool = False
    conflicts: list[str] = field(default_factory=list)


class SyncService:
    """Multi-device merge engine.

    Merge rules:
    - Mastery levels: max(local, server) — can't un-learn
    - Learning events: union — all events from all devices (dedup by timestamp+skill)
    - Quest completions: union — completed on any device = completed
    - World state: last-write-wins per field (by timestamp)
    - Companion state: most recent memory wins
    """

    async def merge_upload(self, profile_id: str, upload: SyncUploadPayload) -> SyncResult:
        result = SyncResult()
        async with db_transaction() as conn:
            result.events_merged = await self._merge_events(conn, profile_id, upload.learning_events)
            result.mastery_updated = await self._merge_mastery(conn, profile_id, upload.mastery)
            result.quests_updated = await self._merge_quest_progress(conn, profile_id, upload.quest_progress)
            result.companion_updated = await self._merge_companion(conn, profile_id, upload.companion)
            result.world_state_updated = await self._merge_world_state(conn, profile_id, upload.world_state)
            result.accessibility_updated = await self._merge_accessibility(conn, profile_id, upload.accessibility_settings)
        return result

    async def get_state_since(
        self, profile_id: str, since: str | None
    ) -> dict:
        """Download merged state for a profile, optionally filtered by timestamp."""
        db = await get_db()

        event_query = (
            "SELECT * FROM learning_events WHERE profile_id = ?"
        )
        params: list = [profile_id]
        if since:
            event_query += " AND timestamp > ?"
            params.append(since)
        event_query += " ORDER BY timestamp"

        events_cur = await db.execute(event_query, params)
        events = [dict(r) for r in await events_cur.fetchall()]

        mastery_cur = await db.execute(
            "SELECT * FROM mastery WHERE profile_id = ?", (profile_id,)
        )
        mastery = [dict(r) for r in await mastery_cur.fetchall()]

        qp_cur = await db.execute(
            "SELECT * FROM quest_progress WHERE profile_id = ?", (profile_id,)
        )
        quest_progress = [dict(r) for r in await qp_cur.fetchall()]

        comp_cur = await db.execute(
            "SELECT * FROM companions WHERE profile_id = ?", (profile_id,)
        )
        companion_row = await comp_cur.fetchone()
        companion = dict(companion_row) if companion_row else None

        ws_cur = await db.execute(
            "SELECT * FROM world_state WHERE profile_id = ?", (profile_id,)
        )
        ws_row = await ws_cur.fetchone()
        world_state = _parse_world_state(dict(ws_row)) if ws_row else None

        if companion:
            companion = _parse_companion(companion)

        # Accessibility settings from the profile row
        a11y_cur = await db.execute(
            "SELECT accessibility_settings FROM profiles WHERE id = ?", (profile_id,)
        )
        a11y_row = await a11y_cur.fetchone()
        a11y_raw = dict(a11y_row).get("accessibility_settings") if a11y_row else None
        accessibility_settings = _parse_json_obj(a11y_raw)

        return {
            "learning_events": events,
            "mastery": mastery,
            "quest_progress": quest_progress,
            "companion": companion,
            "world_state": world_state,
            "accessibility_settings": accessibility_settings,
        }

    async def full_export(self, profile_id: str) -> dict:
        """Export all data for a profile (for full sync or recovery)."""
        db = await get_db()

        prof_cur = await db.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
        profile = await prof_cur.fetchone()
        profile_dict = dict(profile) if profile else None

        state = await self.get_state_since(profile_id, since=None)
        state["profile"] = profile_dict
        return state

    # -- Private merge helpers --------------------------------------------------

    async def _merge_accessibility(
        self, conn: aiosqlite.Connection, profile_id: str, settings: dict | None
    ) -> bool:
        """Last-write-wins for accessibility preferences."""
        if settings is None:
            return False

        a11y_json = json.dumps(settings)
        await conn.execute(
            "UPDATE profiles SET accessibility_settings = ? WHERE id = ?",
            (a11y_json, profile_id),
        )
        return True

    async def _merge_events(
        self, conn: aiosqlite.Connection, profile_id: str, events: list[dict]
    ) -> int:
        """Union merge — dedup by (profile_id, skill_id, timestamp)."""
        if not events:
            return 0

        merged = 0
        for ev in events:
            # Check for duplicate
            cur = await conn.execute(
                "SELECT id FROM learning_events "
                "WHERE profile_id = ? AND skill_id = ? AND timestamp = ?",
                (profile_id, ev.get("skill_id", ""), ev.get("timestamp", "")),
            )
            if await cur.fetchone() is not None:
                continue

            await conn.execute(
                "INSERT INTO learning_events "
                "(profile_id, skill_id, quest_id, event_type, quality, context, response_time_ms, timestamp) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    profile_id,
                    ev.get("skill_id", ""),
                    ev.get("quest_id"),
                    ev.get("event_type", "practice"),
                    ev.get("quality", 3),
                    ev.get("context"),
                    ev.get("response_time_ms"),
                    ev.get("timestamp"),
                ),
            )
            merged += 1
        return merged

    async def _merge_mastery(
        self, conn: aiosqlite.Connection, profile_id: str, records: list[dict]
    ) -> int:
        """Max-wins merge — can't un-learn."""
        if not records:
            return 0

        updated = 0
        for rec in records:
            skill_id = rec.get("skill_id", "")
            cur = await conn.execute(
                "SELECT * FROM mastery WHERE profile_id = ? AND skill_id = ?",
                (profile_id, skill_id),
            )
            existing = await cur.fetchone()

            if existing is None:
                await conn.execute(
                    "INSERT INTO mastery "
                    "(profile_id, skill_id, level, retention_score, transfer_score, "
                    "depth_score, attempts, successes, last_attempt, next_review, "
                    "ease_factor, streak, interval_days) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        profile_id,
                        skill_id,
                        rec.get("level", 0.0),
                        rec.get("retention_score", 0.0),
                        rec.get("transfer_score", 0.0),
                        rec.get("depth_score", 0.0),
                        rec.get("attempts", 0),
                        rec.get("successes", 0),
                        rec.get("last_attempt"),
                        rec.get("next_review"),
                        rec.get("ease_factor", 2.5),
                        rec.get("streak", 0),
                        rec.get("interval_days", 0.0),
                    ),
                )
                updated += 1
            else:
                ex = dict(existing)
                new_level = max(ex["level"], rec.get("level", 0.0))
                new_retention = max(ex["retention_score"], rec.get("retention_score", 0.0))
                new_transfer = max(ex["transfer_score"], rec.get("transfer_score", 0.0))
                new_depth = max(ex["depth_score"], rec.get("depth_score", 0.0))
                new_attempts = max(ex["attempts"], rec.get("attempts", 0))
                new_successes = max(ex["successes"], rec.get("successes", 0))
                new_streak = max(ex["streak"], rec.get("streak", 0))

                # Pick the most recent last_attempt
                new_last = _latest_timestamp(ex.get("last_attempt"), rec.get("last_attempt"))
                new_review = _latest_timestamp(ex.get("next_review"), rec.get("next_review"))

                new_ease = max(ex["ease_factor"], rec.get("ease_factor", 2.5))
                new_interval = max(ex["interval_days"], rec.get("interval_days", 0.0))

                await conn.execute(
                    "UPDATE mastery SET level=?, retention_score=?, transfer_score=?, "
                    "depth_score=?, attempts=?, successes=?, last_attempt=?, next_review=?, "
                    "ease_factor=?, streak=?, interval_days=? "
                    "WHERE profile_id=? AND skill_id=?",
                    (
                        new_level, new_retention, new_transfer, new_depth,
                        new_attempts, new_successes, new_last, new_review,
                        new_ease, new_streak, new_interval,
                        profile_id, skill_id,
                    ),
                )
                updated += 1
        return updated

    async def _merge_quest_progress(
        self, conn: aiosqlite.Connection, profile_id: str, progress_list: list[dict]
    ) -> int:
        """Union merge — completed on any device = completed. Max steps_completed."""
        if not progress_list:
            return 0

        updated = 0
        for qp in progress_list:
            quest_id = qp.get("quest_id", "")
            cur = await conn.execute(
                "SELECT * FROM quest_progress WHERE profile_id = ? AND quest_id = ?",
                (profile_id, quest_id),
            )
            existing = await cur.fetchone()

            new_status = qp.get("status", "available")
            new_steps = qp.get("steps_completed", 0)

            if existing is None:
                await conn.execute(
                    "INSERT INTO quest_progress "
                    "(profile_id, quest_id, status, started_at, completed_at, steps_completed) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (
                        profile_id, quest_id, new_status,
                        qp.get("started_at"), qp.get("completed_at"), new_steps,
                    ),
                )
                updated += 1
            else:
                ex = dict(existing)
                # Completed wins over any other status
                merged_status = _merge_quest_status(ex["status"], new_status)
                merged_steps = max(ex["steps_completed"], new_steps)
                merged_started = _earliest_timestamp(ex.get("started_at"), qp.get("started_at"))
                merged_completed = _latest_timestamp(ex.get("completed_at"), qp.get("completed_at"))

                await conn.execute(
                    "UPDATE quest_progress SET status=?, steps_completed=?, "
                    "started_at=?, completed_at=? WHERE profile_id=? AND quest_id=?",
                    (merged_status, merged_steps, merged_started, merged_completed,
                     profile_id, quest_id),
                )
                updated += 1
        return updated

    async def _merge_companion(
        self, conn: aiosqlite.Connection, profile_id: str, companion: dict | None
    ) -> bool:
        """Most-recent interaction wins. Merge memories as union."""
        if companion is None:
            return False

        cur = await conn.execute(
            "SELECT * FROM companions WHERE profile_id = ?", (profile_id,)
        )
        existing = await cur.fetchone()

        if existing is None:
            traits_json = companion.get("traits", "[]")
            if isinstance(traits_json, list):
                traits_json = json.dumps(traits_json)
            memory_json = companion.get("memory", "[]")
            if isinstance(memory_json, list):
                memory_json = json.dumps(memory_json)

            await conn.execute(
                "INSERT INTO companions "
                "(profile_id, name, appearance, personality_stage, trust_level, traits, memory) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    profile_id,
                    companion.get("name", "Buddy"),
                    companion.get("appearance"),
                    companion.get("personality_stage", "guide"),
                    companion.get("trust_level", 0.5),
                    traits_json,
                    memory_json,
                ),
            )
            return True

        # Merge: higher trust wins, union traits, union memories
        ex = dict(existing)
        new_trust = max(ex["trust_level"], companion.get("trust_level", 0.0))

        ex_traits = _parse_json_list(ex.get("traits"))
        up_traits = companion.get("traits", [])
        if isinstance(up_traits, str):
            up_traits = _parse_json_list(up_traits)
        merged_traits = list(set(ex_traits) | set(up_traits))

        ex_memory = _parse_json_list(ex.get("memory"))
        up_memory = companion.get("memory", [])
        if isinstance(up_memory, str):
            up_memory = _parse_json_list(up_memory)
        # Dedup memories by timestamp+type
        seen = {(m.get("timestamp"), m.get("type")) for m in ex_memory if isinstance(m, dict)}
        merged_memory = list(ex_memory)
        for m in up_memory:
            if isinstance(m, dict):
                key = (m.get("timestamp"), m.get("type"))
                if key not in seen:
                    merged_memory.append(m)
                    seen.add(key)

        await conn.execute(
            "UPDATE companions SET trust_level=?, traits=?, memory=? WHERE profile_id=?",
            (new_trust, json.dumps(merged_traits), json.dumps(merged_memory), profile_id),
        )
        return True

    async def _merge_world_state(
        self, conn: aiosqlite.Connection, profile_id: str, world: dict | None
    ) -> bool:
        """Union for collections, last-write-wins for scalars."""
        if world is None:
            return False

        cur = await conn.execute(
            "SELECT * FROM world_state WHERE profile_id = ?", (profile_id,)
        )
        existing = await cur.fetchone()

        if existing is None:
            # Ensure JSON fields are strings
            discovered = world.get("discovered_biomes", '["workshop"]')
            if isinstance(discovered, list):
                discovered = json.dumps(discovered)
            structures = world.get("built_structures", "[]")
            if isinstance(structures, list):
                structures = json.dumps(structures)
            inventory = world.get("inventory", "[]")
            if isinstance(inventory, list):
                inventory = json.dumps(inventory)
            travel = world.get("travel_capability", '["walking"]')
            if isinstance(travel, list):
                travel = json.dumps(travel)

            await conn.execute(
                "INSERT INTO world_state "
                "(profile_id, active_biome, discovered_biomes, built_structures, "
                "inventory, travel_capability, world_seed) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    profile_id,
                    world.get("active_biome", "workshop"),
                    discovered, structures, inventory, travel,
                    world.get("world_seed"),
                ),
            )
            return True

        ex = dict(existing)

        # Union discovered biomes
        ex_biomes = _parse_json_list(ex.get("discovered_biomes"))
        up_biomes = world.get("discovered_biomes", [])
        if isinstance(up_biomes, str):
            up_biomes = _parse_json_list(up_biomes)
        merged_biomes = list(set(ex_biomes) | set(up_biomes))

        # Union travel capabilities
        ex_travel = _parse_json_list(ex.get("travel_capability"))
        up_travel = world.get("travel_capability", [])
        if isinstance(up_travel, str):
            up_travel = _parse_json_list(up_travel)
        merged_travel = list(set(ex_travel) | set(up_travel))

        # Union inventory (dedup by itemType, sum quantities)
        ex_inv = _parse_json_list(ex.get("inventory"))
        up_inv = world.get("inventory", [])
        if isinstance(up_inv, str):
            up_inv = _parse_json_list(up_inv)
        merged_inv = _merge_inventory(ex_inv, up_inv)

        # Union built structures (dedup by id)
        ex_struct = _parse_json_list(ex.get("built_structures"))
        up_struct = world.get("built_structures", [])
        if isinstance(up_struct, str):
            up_struct = _parse_json_list(up_struct)
        seen_ids = {s["id"] for s in ex_struct if isinstance(s, dict) and "id" in s}
        merged_struct = list(ex_struct)
        for s in up_struct:
            if isinstance(s, dict) and s.get("id") not in seen_ids:
                merged_struct.append(s)
                seen_ids.add(s["id"])

        # Last-write-wins for active_biome (use uploaded value — it's the latest client state)
        active_biome = world.get("active_biome", ex["active_biome"])

        await conn.execute(
            "UPDATE world_state SET active_biome=?, discovered_biomes=?, "
            "built_structures=?, inventory=?, travel_capability=? WHERE profile_id=?",
            (
                active_biome,
                json.dumps(merged_biomes),
                json.dumps(merged_struct),
                json.dumps(merged_inv),
                json.dumps(merged_travel),
                profile_id,
            ),
        )
        return True


def _parse_world_state(row: dict) -> dict:
    """Parse JSON text fields in a world_state row into Python objects."""
    for field in ("discovered_biomes", "built_structures", "inventory", "travel_capability"):
        if field in row and isinstance(row[field], str):
            row[field] = _parse_json_list(row[field])
    return row


def _parse_companion(row: dict) -> dict:
    """Parse JSON text fields in a companion row into Python objects."""
    for field in ("traits", "memory"):
        if field in row and isinstance(row[field], str):
            row[field] = _parse_json_list(row[field])
    return row


def _parse_json_obj(value: str | dict | None) -> dict | None:
    """Parse a JSON text field into a dict, or return None."""
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    try:
        result = json.loads(value)
        return result if isinstance(result, dict) else None
    except (json.JSONDecodeError, TypeError):
        return None


# -- Utility helpers -----------------------------------------------------------

_QUEST_STATUS_PRIORITY = {"completed": 3, "active": 2, "available": 1, "abandoned": 0}


def _merge_quest_status(a: str, b: str) -> str:
    """Completed always wins, then active, then available."""
    return a if _QUEST_STATUS_PRIORITY.get(a, 0) >= _QUEST_STATUS_PRIORITY.get(b, 0) else b


def _latest_timestamp(a: str | None, b: str | None) -> str | None:
    if a is None:
        return b
    if b is None:
        return a
    return max(a, b)


def _earliest_timestamp(a: str | None, b: str | None) -> str | None:
    if a is None:
        return b
    if b is None:
        return a
    return min(a, b)


def _parse_json_list(value: str | list | None) -> list:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    try:
        result = json.loads(value)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


def _merge_inventory(existing: list, incoming: list) -> list:
    """Merge inventory entries — max quantity per itemType."""
    inv_map: dict[str, dict] = {}
    for item in existing:
        if isinstance(item, dict) and "itemType" in item:
            key = item["itemType"]
            inv_map[key] = item

    for item in incoming:
        if isinstance(item, dict) and "itemType" in item:
            key = item["itemType"]
            if key in inv_map:
                inv_map[key]["quantity"] = max(
                    inv_map[key].get("quantity", 0), item.get("quantity", 0)
                )
            else:
                inv_map[key] = item

    return list(inv_map.values())
