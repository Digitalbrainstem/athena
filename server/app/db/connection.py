from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aiosqlite

from app.config import get_settings
from app.db.schema import SCHEMA_SQL, SCHEMA_VERSION

logger = logging.getLogger("nexus.db")

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    """Return the shared database connection. Must be initialised first."""
    if _db is None:
        raise RuntimeError("Database not initialised — call init_db() first")
    return _db


async def init_db() -> aiosqlite.Connection:
    """Open the SQLite database, enable WAL mode, and ensure schema exists."""
    global _db
    settings = get_settings()
    db_path = settings.database_path

    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)

    conn = await aiosqlite.connect(db_path)
    conn.row_factory = aiosqlite.Row

    await conn.execute("PRAGMA journal_mode = WAL")
    await conn.execute("PRAGMA foreign_keys = ON")
    await conn.execute("PRAGMA busy_timeout = 5000")

    await conn.executescript(SCHEMA_SQL)

    # Record schema version if not present
    cursor = await conn.execute(
        "SELECT version FROM schema_version WHERE version = ?", (SCHEMA_VERSION,)
    )
    if await cursor.fetchone() is None:
        await conn.execute(
            "INSERT INTO schema_version (version, description) VALUES (?, ?)",
            (SCHEMA_VERSION, "Initial schema"),
        )
        await conn.commit()

    logger.info("Database initialised at %s (WAL mode)", db_path)
    _db = conn
    return conn


async def close_db() -> None:
    """Checkpoint WAL and close the database connection."""
    global _db
    if _db is not None:
        try:
            await _db.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        except Exception:
            logger.warning("WAL checkpoint failed during shutdown", exc_info=True)
        await _db.close()
        _db = None
        logger.info("Database connection closed")


@asynccontextmanager
async def db_transaction() -> AsyncGenerator[aiosqlite.Connection, None]:
    """Context manager for an explicit transaction."""
    conn = await get_db()
    await conn.execute("BEGIN")
    try:
        yield conn
        await conn.commit()
    except Exception:
        await conn.rollback()
        raise
