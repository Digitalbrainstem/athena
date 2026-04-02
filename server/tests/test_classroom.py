from __future__ import annotations

import pytest
from httpx import AsyncClient


class TestCreateClassroom:
    async def test_create_classroom(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/classroom/create", json={
            "name": "5th Grade — Period 3",
            "teacher_profile_id": profile["id"],
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "5th Grade — Period 3"
        assert data["teacher_profile_id"] == profile["id"]
        assert data["status"] == "active"
        assert "id" in data

    async def test_create_classroom_rejects_empty_name(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/classroom/create", json={
            "name": "",
            "teacher_profile_id": profile["id"],
        })
        assert resp.status_code == 422

    async def test_create_classroom_rejects_missing_teacher(self, client: AsyncClient):
        resp = await client.post("/api/classroom/create", json={
            "name": "Test",
            "teacher_profile_id": "",
        })
        assert resp.status_code == 422


class TestStudentManagement:
    async def _create_classroom(self, client: AsyncClient, teacher_id: str) -> str:
        resp = await client.post("/api/classroom/create", json={
            "name": "Test Class",
            "teacher_profile_id": teacher_id,
        })
        return resp.json()["id"]

    async def _create_student(self, client: AsyncClient, name: str = "Student") -> str:
        resp = await client.post("/api/profiles", json={"name": name})
        return resp.json()["id"]

    async def test_add_student(self, client: AsyncClient, profile: dict):
        classroom_id = await self._create_classroom(client, profile["id"])
        student_id = await self._create_student(client, "Alex")

        resp = await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": student_id,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["student_profile_id"] == student_id
        assert data["name"] == "Alex"

    async def test_get_students(self, client: AsyncClient, profile: dict):
        classroom_id = await self._create_classroom(client, profile["id"])
        s1 = await self._create_student(client, "Alex")
        s2 = await self._create_student(client, "Jordan")

        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })
        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s2,
        })

        resp = await client.get(f"/api/classroom/{classroom_id}/students")
        assert resp.status_code == 200
        students = resp.json()["students"]
        assert len(students) == 2
        names = {s["name"] for s in students}
        assert names == {"Alex", "Jordan"}

    async def test_student_list_has_no_ranking(self, client: AsyncClient, profile: dict):
        """Verify no ranking or comparison data in student list."""
        classroom_id = await self._create_classroom(client, profile["id"])
        s1 = await self._create_student(client, "Alex")
        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })

        resp = await client.get(f"/api/classroom/{classroom_id}/students")
        students = resp.json()["students"]
        for s in students:
            assert "rank" not in s
            assert "percentile" not in s
            assert "class_average" not in s
            assert "compared_to" not in s

    async def test_student_has_no_pii_beyond_name(self, client: AsyncClient, profile: dict):
        """Only first name — no email, birth date, address, etc."""
        classroom_id = await self._create_classroom(client, profile["id"])
        s1 = await self._create_student(client, "Alex")
        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })

        resp = await client.get(f"/api/classroom/{classroom_id}/students")
        students = resp.json()["students"]
        for s in students:
            assert "name" in s
            assert "email" not in s
            assert "birth_date" not in s
            assert "address" not in s
            assert "phone" not in s

    async def test_duplicate_student_rejected(self, client: AsyncClient, profile: dict):
        classroom_id = await self._create_classroom(client, profile["id"])
        s1 = await self._create_student(client, "Alex")

        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })
        resp = await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })
        assert resp.status_code == 422

    async def test_remove_student(self, client: AsyncClient, profile: dict):
        classroom_id = await self._create_classroom(client, profile["id"])
        s1 = await self._create_student(client, "Alex")
        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": s1,
        })

        resp = await client.delete(f"/api/classroom/{classroom_id}/students/{s1}")
        assert resp.status_code == 200

        resp = await client.get(f"/api/classroom/{classroom_id}/students")
        assert len(resp.json()["students"]) == 0


