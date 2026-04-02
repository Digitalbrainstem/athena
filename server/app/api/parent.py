from __future__ import annotations

from fastapi import APIRouter, Header, Query
from pydantic import BaseModel, Field

from app.db.connection import get_db
from app.errors import AuthError, NotFoundError
from app.security import decode_token
from app.services.reports import ReportService

router = APIRouter(prefix="/api/parent", tags=["parent"])
report_service = ReportService()


# -- Models --------------------------------------------------------------------

class ScreenTimeConfig(BaseModel):
    daily_limit_minutes: int | None = None
    break_interval_minutes: int = 30
    enabled: bool = True


class ScreenTimeResponse(BaseModel):
    profile_id: str
    daily_limit_minutes: int | None = None
    break_interval_minutes: int
    enabled: bool
    updated_at: str | None = None


# -- Auth helper ---------------------------------------------------------------

async def _require_parent_token(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthError("Missing or invalid Authorization header")
    token = authorization[7:]
    payload = decode_token(token)
    if payload.get("scope") != "parent":
        raise AuthError("Parent-scoped token required")
    return payload


# -- Routes --------------------------------------------------------------------

@router.get("/reports/{profile_id}")
async def get_report(profile_id: str, authorization: str | None = Header(None)):
    await _require_parent_token(authorization)
    report = await report_service.weekly_report(profile_id)
    if "error" in report:
        raise NotFoundError(report["error"])
    return report


@router.get("/dashboard")
async def get_dashboard(authorization: str | None = Header(None)):
    await _require_parent_token(authorization)
    return await report_service.dashboard()


@router.put("/screen-time/{profile_id}", response_model=ScreenTimeResponse)
async def set_screen_time(
    profile_id: str,
    body: ScreenTimeConfig,
    authorization: str | None = Header(None),
):
    await _require_parent_token(authorization)
    db = await get_db()

    # Verify profile
    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    await db.execute(
        "INSERT INTO screen_time_config (profile_id, daily_limit_minutes, break_interval_minutes, enabled, updated_at) "
        "VALUES (?, ?, ?, ?, ?) "
        "ON CONFLICT(profile_id) DO UPDATE SET "
        "daily_limit_minutes=?, break_interval_minutes=?, enabled=?, updated_at=?",
        (
            profile_id, body.daily_limit_minutes, body.break_interval_minutes,
            int(body.enabled), now,
            body.daily_limit_minutes, body.break_interval_minutes, int(body.enabled), now,
        ),
    )
    await db.commit()

    return ScreenTimeResponse(
        profile_id=profile_id,
        daily_limit_minutes=body.daily_limit_minutes,
        break_interval_minutes=body.break_interval_minutes,
        enabled=body.enabled,
        updated_at=now,
    )


@router.get("/mastery/{profile_id}")
async def get_mastery_breakdown(
    profile_id: str, authorization: str | None = Header(None)
):
    await _require_parent_token(authorization)
    return await report_service.mastery_breakdown(profile_id)
