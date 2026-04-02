from __future__ import annotations

import os
import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.config import Settings, override_settings
from app.db.connection import close_db, init_db


@pytest.fixture(autouse=True)
def _test_settings(tmp_path):
    """Point every test at a fresh SQLite database."""
    db_path = str(tmp_path / f"test-{uuid.uuid4().hex[:8]}.db")
    settings = Settings(
        database_path=db_path,
        jwt_secret="test-secret-do-not-use-in-prod",
        bcrypt_cost=4,  # Fast for tests
        debug=True,
    )
    override_settings(settings)
    yield settings


@pytest_asyncio.fixture
async def db(_test_settings):
    conn = await init_db()
    yield conn
    await close_db()


@pytest_asyncio.fixture
async def client(db):
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def profile(client: AsyncClient) -> dict:
    """Create and return a test profile."""
    resp = await client.post("/api/profiles", json={"name": "Test Player"})
    assert resp.status_code == 201
    return resp.json()


@pytest_asyncio.fixture
async def parent_token(client: AsyncClient, profile: dict) -> str:
    """Set up parent auth and return a parent-scoped token."""
    # Setup parent auth
    resp = await client.post("/api/auth/setup", json={
        "profile_id": profile["id"],
        "auth_type": "parent",
        "credential": "parentpass123",
    })
    assert resp.status_code == 200

    # Login as parent
    resp = await client.post("/api/auth/parent", json={
        "profile_id": profile["id"],
        "password": "parentpass123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]
