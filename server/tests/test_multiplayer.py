from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.services.session import SessionManager, GameSession


# ---------------------------------------------------------------------------
# Unit tests for SessionManager
# ---------------------------------------------------------------------------


class TestSessionManager:
    def setup_method(self):
        self.mgr = SessionManager()

    def test_create_session(self):
        session = self.mgr.create_session("host-1", "Alex")
        assert session.id
        assert session.host_profile_id == "host-1"
        assert session.host_name == "Alex"
        assert session.player_count == 1
        assert session.status == "waiting"

    def test_list_sessions(self):
        self.mgr.create_session("host-1", "Alex")
        sessions = self.mgr.list_sessions()
        assert len(sessions) == 1
        assert sessions[0]["hostName"] == "Alex"
        assert sessions[0]["maxPlayers"] == 4

    def test_join_session(self):
        session = self.mgr.create_session("host-1", "Alex")
        ok, reason, updated = self.mgr.join_session(session.id, "p2", "Maya")
        assert ok is True
        assert reason == "ok"
        assert updated is not None
        assert updated.player_count == 2

    def test_join_full_session(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        self.mgr.join_session(session.id, "p3", "Jordan")
        self.mgr.join_session(session.id, "p4", "Sam")
        ok, reason, _ = self.mgr.join_session(session.id, "p5", "Kai")
        assert ok is False
        assert "full" in reason.lower()

    def test_join_nonexistent_session(self):
        ok, reason, _ = self.mgr.join_session("bogus", "p1", "X")
        assert ok is False
        assert "not found" in reason.lower()

    def test_leave_session(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        updated = self.mgr.leave_session(session.id, "p2")
        assert updated is not None
        assert updated.player_count == 1

    def test_leave_all_ends_session(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.leave_session(session.id, "host-1")
        assert session.status == "completed"

    def test_completed_sessions_not_listed(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.leave_session(session.id, "host-1")
        sessions = self.mgr.list_sessions()
        assert len(sessions) == 0

    def test_reconnect_existing_player(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        self.mgr.leave_session(session.id, "p2")
        assert session.player_count == 1
        ok, _, _ = self.mgr.join_session(session.id, "p2", "Maya")
        assert ok is True
        assert session.player_count == 2

    def test_start_quest(self):
        session = self.mgr.create_session("host-1", "Alex")
        objectives = [
            {"description": "Build the arch", "screenReaderText": "Build the arch"},
            {"description": "Gather materials", "screenReaderText": "Gather materials"},
        ]
        result = self.mgr.start_quest(session.id, "quest-1", "Bridge Quest", objectives)
        assert result is not None
        assert result.status == "active"
        assert result.shared_quest is not None
        assert len(result.shared_quest.objectives) == 2

    def test_claim_objective(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
        ])
        obj = self.mgr.claim_objective(session.id, 0, "host-1")
        assert obj is not None
        assert obj.assigned_to == "host-1"
        assert obj.status == "active"

    def test_claim_already_claimed_objective(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
        ])
        self.mgr.claim_objective(session.id, 0, "host-1")
        obj = self.mgr.claim_objective(session.id, 0, "p2")
        assert obj is None  # Cannot claim already-claimed

    def test_complete_objective(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
        ])
        self.mgr.claim_objective(session.id, 0, "host-1")
        obj = self.mgr.complete_objective(session.id, 0, "host-1")
        assert obj is not None
        assert obj.status == "completed"

    def test_complete_objective_wrong_player(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
        ])
        self.mgr.claim_objective(session.id, 0, "host-1")
        obj = self.mgr.complete_objective(session.id, 0, "p2")
        assert obj is None

    def test_quest_completion(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
            {"description": "Task B"},
        ])
        self.mgr.claim_objective(session.id, 0, "host-1")
        self.mgr.claim_objective(session.id, 1, "host-1")
        self.mgr.complete_objective(session.id, 0, "host-1")
        self.mgr.complete_objective(session.id, 1, "host-1")
        assert session.status == "completed"
        assert session.shared_quest.completed_at is not None

    def test_contributions_tracked(self):
        session = self.mgr.create_session("host-1", "Alex")
        self.mgr.join_session(session.id, "p2", "Maya")
        self.mgr.start_quest(session.id, "q1", "Quest", [
            {"description": "Task A"},
            {"description": "Task B"},
        ])
        self.mgr.claim_objective(session.id, 0, "host-1")
        self.mgr.claim_objective(session.id, 1, "p2")
        self.mgr.complete_objective(session.id, 0, "host-1")
        self.mgr.complete_objective(session.id, 1, "p2")
        assert "Task A" in session.shared_quest.contributions["host-1"]
        assert "Task B" in session.shared_quest.contributions["p2"]

    def test_session_to_discovery_dict(self):
        session = self.mgr.create_session("host-1", "Alex")
        d = session.to_discovery_dict()
        assert d["hostName"] == "Alex"
        assert d["playerCount"] == 1
        assert d["maxPlayers"] == 4

    def test_session_to_state_dict(self):
        session = self.mgr.create_session("host-1", "Alex")
        d = session.to_state_dict()
        assert d["id"] == session.id
        assert d["status"] == "waiting"
        assert len(d["players"]) == 1


# ---------------------------------------------------------------------------
# API integration tests
# ---------------------------------------------------------------------------

@pytest.fixture
def session_manager():
    return SessionManager()


