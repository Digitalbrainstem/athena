from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestLogin:
    async def test_login_no_auth_required(self, client: AsyncClient, profile: dict):
        """Profiles without auth set can login freely."""
        resp = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["profile_id"] == profile["id"]
        assert data["scope"] == "player"
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_login_with_pin(self, client: AsyncClient, profile: dict):
        # Setup PIN
        await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "1234",
        })

        # Login with correct PIN
        resp = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
            "pin": "1234",
        })
        assert resp.status_code == 200
        assert resp.json()["scope"] == "player"

    async def test_login_wrong_pin(self, client: AsyncClient, profile: dict):
        await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "1234",
        })

        resp = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
            "pin": "9999",
        })
        assert resp.status_code == 401

    async def test_login_missing_pin(self, client: AsyncClient, profile: dict):
        await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "5678",
        })

        resp = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
        })
        assert resp.status_code == 401

    async def test_login_nonexistent_profile(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", json={
            "profile_id": "does-not-exist",
        })
        assert resp.status_code == 404


class TestRefresh:
    async def test_refresh_token(self, client: AsyncClient, profile: dict):
        login = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
        })
        refresh_token = login.json()["refresh_token"]

        resp = await client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_refresh_with_access_token_fails(self, client: AsyncClient, profile: dict):
        login = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
        })
        access_token = login.json()["access_token"]

        resp = await client.post("/api/auth/refresh", json={
            "refresh_token": access_token,
        })
        assert resp.status_code == 401

    async def test_refresh_invalid_token(self, client: AsyncClient):
        resp = await client.post("/api/auth/refresh", json={
            "refresh_token": "garbage.token.value",
        })
        assert resp.status_code == 401


class TestParentAuth:
    async def test_parent_login(self, client: AsyncClient, profile: dict):
        await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "parent",
            "credential": "securepass1",
        })

        resp = await client.post("/api/auth/parent", json={
            "profile_id": profile["id"],
            "password": "securepass1",
        })
        assert resp.status_code == 200
        assert resp.json()["scope"] == "parent"

    async def test_parent_login_wrong_password(self, client: AsyncClient, profile: dict):
        await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "parent",
            "credential": "securepass1",
        })

        resp = await client.post("/api/auth/parent", json={
            "profile_id": profile["id"],
            "password": "wrongpass00",
        })
        assert resp.status_code == 401

    async def test_parent_login_no_parent_auth(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/auth/parent", json={
            "profile_id": profile["id"],
            "password": "anything123",
        })
        assert resp.status_code == 401


class TestSetupAuth:
    async def test_setup_pin(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "4567",
        })
        assert resp.status_code == 200
        assert resp.json()["auth_type"] == "pin"

    async def test_setup_pin_too_short(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "12",
        })
        assert resp.status_code == 401  # AuthError from validate_pin

    async def test_setup_pin_not_digits(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "pin",
            "credential": "abcd",
        })
        assert resp.status_code == 401

    async def test_setup_password_too_short(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/auth/setup", json={
            "profile_id": profile["id"],
            "auth_type": "password",
            "credential": "short",
        })
        assert resp.status_code == 401

    async def test_setup_nonexistent_profile(self, client: AsyncClient):
        resp = await client.post("/api/auth/setup", json={
            "profile_id": "ghost",
            "auth_type": "pin",
            "credential": "1234",
        })
        assert resp.status_code == 404
