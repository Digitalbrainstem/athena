from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from app.db.connection import get_db

logger = logging.getLogger("nexus.classroom")


class ClassroomService:
    """Server-side classroom management.

    Privacy rules (enforced):
    - Teacher sees mastery data, NEVER raw learning events
    - Students never see each other's data
    - No ranking, no comparison, no "class average" visible to students
    - Only first names — no PII beyond that
    """

    # --- Classroom lifecycle ---

    async def create_classroom(self, name: str, teacher_profile_id: str) -> dict:
        """Create a new classroom session."""
        db = await get_db()
        import uuid

        classroom_id = uuid.uuid4().hex[:12]
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        await db.execute(
            "INSERT INTO classrooms (id, name, teacher_profile_id, status, created_at, last_activity) "
            "VALUES (?, ?, ?, 'active', ?, ?)",
            (classroom_id, name.strip(), teacher_profile_id, now, now),
        )
        await db.commit()

        return {
            "id": classroom_id,
            "name": name.strip(),
            "teacher_profile_id": teacher_profile_id,
            "status": "active",
            "created_at": now,
            "last_activity": now,
            "students": [],
            "groups": [],
        }

    async def get_classroom(self, classroom_id: str) -> dict | None:
        db = await get_db()
        cur = await db.execute("SELECT * FROM classrooms WHERE id = ?", (classroom_id,))
        row = await cur.fetchone()
        if row is None:
            return None
        return dict(row)

    # --- Student management ---

    async def add_student(
        self,
        classroom_id: str,
        student_profile_id: str,
    ) -> dict:
        """Add a student to a classroom (uses profile name from profiles table)."""
        db = await get_db()

        # Verify classroom exists
        cr = await db.execute("SELECT * FROM classrooms WHERE id = ?", (classroom_id,))
        classroom = await cr.fetchone()
        if classroom is None:
            raise ValueError("Classroom not found")

        # Check capacity
        cnt_cur = await db.execute(
            "SELECT COUNT(*) FROM classroom_students WHERE classroom_id = ?",
            (classroom_id,),
        )
        count = (await cnt_cur.fetchone())[0]
        if count >= 30:
            raise ValueError("Classroom is full (max 30 students)")

        # Check duplicate
        dup_cur = await db.execute(
            "SELECT 1 FROM classroom_students WHERE classroom_id = ? AND student_profile_id = ?",
            (classroom_id, student_profile_id),
        )
        if await dup_cur.fetchone():
            raise ValueError("Student already in classroom")

        # Get student name from profiles (first name only)
        prof_cur = await db.execute(
            "SELECT name FROM profiles WHERE id = ?", (student_profile_id,)
        )
        prof = await prof_cur.fetchone()
        if prof is None:
            raise ValueError("Student profile not found")

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        await db.execute(
            "INSERT INTO classroom_students (classroom_id, student_profile_id, joined_at) "
            "VALUES (?, ?, ?)",
            (classroom_id, student_profile_id, now),
        )
        await db.execute(
            "UPDATE classrooms SET last_activity = ? WHERE id = ?",
            (now, classroom_id),
        )
        await db.commit()

        return {
            "classroom_id": classroom_id,
            "student_profile_id": student_profile_id,
            "name": prof["name"],
            "joined_at": now,
        }

    async def remove_student(self, classroom_id: str, student_profile_id: str) -> None:
        db = await get_db()
        cur = await db.execute(
            "DELETE FROM classroom_students WHERE classroom_id = ? AND student_profile_id = ?",
            (classroom_id, student_profile_id),
        )
        if cur.rowcount == 0:
            raise ValueError("Student not in classroom")

        # Also remove from groups
        await db.execute(
            "DELETE FROM classroom_group_members WHERE student_profile_id = ? "
            "AND group_id IN (SELECT id FROM classroom_groups WHERE classroom_id = ?)",
            (student_profile_id, classroom_id),
        )
        await db.commit()

    async def get_students(self, classroom_id: str) -> list[dict]:
        """Get student roster with mastery tier — NO raw events, NO ranking."""
        db = await get_db()
        cur = await db.execute(
            "SELECT cs.student_profile_id, p.name, p.mastery_tier, cs.joined_at "
            "FROM classroom_students cs "
            "JOIN profiles p ON cs.student_profile_id = p.id "
            "WHERE cs.classroom_id = ? "
            "ORDER BY p.name",
            (classroom_id,),
        )
        rows = await cur.fetchall()
        return [
            {
                "profile_id": r["student_profile_id"],
                "name": r["name"],
                "mastery_tier": r["mastery_tier"],
                "joined_at": r["joined_at"],
            }
            for r in rows
        ]

    # --- Groups ---

    async def create_group(
        self, classroom_id: str, name: str, student_ids: list[str]
    ) -> dict:
        db = await get_db()
        import uuid

        group_id = uuid.uuid4().hex[:12]
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        await db.execute(
            "INSERT INTO classroom_groups (id, classroom_id, name, created_at) VALUES (?, ?, ?, ?)",
            (group_id, classroom_id, name.strip(), now),
        )

        for sid in student_ids:
            await db.execute(
                "INSERT OR IGNORE INTO classroom_group_members (group_id, student_profile_id) "
                "VALUES (?, ?)",
                (group_id, sid),
            )

        await db.commit()

        return {
            "id": group_id,
            "classroom_id": classroom_id,
            "name": name.strip(),
            "student_ids": student_ids,
        }

    async def get_groups(self, classroom_id: str) -> list[dict]:
        db = await get_db()
        cur = await db.execute(
            "SELECT * FROM classroom_groups WHERE classroom_id = ? ORDER BY name",
            (classroom_id,),
        )
        groups = []
        for row in await cur.fetchall():
            m_cur = await db.execute(
                "SELECT student_profile_id FROM classroom_group_members WHERE group_id = ?",
                (row["id"],),
            )
            members = [r["student_profile_id"] for r in await m_cur.fetchall()]
            groups.append({
                "id": row["id"],
                "name": row["name"],
                "student_ids": members,
            })
        return groups

    # --- Assignments ---

    async def assign_quest(
        self, classroom_id: str, quest_id: str, group_id: str | None = None
    ) -> dict:
        db = await get_db()
        import uuid

        assignment_id = uuid.uuid4().hex[:12]
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        await db.execute(
            "INSERT INTO classroom_assignments (id, classroom_id, assignment_type, quest_id, group_id, assigned_at) "
            "VALUES (?, ?, 'quest', ?, ?, ?)",
            (assignment_id, classroom_id, quest_id, group_id, now),
        )
        await db.commit()

        return {
            "id": assignment_id,
            "classroom_id": classroom_id,
            "quest_id": quest_id,
            "group_id": group_id,
            "assigned_at": now,
        }

    async def assign_focus(
        self, classroom_id: str, skills: list[str], group_id: str | None = None
    ) -> dict:
        db = await get_db()
        import json
        import uuid

        assignment_id = uuid.uuid4().hex[:12]
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        await db.execute(
            "INSERT INTO classroom_assignments (id, classroom_id, assignment_type, skills_json, group_id, assigned_at) "
            "VALUES (?, ?, 'focus', ?, ?, ?)",
            (assignment_id, classroom_id, json.dumps(skills), group_id, now),
        )
        await db.commit()

        return {
            "id": assignment_id,
            "classroom_id": classroom_id,
            "skills": skills,
            "group_id": group_id,
            "assigned_at": now,
        }

    # --- Dashboard data (aggregated, privacy-safe) ---

    async def get_dashboard(self, classroom_id: str) -> dict:
        """Teacher dashboard — aggregated mastery, NEVER raw events."""
        db = await get_db()

        # Classroom info
        cr = await db.execute("SELECT * FROM classrooms WHERE id = ?", (classroom_id,))
        classroom = await cr.fetchone()
        if classroom is None:
            raise ValueError("Classroom not found")

        students = await self.get_students(classroom_id)

        # Aggregated mastery per subject
        subject_mastery: dict[str, dict] = {}
        for student in students:
            m_cur = await db.execute(
                "SELECT skill_id, level FROM mastery WHERE profile_id = ?",
                (student["profile_id"],),
            )
            for row in await m_cur.fetchall():
                skill_id = row["skill_id"]
                subject = skill_id.split(".")[0] if "." in skill_id else skill_id
                if subject not in subject_mastery:
                    subject_mastery[subject] = {
                        "subject": subject,
                        "total_level": 0.0,
                        "count": 0,
                        "at_mastery": 0,
                        "below_mastery": 0,
                    }
                sm = subject_mastery[subject]
                sm["total_level"] += row["level"]
                sm["count"] += 1
                if row["level"] >= 0.7:
                    sm["at_mastery"] += 1
                else:
                    sm["below_mastery"] += 1

        # Compute averages
        subject_breakdown = []
        for sm in subject_mastery.values():
            avg = sm["total_level"] / sm["count"] if sm["count"] > 0 else 0
            subject_breakdown.append({
                "subject": sm["subject"],
                "average_mastery": round(avg, 2),
                "students_at_mastery": sm["at_mastery"],
                "students_below_mastery": sm["below_mastery"],
            })

        # Common gaps (>40% struggling)
        total = len(students)
        threshold = max(1, int(total * 0.4))
        common_gaps = [
            s["subject"]
            for s in subject_breakdown
            if s["students_below_mastery"] >= threshold
        ]

        # Top strengths (>60% mastered)
        strength_threshold = max(1, int(total * 0.6))
        top_strengths = [
            s["subject"]
            for s in subject_breakdown
            if s["students_at_mastery"] >= strength_threshold
        ]

        return {
            "classroom_id": classroom_id,
            "name": classroom["name"],
            "status": classroom["status"],
            "total_students": total,
            "subject_breakdown": subject_breakdown,
            "common_gaps": common_gaps,
            "top_strengths": top_strengths,
            "students": students,
        }

    # --- Reports ---

    async def get_class_report(self, classroom_id: str) -> dict:
        """Mastery report for the class — privacy-safe, no ranking."""
        dashboard = await self.get_dashboard(classroom_id)

        recommendations = []
        if dashboard["common_gaps"]:
            recommendations.append(
                f"Consider focusing on {dashboard['common_gaps'][0]} — many students need support."
            )
        if dashboard["top_strengths"]:
            recommendations.append(
                f"The class excels at {dashboard['top_strengths'][0]} — consider advancing to harder challenges."
            )

        return {
            "classroom_id": classroom_id,
            "classroom_name": dashboard["name"],
            "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            "total_students": dashboard["total_students"],
            "subject_breakdown": dashboard["subject_breakdown"],
            "common_gaps": dashboard["common_gaps"],
            "top_strengths": dashboard["top_strengths"],
            "recommendations": recommendations,
        }

    # --- Settings ---

    async def update_settings(
        self,
        classroom_id: str,
        time_limit_minutes: int | None = None,
        status: str | None = None,
    ) -> dict:
        db = await get_db()
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        updates = {"last_activity": now}
        if time_limit_minutes is not None:
            updates["time_limit_minutes"] = time_limit_minutes
        if status is not None:
            if status not in ("active", "paused", "ended"):
                raise ValueError(f"Invalid status: {status}")
            updates["status"] = status

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [classroom_id]
        await db.execute(
            f"UPDATE classrooms SET {set_clause} WHERE id = ?", values  # noqa: S608
        )
        await db.commit()

        return await self.get_classroom(classroom_id) or {}
