"""GDPR — data export and account erasure via Supabase service role."""

from __future__ import annotations

from datetime import datetime, timezone

import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.core.supabase_rest import supabase_rest


async def export_user_data(user_id: str) -> dict:
    """Portable JSON export (GDPR Art. 20)."""
    profile_rows = await supabase_rest(
        "GET",
        "profiles",
        params={"id": f"eq.{user_id}", "select": "*"},
    )
    profile = profile_rows[0] if isinstance(profile_rows, list) and profile_rows else {}

    snapshots = await supabase_rest(
        "GET",
        "user_skill_snapshots",
        params={"user_id": f"eq.{user_id}", "select": "snapshot,computed_at", "order": "computed_at.desc"},
    )
    attempts = await supabase_rest(
        "GET",
        "attempts",
        params={"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc", "limit": "500"},
    )
    diagnostic = await supabase_rest(
        "GET",
        "diagnostic_sessions",
        params={"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc", "limit": "50"},
    )

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "profile": profile,
        "skill_snapshots": snapshots if isinstance(snapshots, list) else [],
        "attempts": attempts if isinstance(attempts, list) else [],
        "diagnostic_sessions": diagnostic if isinstance(diagnostic, list) else [],
        "note": "Local device data (drafts, recordings, imports) is included only if you export from the app while online.",
    }


async def delete_user_account(user_id: str) -> None:
    """Delete auth user — cascades to profiles and related rows (GDPR Art. 17)."""
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.delete(url, headers=headers)

    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not delete account")


async def purge_stale_attempts(retention_days: int = 365) -> dict:
    """Delete attempts older than retention window."""
    from datetime import timedelta

    threshold = (datetime.now(timezone.utc) - timedelta(days=retention_days)).isoformat()
    await supabase_rest(
        "DELETE",
        "attempts",
        params={"created_at": f"lt.{threshold}"},
        prefer="return=minimal",
    )
    return {"purged_before": threshold, "retention_days": retention_days}
