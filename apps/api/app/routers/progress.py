"""Progress routes — skill snapshots and cross-device study sync."""

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user
from app.schemas.study_sync import StudyPullResponse, StudySyncRequest, StudySyncResponse
from app.services.study_sync import apply_study_sync, pull_study_data
from app.services.user_skill_map import load_user_skill_map

router = APIRouter()


@router.get("/snapshot")
async def get_skill_snapshot(user: AuthUser = Depends(get_current_user)) -> dict:
    snapshot = await load_user_skill_map(user.id)
    return {
        "user_id": user.id,
        "snapshot": snapshot,
        "computed_at": snapshot.get("computedAt") if snapshot else None,
        "message": "Live skill map from cloud sync." if snapshot else "No cloud snapshot yet.",
    }


@router.get("/pull", response_model=StudyPullResponse)
async def pull_progress(user: AuthUser = Depends(get_current_user)) -> StudyPullResponse:
    """Download study data for merge into local IndexedDB (cross-device restore)."""
    return await pull_study_data(user.id)


@router.post("/sync", response_model=StudySyncResponse)
async def sync_progress(
    payload: StudySyncRequest,
    user: AuthUser = Depends(get_current_user),
) -> StudySyncResponse:
    """Upload attempts, vocabulary, and local study blob to Supabase."""
    return await apply_study_sync(user.id, payload)
