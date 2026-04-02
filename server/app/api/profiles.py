from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from app.db.connection import get_db
from app.errors import NotFoundError, ValidationError

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


# -- Models --------------------------------------------------------------------

ColorBlindMode = Literal["none", "deuteranopia", "protanopia", "tritanopia"]
FontFamily = Literal["system", "opendyslexic", "high-legibility"]
AccessibilityPreset = Literal[
    "none", "visual", "motor", "cognitive", "auditory", "low-vision", "full"
]


class AccessibilitySettings(BaseModel):
    """Per-profile accessibility preferences — synced across devices.

    Mirrors the nexus-core AccessibilitySettings interface exactly.
    """

    # Visual
    color_blind_mode: ColorBlindMode = "none"
    high_contrast: bool = False
    reduced_motion: bool = False
    font_size: int = Field(default=100, ge=50, le=200)
    font_family: str = "system"
    line_spacing: float = Field(default=1.4, ge=1.0, le=2.0)

    # Motor
    one_switch_mode: bool = False
    scan_speed: float = Field(default=2.0, ge=0.5, le=5.0)
    input_debounce: int = Field(default=200, ge=100, le=1000)
    hold_duration: int = Field(default=500, ge=200, le=3000)
    sticky_keys: bool = False

    # Cognitive
    simplified_ui: bool = False
    max_choices: int = Field(default=4, ge=2, le=4)
    companion_speech_speed: int = Field(default=100, ge=50, le=150)
    auto_repeat: bool = False
    extended_pacing: bool = False

    # Auditory
    subtitles: bool = False
    sound_captions: bool = False
    visual_sound_indicators: bool = False
    haptic_feedback: bool = False

    # Presets
    preset: AccessibilityPreset = "none"


class CreateProfileRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    avatar_data: str | None = None
    birth_date: str | None = None
    settings: dict | None = None
    accessibility_settings: AccessibilitySettings | None = None


class UpdateProfileRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    avatar_data: str | None = None
    mastery_tier: str | None = None
    birth_date: str | None = None
    settings: dict | None = None
    accessibility_settings: AccessibilitySettings | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    avatar_data: str | None = None
    mastery_tier: str
    birth_date: str | None = None
    created_at: str | None = None
    last_active: str | None = None
    settings: dict | None = None
    accessibility_settings: AccessibilitySettings | None = None


class PaginatedProfiles(BaseModel):
    items: list[ProfileResponse]
    total: int
    offset: int
    limit: int


VALID_TIERS = {"foundation", "discovery", "builder", "innovator", "creator"}


# -- Routes --------------------------------------------------------------------

@router.post("", response_model=ProfileResponse, status_code=201)
async def create_profile(body: CreateProfileRequest):
    db = await get_db()
    profile_id = uuid.uuid4().hex[:12]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    settings_json = json.dumps(body.settings) if body.settings else None
    a11y_json = body.accessibility_settings.model_dump_json() if body.accessibility_settings else None

    await db.execute(
        "INSERT INTO profiles (id, name, avatar_data, birth_date, created_at, last_active, settings, accessibility_settings) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (profile_id, body.name, body.avatar_data, body.birth_date, now, now, settings_json, a11y_json),
    )

    # Bootstrap companion and world state
    await db.execute(
        "INSERT INTO companions (profile_id) VALUES (?)", (profile_id,)
    )
    await db.execute(
        "INSERT INTO world_state (profile_id) VALUES (?)", (profile_id,)
    )
    await db.commit()

    return ProfileResponse(
        id=profile_id,
        name=body.name,
        avatar_data=body.avatar_data,
        mastery_tier="foundation",
        birth_date=body.birth_date,
        created_at=now,
        last_active=now,
        settings=body.settings,
        accessibility_settings=body.accessibility_settings,
    )


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile(profile_id: str):
    db = await get_db()
    cur = await db.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    row = await cur.fetchone()
    if row is None:
        raise NotFoundError("Profile not found")
    return _row_to_profile(dict(row))


@router.put("/{profile_id}", response_model=ProfileResponse)
async def update_profile(profile_id: str, body: UpdateProfileRequest):
    db = await get_db()

    cur = await db.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    row = await cur.fetchone()
    if row is None:
        raise NotFoundError("Profile not found")

    existing = dict(row)
    updates: dict = {}

    if body.name is not None:
        updates["name"] = body.name
    if body.avatar_data is not None:
        updates["avatar_data"] = body.avatar_data
    if body.mastery_tier is not None:
        if body.mastery_tier not in VALID_TIERS:
            raise ValidationError(f"Invalid mastery tier: {body.mastery_tier}")
        updates["mastery_tier"] = body.mastery_tier
    if body.birth_date is not None:
        updates["birth_date"] = body.birth_date
    if body.settings is not None:
        updates["settings"] = json.dumps(body.settings)
    if body.accessibility_settings is not None:
        updates["accessibility_settings"] = body.accessibility_settings.model_dump_json()

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    updates["last_active"] = now

    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [profile_id]
        await db.execute(
            f"UPDATE profiles SET {set_clause} WHERE id = ?", values  # noqa: S608
        )
        await db.commit()

    # Refetch
    cur = await db.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    row = await cur.fetchone()
    return _row_to_profile(dict(row))


@router.get("", response_model=PaginatedProfiles)
async def list_profiles(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    db = await get_db()

    count_cur = await db.execute("SELECT COUNT(*) FROM profiles")
    total = (await count_cur.fetchone())[0]

    cur = await db.execute(
        "SELECT * FROM profiles ORDER BY name LIMIT ? OFFSET ?", (limit, offset)
    )
    rows = [dict(r) for r in await cur.fetchall()]

    return PaginatedProfiles(
        items=[_row_to_profile(r) for r in rows],
        total=total,
        offset=offset,
        limit=limit,
    )


def _row_to_profile(row: dict) -> ProfileResponse:
    settings = None
    if row.get("settings"):
        try:
            settings = json.loads(row["settings"])
        except (json.JSONDecodeError, TypeError):
            settings = None

    a11y = None
    if row.get("accessibility_settings"):
        try:
            a11y = AccessibilitySettings.model_validate_json(row["accessibility_settings"])
        except Exception:
            a11y = None

    return ProfileResponse(
        id=row["id"],
        name=row["name"],
        avatar_data=row.get("avatar_data"),
        mastery_tier=row.get("mastery_tier", "foundation"),
        birth_date=row.get("birth_date"),
        created_at=row.get("created_at"),
        last_active=row.get("last_active"),
        settings=settings,
        accessibility_settings=a11y,
    )
