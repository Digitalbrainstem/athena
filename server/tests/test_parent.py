from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestParentReports:
    async def test_weekly_report(self, client: AsyncClient, profile: dict, parent_token: str):
        resp = await client.get(
            f"/api/parent/reports/{profile['id']}",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["profile_id"] == profile["id"]
        assert "events_count" in data
        assert "strengths" in data

    async def test_report_requires_parent_token(self, client: AsyncClient, profile: dict):
        # No token
        resp = await client.get(f"/api/parent/reports/{profile['id']}")
        assert resp.status_code == 401

    async def test_report_rejects_player_token(self, client: AsyncClient, profile: dict):
        # Login as player
        login = await client.post("/api/auth/login", json={
            "profile_id": profile["id"],
        })
        player_token = login.json()["access_token"]

        resp = await client.get(
            f"/api/parent/reports/{profile['id']}",
            headers={"Authorization": f"Bearer {player_token}"},
        )
        assert resp.status_code == 401


class TestParentDashboard:
    async def test_dashboard(self, client: AsyncClient, profile: dict, parent_token: str):
        resp = await client.get(
            "/api/parent/dashboard",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "children" in data
        assert len(data["children"]) >= 1


class TestScreenTime:
    async def test_set_screen_time(self, client: AsyncClient, profile: dict, parent_token: str):
        resp = await client.put(
            f"/api/parent/screen-time/{profile['id']}",
            json={
                "daily_limit_minutes": 120,
                "break_interval_minutes": 25,
                "enabled": True,
            },
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["daily_limit_minutes"] == 120
        assert data["break_interval_minutes"] == 25
        assert data["enabled"] is True

    async def test_update_screen_time(self, client: AsyncClient, profile: dict, parent_token: str):
        # Set initial
        await client.put(
            f"/api/parent/screen-time/{profile['id']}",
            json={"daily_limit_minutes": 60},
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        # Update
        resp = await client.put(
            f"/api/parent/screen-time/{profile['id']}",
            json={"daily_limit_minutes": 90, "break_interval_minutes": 20},
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["daily_limit_minutes"] == 90

    async def test_screen_time_nonexistent_profile(self, client: AsyncClient, parent_token: str):
        resp = await client.put(
            "/api/parent/screen-time/ghost",
            json={"daily_limit_minutes": 60},
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 404

    async def test_screen_time_requires_parent_token(self, client: AsyncClient, profile: dict):
        resp = await client.put(
            f"/api/parent/screen-time/{profile['id']}",
            json={"daily_limit_minutes": 60},
        )
        assert resp.status_code == 401


class TestMasteryBreakdown:
    async def test_mastery_breakdown(self, client: AsyncClient, profile: dict, parent_token: str):
        # Upload some mastery data
        await client.post("/api/sync/upload", json={
            "profile_id": profile["id"],
            "mastery": [
                {"skill_id": "math.arithmetic", "level": 0.8, "retention_score": 0.7,
                 "transfer_score": 0.6, "depth_score": 0.5, "attempts": 20, "successes": 16,
                 "ease_factor": 2.5, "streak": 5, "interval_days": 10.0},
                {"skill_id": "math.geometry", "level": 0.4, "retention_score": 0.3,
                 "transfer_score": 0.2, "depth_score": 0.1, "attempts": 5, "successes": 2,
                 "ease_factor": 2.5, "streak": 1, "interval_days": 1.0},
                {"skill_id": "science.physics", "level": 0.6, "retention_score": 0.5,
                 "transfer_score": 0.4, "depth_score": 0.3, "attempts": 12, "successes": 8,
                 "ease_factor": 2.5, "streak": 3, "interval_days": 6.0},
            ],
        })

        resp = await client.get(
            f"/api/parent/mastery/{profile['id']}",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_skills"] == 3
        assert "math" in data["subjects"]
        assert "science" in data["subjects"]
        assert len(data["subjects"]["math"]) == 2


class TestParentAccessibility:
    async def test_get_accessibility_defaults(self, client: AsyncClient, profile: dict, parent_token: str):
        """New profile returns default accessibility settings."""
        resp = await client.get(
            f"/api/parent/accessibility/{profile['id']}",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["profile_id"] == profile["id"]
        a11y = data["accessibility_settings"]
        assert a11y["color_blind_mode"] == "none"
        assert a11y["high_contrast"] is False
        assert a11y["font_size"] == 100

    async def test_set_accessibility(self, client: AsyncClient, profile: dict, parent_token: str):
        """Parent can set accessibility settings for a child."""
        resp = await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={
                "color_blind_mode": "deuteranopia",
                "high_contrast": True,
                "reduced_motion": True,
                "font_size": 150,
                "font_family": "OpenDyslexic",
                "line_spacing": 2.0,
                "subtitles": True,
                "sound_captions": True,
                "one_switch_mode": False,
                "scan_speed": 1.0,
                "input_debounce": 50.0,
                "simplified_ui": True,
                "companion_speech_speed": 0.7,
            },
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "deuteranopia"
        assert a11y["high_contrast"] is True
        assert a11y["reduced_motion"] is True
        assert a11y["font_size"] == 150
        assert a11y["font_family"] == "OpenDyslexic"
        assert a11y["line_spacing"] == 2.0
        assert a11y["subtitles"] is True
        assert a11y["sound_captions"] is True
        assert a11y["simplified_ui"] is True
        assert a11y["companion_speech_speed"] == 0.7
        assert a11y["input_debounce"] == 50.0

    async def test_set_then_get_accessibility(self, client: AsyncClient, profile: dict, parent_token: str):
        """Verify SET then GET round-trip."""
        await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={
                "color_blind_mode": "tritanopia",
                "font_size": 175,
                "one_switch_mode": True,
                "scan_speed": 0.5,
            },
            headers={"Authorization": f"Bearer {parent_token}"},
        )

        resp = await client.get(
            f"/api/parent/accessibility/{profile['id']}",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "tritanopia"
        assert a11y["font_size"] == 175
        assert a11y["one_switch_mode"] is True
        assert a11y["scan_speed"] == 0.5

    async def test_accessibility_syncs_to_profile(self, client: AsyncClient, profile: dict, parent_token: str):
        """Settings set by parent are visible in the profile API."""
        await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={"high_contrast": True, "simplified_ui": True},
            headers={"Authorization": f"Bearer {parent_token}"},
        )

        resp = await client.get(f"/api/profiles/{profile['id']}")
        assert resp.status_code == 200
        a11y = resp.json()["accessibility_settings"]
        assert a11y["high_contrast"] is True
        assert a11y["simplified_ui"] is True

    async def test_accessibility_syncs_to_download(self, client: AsyncClient, profile: dict, parent_token: str):
        """Settings set by parent appear in sync download."""
        await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={"color_blind_mode": "protanopia", "subtitles": True},
            headers={"Authorization": f"Bearer {parent_token}"},
        )

        dl = await client.post("/api/sync/download", json={"profile_id": profile["id"]})
        a11y = dl.json()["accessibility_settings"]
        assert a11y["color_blind_mode"] == "protanopia"
        assert a11y["subtitles"] is True

    async def test_accessibility_requires_parent_token(self, client: AsyncClient, profile: dict):
        resp = await client.get(f"/api/parent/accessibility/{profile['id']}")
        assert resp.status_code == 401

        resp = await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={"high_contrast": True},
        )
        assert resp.status_code == 401

    async def test_accessibility_nonexistent_profile(self, client: AsyncClient, parent_token: str):
        resp = await client.get(
            "/api/parent/accessibility/ghost",
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 404

        resp = await client.put(
            "/api/parent/accessibility/ghost",
            json={"high_contrast": True},
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 404

    async def test_accessibility_validation(self, client: AsyncClient, profile: dict, parent_token: str):
        """Invalid values are rejected."""
        resp = await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={"font_size": 10},  # below min of 50
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 422

        resp = await client.put(
            f"/api/parent/accessibility/{profile['id']}",
            json={"color_blind_mode": "invalid"},
            headers={"Authorization": f"Bearer {parent_token}"},
        )
        assert resp.status_code == 422
