from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.connection import close_db, get_db, init_db
from app.errors import NexusError
from app.middleware import RequestIdMiddleware

__version__ = "0.1.0"


def _configure_logging() -> None:
    settings = get_settings()
    level = logging.DEBUG if settings.debug else logging.INFO
    logging.basicConfig(
        level=level,
        format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
        stream=sys.stdout,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    await init_db()
    logging.getLogger("nexus").info("Nexus Academy server started (v%s)", __version__)
    yield
    await close_db()
    logging.getLogger("nexus").info("Nexus Academy server stopped")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Nexus Academy",
        version=__version__,
        lifespan=lifespan,
    )

    # CORS
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID
    app.add_middleware(RequestIdMiddleware)

    # Exception handler
    @app.exception_handler(NexusError)
    async def nexus_error_handler(request: Request, exc: NexusError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail},
        )

    # Health endpoint
    @app.get("/api/health")
    async def health():
        try:
            db = await get_db()
            cur = await db.execute("SELECT 1")
            await cur.fetchone()
            db_ok = True
        except Exception:
            db_ok = False
        return {
            "status": "healthy" if db_ok else "degraded",
            "version": __version__,
            "database": "ok" if db_ok else "error",
        }

    # Routers
    from app.api.auth import router as auth_router
    from app.api.classroom import router as classroom_router
    from app.api.multiplayer import router as multiplayer_router
    from app.api.parent import router as parent_router
    from app.api.profiles import router as profiles_router
    from app.api.sync import router as sync_router

    app.include_router(auth_router)
    app.include_router(profiles_router)
    app.include_router(sync_router)
    app.include_router(parent_router)
    app.include_router(multiplayer_router)
    app.include_router(classroom_router)

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
