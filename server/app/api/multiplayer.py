from __future__ import annotations

import json
import logging
import time
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.services.session import SessionManager

logger = logging.getLogger("nexus.multiplayer")

router = APIRouter(prefix="/api/multiplayer", tags=["multiplayer"])

# Single process-wide session manager (LAN-only, no persistence needed)
_session_manager = SessionManager()


def get_session_manager() -> SessionManager:
    return _session_manager


def set_session_manager(manager: SessionManager) -> None:
    global _session_manager
    _session_manager = manager


# ---------------------------------------------------------------------------
# Active WebSocket connections per session
# ---------------------------------------------------------------------------

_connections: dict[str, dict[str, WebSocket]] = {}


# ---------------------------------------------------------------------------
# REST endpoints for session discovery & management
# ---------------------------------------------------------------------------


class CreateSessionRequest(BaseModel):
    profile_id: str
    display_name: str


class JoinSessionRequest(BaseModel):
    profile_id: str
    display_name: str


class StartQuestRequest(BaseModel):
    quest_id: str
    quest_title: str
    objectives: list[dict[str, str]]


class ClaimObjectiveRequest(BaseModel):
    objective_index: int
    profile_id: str


class CompleteObjectiveRequest(BaseModel):
    objective_index: int
    profile_id: str


@router.get("/sessions")
async def list_sessions():
    """Discover active LAN sessions."""
    mgr = get_session_manager()
    return mgr.list_sessions()


