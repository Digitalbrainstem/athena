from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field

logger = logging.getLogger("nexus.multiplayer")

MAX_PLAYERS_PER_SESSION = 4
SESSION_TIMEOUT_SECONDS = 30
STATE_SYNC_INTERVAL = 0.1  # 10 Hz


@dataclass
class PlayerConnection:
    profile_id: str
    display_name: str
    joined_at: str
    connected: bool = True
    last_seen: float = field(default_factory=time.monotonic)


@dataclass
class SharedObjective:
    index: int
    description: str
    screen_reader_text: str
    assigned_to: str | None = None
    status: str = "pending"  # pending | active | completed


@dataclass
class SharedQuestState:
    quest_id: str
    quest_title: str
    current_step: int = 0
    total_steps: int = 0
    objectives: list[SharedObjective] = field(default_factory=list)
    contributions: dict[str, list[str]] = field(default_factory=dict)
    completed_at: str | None = None


@dataclass
class GameSession:
    id: str
    host_profile_id: str
    host_name: str
    status: str = "waiting"  # waiting | active | completed
    players: dict[str, PlayerConnection] = field(default_factory=dict)
    shared_quest: SharedQuestState | None = None
    created_at: str = ""
    updated_at: str = ""

    @property
    def player_count(self) -> int:
        return sum(1 for p in self.players.values() if p.connected)

    @property
    def is_full(self) -> bool:
        return self.player_count >= MAX_PLAYERS_PER_SESSION

    def to_discovery_dict(self) -> dict:
        return {
            "id": self.id,
            "hostName": self.host_name,
            "hostProfileId": self.host_profile_id,
            "playerCount": self.player_count,
            "maxPlayers": MAX_PLAYERS_PER_SESSION,
            "questId": self.shared_quest.quest_id if self.shared_quest else None,
            "questTitle": self.shared_quest.quest_title if self.shared_quest else None,
            "createdAt": self.created_at,
        }

    def to_state_dict(self) -> dict:
        return {
            "id": self.id,
            "status": self.status,
            "hostProfileId": self.host_profile_id,
            "players": [
                {
                    "profileId": p.profile_id,
                    "displayName": p.display_name,
                    "joinedAt": p.joined_at,
                    "connected": p.connected,
                }
                for p in self.players.values()
            ],
            "sharedQuest": self._quest_dict(),
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }

    def _quest_dict(self) -> dict | None:
        q = self.shared_quest
        if q is None:
            return None
        return {
            "questId": q.quest_id,
            "questTitle": q.quest_title,
            "currentStep": q.current_step,
            "totalSteps": q.total_steps,
            "objectives": [
                {
                    "index": o.index,
                    "description": o.description,
                    "assignedTo": o.assigned_to,
                    "status": o.status,
                    "screenReaderText": o.screen_reader_text,
                }
                for o in q.objectives
            ],
            "contributions": q.contributions,
            "completedAt": q.completed_at,
        }


