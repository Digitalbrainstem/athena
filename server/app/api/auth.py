from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field

from app.db.connection import get_db
from app.errors import AuthError, NotFoundError, ValidationError
from app.security import (
    TokenScope,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    validate_password,
    validate_pin,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# -- Request / Response models -------------------------------------------------

class LoginRequest(BaseModel):
    profile_id: str
    pin: str | None = None
    password: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    profile_id: str
    scope: str


class RefreshRequest(BaseModel):
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ParentLoginRequest(BaseModel):
    profile_id: str
    password: str


class SetAuthRequest(BaseModel):
    profile_id: str
    auth_type: str = Field(..., pattern="^(pin|password|parent)$")
    credential: str
    parent_profile_id: str | None = None


# -- Helpers -------------------------------------------------------------------

async def _get_auth_row(profile_id: str) -> dict | None:
    db = await get_db()
    cur = await db.execute("SELECT * FROM auth WHERE profile_id = ?", (profile_id,))
    row = await cur.fetchone()
    return dict(row) if row else None


# -- Routes --------------------------------------------------------------------

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """Authenticate with PIN (player) or password (parent)."""
    db = await get_db()

    # Verify profile exists
    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (body.profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")

    auth_row = await _get_auth_row(body.profile_id)

    if auth_row is None or auth_row["auth_type"] == "none":
        # No auth set — allow login (for young children)
        scope: TokenScope = "player"
        return TokenResponse(
            access_token=create_access_token(body.profile_id, scope),
            refresh_token=create_refresh_token(body.profile_id, scope),
            profile_id=body.profile_id,
            scope=scope,
        )

    if auth_row["auth_type"] == "pin":
        if body.pin is None:
            raise AuthError("PIN required")
        if not verify_password(body.pin, auth_row["auth_hash"]):
            raise AuthError("Invalid PIN")
        scope = "player"
    elif auth_row["auth_type"] in ("password", "parent"):
        if body.password is None:
            raise AuthError("Password required")
        if not verify_password(body.password, auth_row["auth_hash"]):
            raise AuthError("Invalid password")
        scope = "parent" if auth_row["auth_type"] == "parent" else "player"
    else:
        raise AuthError("Unknown auth type")

    return TokenResponse(
        access_token=create_access_token(body.profile_id, scope),
        refresh_token=create_refresh_token(body.profile_id, scope),
        profile_id=body.profile_id,
        scope=scope,
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(body: RefreshRequest):
    """Exchange a refresh token for a new access token."""
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise AuthError("Not a refresh token")

    profile_id = payload["sub"]
    scope = payload.get("scope", "player")
    return RefreshResponse(
        access_token=create_access_token(profile_id, scope),
    )


@router.post("/parent", response_model=TokenResponse)
async def parent_login(body: ParentLoginRequest):
    """Parent-specific login returning a parent-scoped token."""
    db = await get_db()

    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (body.profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")

    auth_row = await _get_auth_row(body.profile_id)
    if auth_row is None or auth_row["auth_type"] != "parent":
        raise AuthError("No parent auth configured for this profile")

    if not verify_password(body.password, auth_row["auth_hash"]):
        raise AuthError("Invalid password")

    scope: TokenScope = "parent"
    return TokenResponse(
        access_token=create_access_token(body.profile_id, scope),
        refresh_token=create_refresh_token(body.profile_id, scope),
        profile_id=body.profile_id,
        scope=scope,
    )


@router.post("/setup")
async def setup_auth(body: SetAuthRequest):
    """Set or update authentication for a profile."""
    db = await get_db()

    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (body.profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")

    if body.auth_type == "pin":
        validate_pin(body.credential)
    elif body.auth_type in ("password", "parent"):
        validate_password(body.credential)
    else:
        raise ValidationError("auth_type must be pin, password, or parent")

    hashed = hash_password(body.credential)

    await db.execute(
        "INSERT INTO auth (profile_id, auth_type, auth_hash, parent_profile_id) "
        "VALUES (?, ?, ?, ?) "
        "ON CONFLICT(profile_id) DO UPDATE SET auth_type=?, auth_hash=?, parent_profile_id=?",
        (body.profile_id, body.auth_type, hashed, body.parent_profile_id,
         body.auth_type, hashed, body.parent_profile_id),
    )
    await db.commit()
    return {"status": "ok", "profile_id": body.profile_id, "auth_type": body.auth_type}
