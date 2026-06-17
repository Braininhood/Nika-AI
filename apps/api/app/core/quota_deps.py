"""FastAPI dependencies for AI daily quota and consent checks."""

from __future__ import annotations

from fastapi import Depends, HTTPException, status

from app.core.security import AuthUser, get_current_user
from app.core.supabase_rest import supabase_rest
from app.services.quota import QuotaStatus, check_and_increment_quota


async def _load_profile_row(user_id: str) -> dict | None:
    rows = await supabase_rest(
        "GET",
        "profiles",
        params={"id": f"eq.{user_id}", "select": "*"},
    )
    if not rows:
        return None
    return rows[0] if isinstance(rows, list) else rows


async def require_ai_consent(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    row = await _load_profile_row(user.id)
    if not row or not row.get("ai_consent_at"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI processing consent required. Enable it in Profile settings.",
        )
    return user


async def require_ai_quota(user: AuthUser = Depends(require_ai_consent)) -> QuotaStatus:
    status_obj = await check_and_increment_quota(user.id)
    if not status_obj.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "AI_QUOTA_EXCEEDED",
                "message": "Daily AI quota exceeded",
                "used": status_obj.used,
                "limit": status_obj.limit,
                "resets_at": status_obj.resets_at,
            },
        )
    return status_obj
