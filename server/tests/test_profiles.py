from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestCreateProfile:
    async def test_create_profile(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={"name": "Alice"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Alice"
        assert data["mastery_tier"] == "foundation"
        assert data["id"]
        assert data["created_at"]

    async def test_create_profile_with_optional_fields(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={
            "name": "Bob",
            "avatar_data": '{"color":"blue"}',
            "birth_date": "2020-01-15",
            "settings": {"theme": "dark"},
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Bob"
        assert data["birth_date"] == "2020-01-15"
        assert data["settings"] == {"theme": "dark"}

    async def test_create_profile_empty_name(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={"name": ""})
        assert resp.status_code == 422


class TestGetProfile:
    async def test_get_profile(self, client: AsyncClient, profile: dict):
        resp = await client.get(f"/api/profiles/{profile['id']}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Test Player"

    async def test_get_nonexistent(self, client: AsyncClient):
        resp = await client.get("/api/profiles/nonexistent")
        assert resp.status_code == 404


class TestUpdateProfile:
    async def test_update_name(self, client: AsyncClient, profile: dict):
        resp = await client.put(f"/api/profiles/{profile['id']}", json={
            "name": "Updated Name",
        })
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    async def test_update_mastery_tier(self, client: AsyncClient, profile: dict):
        resp = await client.put(f"/api/profiles/{profile['id']}", json={
            "mastery_tier": "discovery",
        })
        assert resp.status_code == 200
        assert resp.json()["mastery_tier"] == "discovery"

    async def test_update_invalid_tier(self, client: AsyncClient, profile: dict):
        resp = await client.put(f"/api/profiles/{profile['id']}", json={
            "mastery_tier": "legendary",
        })
        assert resp.status_code == 422

    async def test_update_nonexistent(self, client: AsyncClient):
        resp = await client.put("/api/profiles/ghost", json={"name": "X"})
        assert resp.status_code == 404


class TestListProfiles:
    async def test_list_empty(self, client: AsyncClient):
        resp = await client.get("/api/profiles")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 0
        assert data["items"] == []

    async def test_list_with_profiles(self, client: AsyncClient):
        await client.post("/api/profiles", json={"name": "A"})
        await client.post("/api/profiles", json={"name": "B"})
        await client.post("/api/profiles", json={"name": "C"})

        resp = await client.get("/api/profiles")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    async def test_pagination(self, client: AsyncClient):
        for i in range(5):
            await client.post("/api/profiles", json={"name": f"Player {i}"})

        resp = await client.get("/api/profiles?offset=0&limit=2")
        data = resp.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5
        assert data["offset"] == 0
        assert data["limit"] == 2

        resp2 = await client.get("/api/profiles?offset=2&limit=2")
        data2 = resp2.json()
        assert len(data2["items"]) == 2
        assert data2["offset"] == 2
