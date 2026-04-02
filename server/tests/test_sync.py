from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestSyncUpload:
    async def test_upload_learning_events(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "learning_events": [
                {
                    "skill_id": "math.arithmetic",
                    "event_type": "practice",
                    "quality": 4,
                    "timestamp": "2025-01-01 10:00:00",
                },
                {
                    "skill_id": "math.geometry",
                    "event_type": "practice",
                    "quality": 3,
                    "timestamp": "2025-01-01 10:05:00",
                },
            ],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["events_merged"] == 2

    async def test_upload_deduplicates_events(self, client: AsyncClient, profile: dict):
        event = {
            "skill_id": "math.arithmetic",
            "event_type": "practice",
            "quality": 4,
            "timestamp": "2025-01-01 10:00:00",
        }

        resp1 = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "learning_events": [event],
        })
        assert resp1.json()["events_merged"] == 1

        # Upload the same event again
        resp2 = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "learning_events": [event],
        })
        assert resp2.json()["events_merged"] == 0

    async def test_upload_mastery_max_wins(self, client: AsyncClient, profile: dict):
        # First upload: level 0.5
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "mastery": [{
                "skill_id": "math.arithmetic",
                "level": 0.5,
                "retention_score": 0.4,
                "transfer_score": 0.3,
                "depth_score": 0.2,
                "attempts": 10,
                "successes": 7,
                "ease_factor": 2.5,
                "streak": 3,
                "interval_days": 6.0,
            }],
        })

        # Second upload: mixed — some higher, some lower
        resp = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "mastery": [{
                "skill_id": "math.arithmetic",
                "level": 0.3,        # lower — should keep 0.5
                "retention_score": 0.6,  # higher — should take 0.6
                "transfer_score": 0.1,   # lower — should keep 0.3
                "depth_score": 0.5,      # higher — should take 0.5
                "attempts": 8,
                "successes": 5,
                "ease_factor": 2.3,
                "streak": 5,            # higher
                "interval_days": 3.0,
            }],
        })
        assert resp.json()["mastery_updated"] == 1

        # Verify via download
        dl = await client.post("/api/sync/download", json={
            "profile_id": profile["id"],
        })
        mastery = dl.json()["mastery"]
        record = next(r for r in mastery if r["skill_id"] == "math.arithmetic")
        assert record["level"] == 0.5          # max
        assert record["retention_score"] == 0.6  # max
        assert record["transfer_score"] == 0.3   # max
        assert record["depth_score"] == 0.5      # max
        assert record["streak"] == 5             # max

    async def test_upload_quest_progress_completed_wins(self, client: AsyncClient, profile: dict):
        # Insert a quest into the DB first
        from app.db.connection import get_db
        db = await get_db()
        await db.execute(
            "INSERT INTO quests (id, title, biome, mastery_tier, content) VALUES (?, ?, ?, ?, ?)",
            ("q1", "Test Quest", "workshop", "foundation", '{"description":"test","steps":[]}'),
        )
        await db.commit()

        # Upload active status
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "quest_progress": [{
                "quest_id": "q1",
                "status": "active",
                "started_at": "2025-01-01 09:00:00",
                "steps_completed": 2,
            }],
        })

        # Upload completed status from another device
        resp = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "quest_progress": [{
                "quest_id": "q1",
                "status": "completed",
                "started_at": "2025-01-01 09:00:00",
                "completed_at": "2025-01-01 10:00:00",
                "steps_completed": 5,
            }],
        })
        assert resp.json()["quests_updated"] == 1

        # Verify
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        qp = dl.json()["quest_progress"]
        assert len(qp) == 1
        assert qp[0]["status"] == "completed"
        assert qp[0]["steps_completed"] == 5

    async def test_upload_world_state_union(self, client: AsyncClient, profile: dict):
        # Upload world state from device A
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "world_state": {
                "active_biome": "forest",
                "discovered_biomes": ["workshop", "forest"],
                "inventory": [{"itemType": "wood", "quantity": 10}],
                "built_structures": [{"id": "s1", "biome": "workshop", "type": "bench", "position": {"x": 0, "y": 0, "z": 0}}],
                "travel_capability": ["walking", "boat"],
            },
        })

        # Upload from device B (different discoveries)
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "world_state": {
                "active_biome": "mountain",
                "discovered_biomes": ["workshop", "mountain"],
                "inventory": [{"itemType": "stone", "quantity": 5}],
                "built_structures": [{"id": "s2", "biome": "mountain", "type": "wall", "position": {"x": 1, "y": 0, "z": 0}}],
                "travel_capability": ["walking", "climbing"],
            },
        })

        # Verify union
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        ws = dl.json()["world_state"]
        biomes = set(ws["discovered_biomes"]) if isinstance(ws["discovered_biomes"], list) else set()
        assert "workshop" in biomes
        assert "forest" in biomes
        assert "mountain" in biomes

    async def test_upload_nonexistent_profile(self, client: AsyncClient):
        resp = await client.post("/api/sync/upload", json={
            "profile_id": "ghost",
            "learning_events": [],
        })
        assert resp.status_code == 404


