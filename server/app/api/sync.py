from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.errors import NotFoundError
from app.db.connection import get_db
from app.services.sync import SyncService, SyncUploadPayload

router = APIRouter(prefix="/api/sync", tags=["sync"])
sync_service = SyncService()


# -- Models --------------------------------------------------------------------

class SyncUploadRequest(BaseModel):
    profile_id: str
    learning_events: list[dict] = Field(default_factory=list)
    mastery: list[dict] = Field(default_factory=list)
    quest_progress: list[dict] = Field(default_factory=list)
    companion: dict | None = None
    world_state: dict | None = None
    accessibility_settings: dict | None = None


class SyncUploadResponse(BaseModel):
    status: str = "ok"
    events_merged: int
    mastery_updated: int
    quests_updated: int
    companion_updated: bool
    world_state_updated: bool
    accessibility_updated: bool
    conflicts: list[str]


class SyncDownloadRequest(BaseModel):
    profile_id: str
    since: str | None = None


class SyncFullRequest(BaseModel):
    profile_id: str


# -- Routes --------------------------------------------------------------------

@router.post("/upload", response_model=SyncUploadResponse)
async def sync_upload(body: SyncUploadRequest):
    """Client uploads local changes to be merged into the server."""
    await _require_profile(body.profile_id)

    payload = SyncUploadPayload(
        learning_events=body.learning_events,
        mastery=body.mastery,
        quest_progress=body.quest_progress,
        companion=body.companion,
        world_state=body.world_state,
        accessibility_settings=body.accessibility_settings,
    )
    result = await sync_service.merge_upload(body.profile_id, payload)

    return SyncUploadResponse(
        events_merged=result.events_merged,
        mastery_updated=result.mastery_updated,
        quests_updated=result.quests_updated,
        companion_updated=result.companion_updated,
        world_state_updated=result.world_state_updated,
        accessibility_updated=result.accessibility_updated,
        conflicts=result.conflicts,
    )


@router.post("/download")
async def sync_download(body: SyncDownloadRequest):
    """Client downloads the latest merged state."""
    await _require_profile(body.profile_id)
    state = await sync_service.get_state_since(body.profile_id, body.since)
    return {"status": "ok", **state}


@router.post("/full")
async def sync_full(body: SyncFullRequest):
    """Full database export for first sync or recovery."""
    await _require_profile(body.profile_id)
    data = await sync_service.full_export(body.profile_id)
    return {"status": "ok", **data}


async def _require_profile(profile_id: str) -> None:
    db = await get_db()
    cur = await db.execute("SELECT id FROM profiles WHERE id = ?", (profile_id,))
    if await cur.fetchone() is None:
        raise NotFoundError("Profile not found")