class SessionManager:
    """Manages LAN multiplayer sessions. No internet. No cloud."""

    def __init__(self) -> None:
        self._sessions: dict[str, GameSession] = {}

    @property
    def sessions(self) -> dict[str, GameSession]:
        return self._sessions

    def list_sessions(self) -> list[dict]:
        self._cleanup_stale()
        return [
            s.to_discovery_dict()
            for s in self._sessions.values()
            if s.status != "completed"
        ]

    def create_session(self, host_profile_id: str, host_name: str) -> GameSession:
        now = _now_iso()
        session_id = uuid.uuid4().hex[:12]
        session = GameSession(
            id=session_id,
            host_profile_id=host_profile_id,
            host_name=host_name,
            created_at=now,
            updated_at=now,
        )
        session.players[host_profile_id] = PlayerConnection(
            profile_id=host_profile_id,
            display_name=host_name,
            joined_at=now,
        )
        self._sessions[session_id] = session
        logger.info("Session %s created by %s", session_id, host_name)
        return session

    def get_session(self, session_id: str) -> GameSession | None:
        return self._sessions.get(session_id)

    def join_session(
        self, session_id: str, profile_id: str, display_name: str
    ) -> tuple[bool, str, GameSession | None]:
        session = self._sessions.get(session_id)
        if session is None:
            return False, "Session not found", None
        if session.status == "completed":
            return False, "Session has ended", None
        if session.is_full and profile_id not in session.players:
            return False, "Session is full", None

        now = _now_iso()
        if profile_id in session.players:
            session.players[profile_id].connected = True
            session.players[profile_id].last_seen = time.monotonic()
        else:
            session.players[profile_id] = PlayerConnection(
                profile_id=profile_id,
                display_name=display_name,
                joined_at=now,
            )
        session.updated_at = now
        logger.info("Player %s joined session %s", display_name, session_id)
        return True, "ok", session

    def leave_session(self, session_id: str, profile_id: str) -> GameSession | None:
        session = self._sessions.get(session_id)
        if session is None:
            return None
        player = session.players.get(profile_id)
        if player:
            player.connected = False
        session.updated_at = _now_iso()

        if session.player_count == 0:
            session.status = "completed"
            logger.info("Session %s ended (all players left)", session_id)

        return session

    def start_quest(
        self,
        session_id: str,
        quest_id: str,
        quest_title: str,
        objectives: list[dict],
    ) -> GameSession | None:
        session = self._sessions.get(session_id)
        if session is None:
            return None

        objs = [
            SharedObjective(
                index=i,
                description=o["description"],
                screen_reader_text=o.get("screenReaderText", o["description"]),
            )
            for i, o in enumerate(objectives)
        ]

        session.shared_quest = SharedQuestState(
            quest_id=quest_id,
            quest_title=quest_title,
            total_steps=len(objs),
            objectives=objs,
        )
        session.status = "active"
        session.updated_at = _now_iso()
        return session

    def claim_objective(
        self, session_id: str, objective_index: int, profile_id: str
    ) -> SharedObjective | None:
        session = self._sessions.get(session_id)
        if session is None or session.shared_quest is None:
            return None
        if objective_index < 0 or objective_index >= len(session.shared_quest.objectives):
            return None
        obj = session.shared_quest.objectives[objective_index]
        if obj.status != "pending":
            return None
        obj.assigned_to = profile_id
        obj.status = "active"
        session.updated_at = _now_iso()
        return obj

    def complete_objective(
        self, session_id: str, objective_index: int, profile_id: str
    ) -> SharedObjective | None:
        session = self._sessions.get(session_id)
        if session is None or session.shared_quest is None:
            return None
        if objective_index < 0 or objective_index >= len(session.shared_quest.objectives):
            return None
        obj = session.shared_quest.objectives[objective_index]
        if obj.assigned_to != profile_id or obj.status != "active":
            return None
        obj.status = "completed"

        # Track contributions
        contribs = session.shared_quest.contributions.setdefault(profile_id, [])
        contribs.append(obj.description)

        # Update step count
        completed = sum(1 for o in session.shared_quest.objectives if o.status == "completed")
        session.shared_quest.current_step = completed

        # Check for quest completion
        if completed == session.shared_quest.total_steps:
            session.shared_quest.completed_at = _now_iso()
            session.status = "completed"

        session.updated_at = _now_iso()
        return obj

    def remove_session(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)

    def _cleanup_stale(self) -> None:
        now = time.monotonic()
        to_remove = []
        for sid, session in self._sessions.items():
            if session.status == "completed":
                to_remove.append(sid)
                continue
            all_stale = all(
                not p.connected or (now - p.last_seen > SESSION_TIMEOUT_SECONDS)
                for p in session.players.values()
            )
            if all_stale and session.players:
                to_remove.append(sid)
        for sid in to_remove:
            del self._sessions[sid]


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()
