"""Auth routes — profile and session helpers."""

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user

router = APIRouter()


@router.get("/me")
async def get_me(user: AuthUser = Depends(get_current_user)) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }


@router.post("/merge-guest")
async def merge_guest(
    guest_id: str,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    """Link guest progress to authenticated user (stub — Phase 1)."""
    return {
        "status": "queued",
        "guest_id": guest_id,
        "user_id": user.id,
        "message": "Guest merge will be implemented in Phase 1.",
    }
