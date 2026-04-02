from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone

from app.db.connection import get_db

logger = logging.getLogger("nexus.reports")


class ReportService:
    """Generate parent-facing progress reports."""

    async def weekly_report(self, profile_id: str) -> dict:
        """Build a weekly progress summary for a single child."""
        db = await get_db()
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")

        # Profile info
        prof_cur = await db.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
        profile = await prof_cur.fetchone()
        if profile is None:
            return {"error": "Profile not found"}
        profile_dict = dict(profile)

        # Events this week
        ev_cur = await db.execute(
            "SELECT * FROM learning_events WHERE profile_id = ? AND timestamp > ? ORDER BY timestamp",
            (profile_id, week_ago),
        )
        events = [dict(r) for r in await ev_cur.fetchall()]

        # Mastery snapshot
        m_cur = await db.execute("SELECT * FROM mastery WHERE profile_id = ?", (profile_id,))
        mastery_records = [dict(r) for r in await m_cur.fetchall()]

        # Screen-time this week
        st_cur = await db.execute(
            "SELECT SUM(duration_minutes) as total_minutes, COUNT(*) as session_count "
            "FROM screen_time WHERE profile_id = ? AND session_start > ?",
            (profile_id, week_ago),
        )
        screen = dict(await st_cur.fetchone())

        # Quests completed this week
        qp_cur = await db.execute(
            "SELECT COUNT(*) as completed FROM quest_progress "
            "WHERE profile_id = ? AND status = 'completed' AND completed_at > ?",
            (profile_id, week_ago),
        )
        quests = dict(await qp_cur.fetchone())

        # Compute skill summary
        skills_practiced = set()
        total_quality = 0
        for ev in events:
            skills_practiced.add(ev["skill_id"])
            total_quality += ev.get("quality", 3)

        avg_quality = total_quality / len(events) if events else 0

        # Top strengths and areas for growth
        mastered = [r for r in mastery_records if r["level"] >= 0.7]
        growing = sorted(
            [r for r in mastery_records if 0 < r["level"] < 0.7],
            key=lambda r: r["level"],
        )

        return {
            "profile_id": profile_id,
            "profile_name": profile_dict["name"],
            "mastery_tier": profile_dict["mastery_tier"],
            "period_start": week_ago,
            "period_end": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            "events_count": len(events),
            "unique_skills_practiced": len(skills_practiced),
            "average_quality": round(avg_quality, 2),
            "quests_completed": quests["completed"],
            "screen_time_minutes": screen.get("total_minutes") or 0,
            "session_count": screen.get("session_count") or 0,
            "strengths": [
                {"skill_id": r["skill_id"], "level": r["level"]} for r in mastered[:5]
            ],
            "areas_for_growth": [
                {"skill_id": r["skill_id"], "level": r["level"]} for r in growing[:5]
            ],
        }

    async def dashboard(self) -> dict:
        """Overview of all profiles for the parent dashboard."""
        db = await get_db()

        p_cur = await db.execute("SELECT * FROM profiles ORDER BY name")
        profiles = [dict(r) for r in await p_cur.fetchall()]

        children = []
        for p in profiles:
            # Quick stats
            m_cur = await db.execute(
                "SELECT COUNT(*) as total, SUM(CASE WHEN level >= 0.7 THEN 1 ELSE 0 END) as mastered "
                "FROM mastery WHERE profile_id = ?",
                (p["id"],),
            )
            m_stats = dict(await m_cur.fetchone())

            children.append({
                "profile_id": p["id"],
                "name": p["name"],
                "mastery_tier": p["mastery_tier"],
                "last_active": p.get("last_active"),
                "total_skills": m_stats["total"],
                "mastered_skills": m_stats["mastered"] or 0,
            })

        return {"children": children}

    async def mastery_breakdown(self, profile_id: str) -> dict:
        """Detailed mastery breakdown for a profile."""
        db = await get_db()

        m_cur = await db.execute(
            "SELECT * FROM mastery WHERE profile_id = ? ORDER BY skill_id", (profile_id,)
        )
        records = [dict(r) for r in await m_cur.fetchall()]

        # Group by subject area (first segment of skill_id)
        subjects: dict[str, list[dict]] = {}
        for r in records:
            parts = r["skill_id"].split(".")
            subject = parts[0] if parts else "other"
            subjects.setdefault(subject, []).append({
                "skill_id": r["skill_id"],
                "level": r["level"],
                "retention_score": r["retention_score"],
                "transfer_score": r["transfer_score"],
                "depth_score": r["depth_score"],
                "attempts": r["attempts"],
                "successes": r["successes"],
                "streak": r["streak"],
            })

        return {
            "profile_id": profile_id,
            "total_skills": len(records),
            "subjects": subjects,
        }