@router.post("/sessions", status_code=201)
async def create_session(body: CreateSessionRequest):
    """Create a new multiplayer session."""
    mgr = get_session_manager()
    session = mgr.create_session(body.profile_id, body.display_name)
    return session.to_state_dict()


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get the current state of a session."""
    mgr = get_session_manager()
    session = mgr.get_session(session_id)
    if session is None:
        return {"error": "Session not found"}, 404
    return session.to_state_dict()


@router.post("/sessions/{session_id}/join")
async def join_session(session_id: str, body: JoinSessionRequest):
    """Join an existing session."""
    mgr = get_session_manager()
    ok, reason, session = mgr.join_session(session_id, body.profile_id, body.display_name)
    if not ok or session is None:
        return {"error": reason}
    # Broadcast player joined to connected WebSockets
    await _broadcast(session_id, {
        "type": "player_joined",
        "sessionId": session_id,
        "senderId": "server",
        "timestamp": session.updated_at,
        "payload": {
            "profileId": body.profile_id,
            "displayName": body.display_name,
        },
    }, exclude=body.profile_id)
    return session.to_state_dict()


@router.post("/sessions/{session_id}/leave")
async def leave_session(session_id: str, body: JoinSessionRequest):
    """Leave a session."""
    mgr = get_session_manager()
    session = mgr.leave_session(session_id, body.profile_id)
    if session is None:
        return {"error": "Session not found"}
    # Broadcast player left
    await _broadcast(session_id, {
        "type": "player_left",
        "sessionId": session_id,
        "senderId": "server",
        "timestamp": session.updated_at,
        "payload": {"profileId": body.profile_id},
    }, exclude=body.profile_id)
    # Remove connection
    if session_id in _connections:
        _connections[session_id].pop(body.profile_id, None)
        if not _connections[session_id]:
            del _connections[session_id]
    return {"status": "ok"}


@router.post("/sessions/{session_id}/quest")
async def start_quest(session_id: str, body: StartQuestRequest):
    """Start a shared quest in the session."""
    mgr = get_session_manager()
    session = mgr.start_quest(
        session_id,
        body.quest_id,
        body.quest_title,
        [o.copy() if isinstance(o, dict) else dict(o) for o in body.objectives],
    )
    if session is None:
        return {"error": "Session not found"}
    await _broadcast(session_id, {
        "type": "quest_start",
        "sessionId": session_id,
        "senderId": "server",
        "timestamp": session.updated_at,
        "payload": session.to_state_dict()["sharedQuest"],
    })
    return session.to_state_dict()


@router.post("/sessions/{session_id}/objectives/claim")
async def claim_objective(session_id: str, body: ClaimObjectiveRequest):
    """Claim an objective in the shared quest."""
    mgr = get_session_manager()
    obj = mgr.claim_objective(session_id, body.objective_index, body.profile_id)
    if obj is None:
        return {"error": "Cannot claim objective"}
    session = mgr.get_session(session_id)
    if session:
        await _broadcast(session_id, {
            "type": "objective_claim",
            "sessionId": session_id,
            "senderId": "server",
            "timestamp": session.updated_at,
            "payload": {
                "objectiveIndex": body.objective_index,
                "profileId": body.profile_id,
            },
        })
    return {"status": "ok", "objective": {"index": obj.index, "assignedTo": obj.assigned_to, "status": obj.status}}


@router.post("/sessions/{session_id}/objectives/complete")
async def complete_objective(session_id: str, body: CompleteObjectiveRequest):
    """Complete an objective in the shared quest."""
    mgr = get_session_manager()
    obj = mgr.complete_objective(session_id, body.objective_index, body.profile_id)
    if obj is None:
        return {"error": "Cannot complete objective"}
    session = mgr.get_session(session_id)
    if session:
        await _broadcast(session_id, {
            "type": "objective_complete",
            "sessionId": session_id,
            "senderId": "server",
            "timestamp": session.updated_at,
            "payload": {
                "objectiveIndex": body.objective_index,
                "profileId": body.profile_id,
            },
        })
        # Broadcast updated quest state
        await _broadcast(session_id, {
            "type": "quest_update",
            "sessionId": session_id,
            "senderId": "server",
            "timestamp": session.updated_at,
            "payload": {"questState": session.to_state_dict()["sharedQuest"]},
        })
    return {"status": "ok", "objective": {"index": obj.index, "status": obj.status}}


# ---------------------------------------------------------------------------
# WebSocket endpoint for real-time state sync
# ---------------------------------------------------------------------------


@router.websocket("/ws/{session_id}/{profile_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, profile_id: str):
    """
    Real-time WebSocket connection for a player in a session.

    SAFETY: No direct player-to-player messaging. All messages are structured
    game actions processed by the server. The companion mediates all interaction.
    """
    mgr = get_session_manager()
    session = mgr.get_session(session_id)

    if session is None:
        await websocket.close(code=4004, reason="Session not found")
        return

    if profile_id not in session.players:
        await websocket.close(code=4003, reason="Not a member of this session")
        return

    await websocket.accept()

    # Register connection
    if session_id not in _connections:
        _connections[session_id] = {}
    _connections[session_id][profile_id] = websocket

    # Mark player connected
    player = session.players.get(profile_id)
    if player:
        player.connected = True
        player.last_seen = time.monotonic()

    # Send current state
    try:
        await websocket.send_json({
            "type": "session_state",
            "sessionId": session_id,
            "senderId": "server",
            "timestamp": session.updated_at,
            "payload": session.to_state_dict(),
        })
    except Exception:
        logger.exception("Failed to send initial state to %s", profile_id)
        return

    try:
        while True:
            data = await websocket.receive_json()
            await _handle_ws_message(session_id, profile_id, data)
    except WebSocketDisconnect:
        logger.info("Player %s disconnected from session %s", profile_id, session_id)
    except Exception:
        logger.exception("WebSocket error for %s in %s", profile_id, session_id)
    finally:
        # Clean up connection
        if session_id in _connections:
            _connections[session_id].pop(profile_id, None)
            if not _connections[session_id]:
                del _connections[session_id]
        # Mark player disconnected
        if player:
            player.connected = False
        mgr.leave_session(session_id, profile_id)


async def _handle_ws_message(session_id: str, sender_id: str, data: dict[str, Any]) -> None:
    """
    Process incoming WebSocket message. ONLY structured game actions allowed.
    No free-form text. No voice. No images. Companion mediates all interaction.
    """
    msg_type = data.get("type")

    if msg_type == "game_action":
        # Relay game action to all other players (server-authoritative)
        await _broadcast(session_id, {
            "type": "game_action",
            "sessionId": session_id,
            "senderId": sender_id,
            "timestamp": data.get("timestamp", ""),
            "payload": data.get("payload", {}),
        }, exclude=sender_id)

    elif msg_type == "heartbeat":
        # Update last-seen timestamp
        mgr = get_session_manager()
        session = mgr.get_session(session_id)
        if session and sender_id in session.players:
            session.players[sender_id].last_seen = time.monotonic()
    # All other message types are silently dropped — no free-form communication


async def _broadcast(
    session_id: str,
    message: dict[str, Any],
    exclude: str | None = None,
) -> None:
    """Broadcast a message to all connected players in a session."""
    conns = _connections.get(session_id, {})
    for pid, ws in list(conns.items()):
        if pid == exclude:
            continue
        try:
            await ws.send_json(message)
        except Exception:
            logger.warning("Failed to send to %s in session %s", pid, session_id)
            conns.pop(pid, None)