class TestGroups:
    async def _setup(self, client: AsyncClient, teacher_id: str):
        resp = await client.post("/api/classroom/create", json={
            "name": "Test",
            "teacher_profile_id": teacher_id,
        })
        classroom_id = resp.json()["id"]

        student_ids = []
        for name in ["Alex", "Jordan", "Morgan"]:
            r = await client.post("/api/profiles", json={"name": name})
            sid = r.json()["id"]
            student_ids.append(sid)
            await client.post(f"/api/classroom/{classroom_id}/students", json={
                "student_profile_id": sid,
            })
        return classroom_id, student_ids

    async def test_create_group(self, client: AsyncClient, profile: dict):
        classroom_id, sids = await self._setup(client, profile["id"])

        resp = await client.post(f"/api/classroom/{classroom_id}/groups", json={
            "name": "Group A",
            "student_ids": sids[:2],
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Group A"
        assert len(data["student_ids"]) == 2

    async def test_get_groups(self, client: AsyncClient, profile: dict):
        classroom_id, sids = await self._setup(client, profile["id"])

        await client.post(f"/api/classroom/{classroom_id}/groups", json={
            "name": "Group A",
            "student_ids": sids[:2],
        })
        await client.post(f"/api/classroom/{classroom_id}/groups", json={
            "name": "Group B",
            "student_ids": sids[2:],
        })

        resp = await client.get(f"/api/classroom/{classroom_id}/groups")
        assert resp.status_code == 200
        groups = resp.json()["groups"]
        assert len(groups) == 2


class TestAssignments:
    async def _setup(self, client: AsyncClient, teacher_id: str):
        resp = await client.post("/api/classroom/create", json={
            "name": "Test",
            "teacher_profile_id": teacher_id,
        })
        return resp.json()["id"]

    async def test_assign_quest(self, client: AsyncClient, profile: dict):
        classroom_id = await self._setup(client, profile["id"])
        resp = await client.post(f"/api/classroom/{classroom_id}/assign/quest", json={
            "quest_id": "quest-fractions-101",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["quest_id"] == "quest-fractions-101"
        assert data["group_id"] is None

    async def test_assign_focus(self, client: AsyncClient, profile: dict):
        classroom_id = await self._setup(client, profile["id"])
        resp = await client.post(f"/api/classroom/{classroom_id}/assign/focus", json={
            "skills": ["math.fractions", "math.decimals"],
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["skills"] == ["math.fractions", "math.decimals"]


class TestDashboard:
    async def _setup_with_students(self, client: AsyncClient, teacher_id: str):
        resp = await client.post("/api/classroom/create", json={
            "name": "Dashboard Test",
            "teacher_profile_id": teacher_id,
        })
        classroom_id = resp.json()["id"]

        for name in ["Alex", "Jordan"]:
            r = await client.post("/api/profiles", json={"name": name})
            sid = r.json()["id"]
            await client.post(f"/api/classroom/{classroom_id}/students", json={
                "student_profile_id": sid,
            })
        return classroom_id

    async def test_get_dashboard(self, client: AsyncClient, profile: dict):
        classroom_id = await self._setup_with_students(client, profile["id"])

        resp = await client.get(f"/api/classroom/{classroom_id}/dashboard")
        assert resp.status_code == 200
        data = resp.json()
        assert data["classroom_id"] == classroom_id
        assert data["total_students"] == 2
        assert "students" in data
        assert "subject_breakdown" in data

    async def test_dashboard_has_no_raw_events(self, client: AsyncClient, profile: dict):
        """Teacher dashboard NEVER exposes raw learning events."""
        classroom_id = await self._setup_with_students(client, profile["id"])

        resp = await client.get(f"/api/classroom/{classroom_id}/dashboard")
        data = resp.json()
        assert "learning_events" not in data
        assert "events" not in data
        assert "raw_events" not in data
        for student in data["students"]:
            assert "events" not in student
            assert "learning_events" not in student

    async def test_dashboard_has_no_ranking(self, client: AsyncClient, profile: dict):
        """No ranking or comparison between students."""
        classroom_id = await self._setup_with_students(client, profile["id"])

        resp = await client.get(f"/api/classroom/{classroom_id}/dashboard")
        data = resp.json()
        assert "ranking" not in data
        assert "leaderboard" not in data
        for student in data["students"]:
            assert "rank" not in student
            assert "percentile" not in student


class TestReports:
    async def test_get_report(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/classroom/create", json={
            "name": "Report Test",
            "teacher_profile_id": profile["id"],
        })
        classroom_id = resp.json()["id"]

        # Add a student
        s = await client.post("/api/profiles", json={"name": "Alex"})
        sid = s.json()["id"]
        await client.post(f"/api/classroom/{classroom_id}/students", json={
            "student_profile_id": sid,
        })

        resp = await client.get(f"/api/classroom/{classroom_id}/reports")
        assert resp.status_code == 200
        report = resp.json()
        assert report["classroom_id"] == classroom_id
        assert "generated_at" in report
        assert "subject_breakdown" in report
        assert "recommendations" in report

    async def test_report_has_no_student_comparison(self, client: AsyncClient, profile: dict):
        """Report never ranks or compares students."""
        resp = await client.post("/api/classroom/create", json={
            "name": "Report Test",
            "teacher_profile_id": profile["id"],
        })
        classroom_id = resp.json()["id"]

        resp = await client.get(f"/api/classroom/{classroom_id}/reports")
        report = resp.json()
        assert "student_ranking" not in report
        assert "top_performers" not in report
        assert "bottom_performers" not in report


class TestSettings:
    async def test_update_settings(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/classroom/create", json={
            "name": "Settings Test",
            "teacher_profile_id": profile["id"],
        })
        classroom_id = resp.json()["id"]

        resp = await client.put(f"/api/classroom/{classroom_id}/settings", json={
            "time_limit_minutes": 45,
            "status": "paused",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "paused"
        assert data["time_limit_minutes"] == 45

    async def test_invalid_status_rejected(self, client: AsyncClient, profile: dict):
        resp = await client.post("/api/classroom/create", json={
            "name": "Test",
            "teacher_profile_id": profile["id"],
        })
        classroom_id = resp.json()["id"]

        resp = await client.put(f"/api/classroom/{classroom_id}/settings", json={
            "status": "invalid",
        })
        assert resp.status_code == 422
