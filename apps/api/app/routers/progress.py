"""Progress routes — skill snapshots synced from Supabase."""

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user
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


@router.post("/sync")
async def sync_progress(
    payload: dict,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    return {
        "status": "accepted",
        "user_id": user.id,
        "received": len(payload.get("attempts", [])),
        "message": "Bulk sync — Phase 1.",
    }