@pytest.fixture
def app_with_multiplayer(session_manager):
    from app.api.multiplayer import set_session_manager
    set_session_manager(session_manager)

    from fastapi import FastAPI
    from app.api.multiplayer import router

    test_app = FastAPI()
    test_app.include_router(router)
    return test_app


@pytest.fixture
async def mp_client(app_with_multiplayer):
    transport = ASGITransport(app=app_with_multiplayer)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestMultiplayerAPI:
    async def test_list_sessions_empty(self, mp_client: AsyncClient):
        resp = await mp_client.get("/api/multiplayer/sessions")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_create_session(self, mp_client: AsyncClient):
        resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["hostProfileId"] == "host-1"
        assert data["status"] == "waiting"
        assert len(data["players"]) == 1

    async def test_create_and_list(self, mp_client: AsyncClient):
        await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        resp = await mp_client.get("/api/multiplayer/sessions")
        data = resp.json()
        assert len(data) == 1
        assert data[0]["hostName"] == "Alex"

    async def test_join_session(self, mp_client: AsyncClient):
        create_resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        session_id = create_resp.json()["id"]

        join_resp = await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/join",
            json={"profile_id": "p2", "display_name": "Maya"},
        )
        assert join_resp.status_code == 200
        data = join_resp.json()
        assert len(data["players"]) == 2

    async def test_leave_session(self, mp_client: AsyncClient):
        create_resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        session_id = create_resp.json()["id"]

        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/join",
            json={"profile_id": "p2", "display_name": "Maya"},
        )
        leave_resp = await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/leave",
            json={"profile_id": "p2", "display_name": "Maya"},
        )
        assert leave_resp.status_code == 200
        assert leave_resp.json()["status"] == "ok"

    async def test_start_quest(self, mp_client: AsyncClient):
        create_resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        session_id = create_resp.json()["id"]

        quest_resp = await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/quest",
            json={
                "quest_id": "q1",
                "quest_title": "Bridge Quest",
                "objectives": [
                    {"description": "Build arch", "screenReaderText": "Build arch"},
                    {"description": "Test load", "screenReaderText": "Test load"},
                ],
            },
        )
        assert quest_resp.status_code == 200
        data = quest_resp.json()
        assert data["status"] == "active"
        assert data["sharedQuest"]["questId"] == "q1"

    async def test_claim_and_complete_objective(self, mp_client: AsyncClient):
        create_resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        session_id = create_resp.json()["id"]

        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/quest",
            json={
                "quest_id": "q1",
                "quest_title": "Quest",
                "objectives": [{"description": "Task A", "screenReaderText": "Task A"}],
            },
        )

        claim_resp = await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/claim",
            json={"objective_index": 0, "profile_id": "host-1"},
        )
        assert claim_resp.status_code == 200
        assert claim_resp.json()["objective"]["assignedTo"] == "host-1"

        complete_resp = await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/complete",
            json={"objective_index": 0, "profile_id": "host-1"},
        )
        assert complete_resp.status_code == 200
        assert complete_resp.json()["objective"]["status"] == "completed"

    async def test_full_cooperative_flow(self, mp_client: AsyncClient):
        """End-to-end: create session, join, start quest, complete together."""
        # Host creates session
        create_resp = await mp_client.post("/api/multiplayer/sessions", json={
            "profile_id": "host-1",
            "display_name": "Alex",
        })
        session_id = create_resp.json()["id"]

        # Player 2 joins
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/join",
            json={"profile_id": "p2", "display_name": "Maya"},
        )

        # Start shared quest with 2 objectives
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/quest",
            json={
                "quest_id": "q-dam",
                "quest_title": "Build the Dam",
                "objectives": [
                    {"description": "Design structure", "screenReaderText": "Design structure"},
                    {"description": "Calculate flow", "screenReaderText": "Calculate flow"},
                ],
            },
        )

        # Each player claims an objective
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/claim",
            json={"objective_index": 0, "profile_id": "host-1"},
        )
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/claim",
            json={"objective_index": 1, "profile_id": "p2"},
        )

        # Both complete their objectives
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/complete",
            json={"objective_index": 0, "profile_id": "host-1"},
        )
        await mp_client.post(
            f"/api/multiplayer/sessions/{session_id}/objectives/complete",
            json={"objective_index": 1, "profile_id": "p2"},
        )

        # Verify session is complete
        get_resp = await mp_client.get(f"/api/multiplayer/sessions/{session_id}")
        data = get_resp.json()
        assert data["status"] == "completed"
        assert data["sharedQuest"]["completedAt"] is not None


# ---------------------------------------------------------------------------
# Safety invariant tests
# ---------------------------------------------------------------------------


class TestSafetyInvariants:
    """Verify child-safety constraints are enforced architecturally."""

    def test_max_players_is_four(self):
        from app.services.session import MAX_PLAYERS_PER_SESSION
        assert MAX_PLAYERS_PER_SESSION == 4

    def test_no_chat_endpoint_exists(self, app_with_multiplayer):
        """No endpoint path contains 'chat', 'voice', or 'message'."""
        routes = [r.path for r in app_with_multiplayer.routes]
        for route in routes:
            assert "chat" not in route.lower()
            assert "voice" not in route.lower()
            assert "message" not in route.lower()
            assert "image" not in route.lower()

    def test_session_manager_has_no_direct_messaging(self):
        """SessionManager has no method for sending text between players."""
        mgr = SessionManager()
        public_methods = [m for m in dir(mgr) if not m.startswith("_")]
        for method in public_methods:
            assert "chat" not in method.lower()
            assert "message" not in method.lower()
            assert "voice" not in method.lower()