class TestSyncDownload:
    async def test_download_empty_profile(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/sync/download", json={
            "profile_id": profile["id"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["learning_events"] == []
        assert data["mastery"] == []

    async def test_download_since_filter(self, client: AsyncClient, profile: dict):
        # Upload events at different times
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "learning_events": [
                {"skill_id": "a", "event_type": "practice", "quality": 3, "timestamp": "2025-01-01 08:00:00"},
                {"skill_id": "b", "event_type": "practice", "quality": 4, "timestamp": "2025-01-01 12:00:00"},
            ],
        })

        # Download only events after 10:00
        resp = await client.post("/api/sync/download", json={
            "profile_id": profile["id"],
            "since": "2025-01-01 10:00:00",
        })
        events = resp.json()["learning_events"]
        assert len(events) == 1
        assert events[0]["skill_id"] == "b"


class TestSyncFull:
    async def test_full_export(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/sync/full", json={
            "profile_id": profile["id"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["profile"]["id"] == profile["id"]
        assert data["companion"] is not None
        assert data["world_state"] is not None

    async def test_full_export_nonexistent(self, client: AsyncClient):
        resp = await client.post("/api/sync/full", json={
            "profile_id": "ghost",
        })
        assert resp.status_code == 404


class TestSyncCompanion:
    async def test_upload_companion_merge_trust(self, client: AsyncClient, profile: dict):
        # Companion was auto-created with trust=0.5
        # Upload from device A
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "companion": {
                "name": "Spark",
                "trust_level": 0.8,
                "traits": ["curious", "playful"],
                "memory": [
                    {"timestamp": "2025-01-01 10:00:00", "type": "achievement", "content": "Built first bridge", "importance": 0.9}
                ],
            },
        })

        # Upload from device B
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "companion": {
                "name": "Spark",
                "trust_level": 0.6,
                "traits": ["patient", "curious"],
                "memory": [
                    {"timestamp": "2025-01-02 10:00:00", "type": "interaction", "content": "Explored cave", "importance": 0.7}
                ],
            },
        })

        # Verify: max trust wins, traits are union, memories are union
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        comp = dl.json()["companion"]
        assert comp["trust_level"] == 0.8  # max
        import json
        traits = json.loads(comp["traits"]) if isinstance(comp["traits"], str) else comp["traits"]
        assert set(traits) >= {"curious", "playful", "patient"}


class TestSyncAccessibility:
    async def test_upload_accessibility_settings(self, client: AsyncClient, profile: dict):
        """Accessibility settings sync via upload."""
        resp = await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "color_blind_mode": "deuteranopia",
                "high_contrast": True,
                "font_size": 150,
                "subtitles": True,
            },
        })
        assert resp.status_code == 200
        assert resp.json()["accessibility_updated"] is True

    async def test_download_includes_accessibility(self, client: AsyncClient, profile: dict):
        """Accessibility settings appear in sync download."""
        # Upload settings
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "color_blind_mode": "protanopia",
                "reduced_motion": True,
                "companion_speech_speed": 75,
            },
        })

        # Download and verify
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        assert dl.status_code == 200
        a11y = dl.json()["accessibility_settings"]
        assert a11y is not None
        assert a11y["color_blind_mode"] == "protanopia"
        assert a11y["reduced_motion"] is True
        assert a11y["companion_speech_speed"] == 75

    async def test_accessibility_last_write_wins(self, client: AsyncClient, profile: dict):
        """Later upload replaces earlier accessibility settings entirely."""
        # Device A sets deuteranopia + high contrast
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "color_blind_mode": "deuteranopia",
                "high_contrast": True,
                "font_size": 120,
            },
        })

        # Device B sets tritanopia + reduced motion (overwrites A entirely)
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "color_blind_mode": "tritanopia",
                "reduced_motion": True,
                "font_size": 180,
            },
        })

        # Verify last write wins
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        a11y = dl.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "tritanopia"
        assert a11y["reduced_motion"] is True
        assert a11y["font_size"] == 180
        # high_contrast was not in device B's upload — should be absent or default
        assert a11y.get("high_contrast") is False or a11y.get("high_contrast") is None

    async def test_download_no_accessibility_returns_null(self, client: AsyncClient, profile: dict):
        """Profile with no accessibility settings returns null."""
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        assert dl.json()["accessibility_settings"] is None

    async def test_full_export_includes_accessibility(self, client: AsyncClient, profile: dict):
        """Full sync export includes accessibility settings."""
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "one_switch_mode": True,
                "scan_speed": 0.5,
                "simplified_ui": True,
            },
        })

        resp = await client.post("/api/sync/full", json={"profile_id": profile["id"]})
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["one_switch_mode"] is True
        assert a11y["scan_speed"] == 0.5
        assert a11y["simplified_ui"] is True

    async def test_upload_without_accessibility_preserves_existing(self, client: AsyncClient, profile: dict):
        """Uploading other data without accessibility_settings doesn't erase them."""
        # Set accessibility
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "accessibility_settings": {
                "high_contrast": True,
                "font_size": 140,
            },
        })

        # Upload only mastery data (no accessibility_settings field)
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "mastery": [{
                "skill_id": "math.arithmetic",
                "level": 0.5,
                "retention_score": 0.4,
                "transfer_score": 0.3,
                "depth_score": 0.2,
                "attempts": 10,
                "successes": 7,
                "ease_factor": 2.5,
                "streak": 3,
                "interval_days": 6.0,
            }],
        })

        # Accessibility settings should be unchanged
        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        a11y = dl.json()["accessibility_settings"]
        assert a11y["high_contrast"] is True
        assert a11y["font_size"] == 140
