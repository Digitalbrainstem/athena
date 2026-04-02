from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
from jose import JWTError, jwt

from app.config import get_settings
from app.errors import AuthError

logger = logging.getLogger("nexus.security")

TokenScope = Literal["player", "parent"]


def hash_password(plain: str) -> str:
    """Hash a password or PIN with bcrypt."""
    settings = get_settings()
    salt = bcrypt.gensalt(rounds=settings.bcrypt_cost)
    return bcrypt.hashpw(plain.encode(), salt).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password or PIN against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(profile_id: str, scope: TokenScope) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_ttl_minutes)
    payload = {
        "sub": profile_id,
        "scope": scope,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(profile_id: str, scope: TokenScope) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_ttl_days)
    payload = {
        "sub": profile_id,
        "scope": scope,
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises AuthError on failure."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise AuthError("Invalid or expired token") from exc

    if "sub" not in payload or "type" not in payload:
        raise AuthError("Malformed token")
    return payload


def require_scope(payload: dict, scope: TokenScope) -> None:
    """Ensure the token has the required scope."""
    if payload.get("scope") != scope:
        raise AuthError(f"Token does not have '{scope}' scope")


def validate_pin(pin: str) -> None:
    """Validate a player PIN: digits only, 4-8 characters."""
    if not pin.isdigit() or not (4 <= len(pin) <= 8):
        raise AuthError("PIN must be 4-8 digits")


def validate_password(password: str) -> None:
    """Validate a parent password: minimum 8 characters."""
    if len(password) < 8:
        raise AuthError("Password must be at least 8 characters")
