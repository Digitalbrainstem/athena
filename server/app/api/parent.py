from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Header, Query
from pydantic import BaseModel, Field

from app.api.profiles import AccessibilitySettings
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


class AccessibilityResponse(BaseModel):
    profile_id: str
    accessibility_settings: AccessibilitySettings
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


@router.get("/accessibility/{profile_id}", response_model=AccessibilityResponse)
async def get_accessibility(
    profile_id: str, authorization: str | None = Header(None)
):
    """Get accessibility settings for a child's profile."""
    await _require_parent_token(authorization)
    db = await get_db()

    cur = await db.execute(
        "SELECT accessibility_settings, last_active FROM profiles WHERE id = ?", (profile_id,)
    )
    row = await cur.fetchone()
    if row is None:
        raise NotFoundError("Profile not found")

    row_dict = dict(row)
    raw = row_dict.get("accessibility_settings")
    if raw:
        try:
            a11y = AccessibilitySettings.model_validate_json(raw)
        except Exception:
            a11y = AccessibilitySettings()
    else:
        a11y = AccessibilitySettings()

    return AccessibilityResponse(
        profile_id=profile_id,
        accessibility_settings=a11y,
        updated_at=row_dict.get("last_active"),
    )


@router.put("/accessibility/{profile_id}", response_model=AccessibilityResponse)
async def set_accessibility(
    profile_id: str,
    body: AccessibilitySettings,
    authorization: str | None = Header(None),
):
    """Configure accessibility settings for a child's profile."""
    await _require_parent_token(authorization)
    db = await get_db()

    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    a11y_json = body.model_dump_json()

    await db.execute(
        "UPDATE profiles SET accessibility_settings = ?, last_active = ? WHERE id = ?",
        (a11y_json, now, profile_id),
    )
    await db.commit()

    return AccessibilityResponse(
        profile_id=profile_id,
        accessibility_settings=body,
        updated_at=now,
    )
