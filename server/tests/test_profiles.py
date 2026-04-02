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


class TestAccessibilityInProfiles:
    async def test_create_profile_with_accessibility(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={
            "name": "A11y Player",
            "accessibility_settings": {
                "color_blind_mode": "deuteranopia",
                "high_contrast": True,
                "reduced_motion": True,
                "font_size": 150,
                "subtitles": True,
                "one_switch_mode": True,
                "scan_speed": 0.5,
            },
        })
        assert resp.status_code == 201
        data = resp.json()
        a11y = data["accessibility_settings"]
        assert a11y["color_blind_mode"] == "deuteranopia"
        assert a11y["high_contrast"] is True
        assert a11y["reduced_motion"] is True
        assert a11y["font_size"] == 150
        assert a11y["subtitles"] is True
        assert a11y["one_switch_mode"] is True
        assert a11y["scan_speed"] == 0.5

    async def test_create_profile_without_accessibility(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={"name": "No A11y"})
        assert resp.status_code == 201
        assert resp.json()["accessibility_settings"] is None

    async def test_update_accessibility_settings(self, client: AsyncClient, profile: dict):
        resp = await client.put(f"/api/profiles/{profile['id']}", json={
            "accessibility_settings": {
                "color_blind_mode": "protanopia",
                "font_size": 175,
                "sound_captions": True,
                "companion_speech_speed": 0.8,
            },
        })
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "protanopia"
        assert a11y["font_size"] == 175
        assert a11y["sound_captions"] is True
        assert a11y["companion_speech_speed"] == 0.8

    async def test_get_profile_returns_accessibility(self, client: AsyncClient, profile: dict):
        # Set accessibility first
        await client.put(f"/api/profiles/{profile['id']}", json={
            "accessibility_settings": {
                "high_contrast": True,
                "simplified_ui": True,
            },
        })

        resp = await client.get(f"/api/profiles/{profile['id']}")
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["high_contrast"] is True
        assert a11y["simplified_ui"] is True

    async def test_accessibility_validation_font_size_bounds(self, client: AsyncClient):
        # font_size too small
        resp = await client.post("/api/profiles", json={
            "name": "Bad Font",
            "accessibility_settings": {"font_size": 10},
        })
        assert resp.status_code == 422

        # font_size too large
        resp = await client.post("/api/profiles", json={
            "name": "Bad Font",
            "accessibility_settings": {"font_size": 300},
        })
        assert resp.status_code == 422

    async def test_accessibility_validation_color_blind_mode(self, client: AsyncClient):
        resp = await client.post("/api/profiles", json={
            "name": "Bad Mode",
            "accessibility_settings": {"color_blind_mode": "invalid"},
        })
        assert resp.status_code == 422

    async def test_accessibility_defaults(self, client: AsyncClient):
        """When created with empty accessibility_settings, defaults are applied."""
        resp = await client.post("/api/profiles", json={
            "name": "Defaults",
            "accessibility_settings": {},
        })
        assert resp.status_code == 201
        a11y = resp.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "none"
        assert a11y["high_contrast"] is False
        assert a11y["reduced_motion"] is False
        assert a11y["font_size"] == 100
        assert a11y["font_family"] == "default"
        assert a11y["line_spacing"] == 1.4
        assert a11y["subtitles"] is False
        assert a11y["sound_captions"] is False
        assert a11y["one_switch_mode"] is False
        assert a11y["scan_speed"] == 1.0
        assert a11y["input_debounce"] == 0.0
        assert a11y["simplified_ui"] is False
        assert a11y["companion_speech_speed"] == 1.0
