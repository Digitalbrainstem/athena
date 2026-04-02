from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Environment-driven configuration for the Nexus Academy server."""

    database_path: str = "./data/nexus.db"
    host: str = "0.0.0.0"
    port: int = 5200
    debug: bool = False

    jwt_secret: str = "CHANGE-ME-IN-PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_access_ttl_minutes: int = 30
    jwt_refresh_ttl_days: int = 7

    bcrypt_cost: int = 12

    cors_origins: str = "http://localhost:5173"

    atlas_url: str | None = None

    model_config = {"env_prefix": "NEXUS_"}


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def override_settings(settings: Settings) -> None:
    """Replace global settings (used in tests)."""
    global _settings
    _settings = settings
