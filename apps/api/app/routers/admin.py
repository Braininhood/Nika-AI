"""Admin routes — scenario tooling + pack publish status (Phase 8)."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import AuthUser, require_admin

router = APIRouter()


@router.get("/me")
async def admin_me(user: AuthUser = Depends(require_admin)) -> dict:
    return {"ok": True}


@router.get("/packs/status")
async def pack_status(
    pack_id: str = "listening-foundation-v1",
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    """Check whether the public pack manifest is reachable."""
    base = settings.content_packs_public_url_resolved.rstrip("/")
    if not base:
        return {
            "packId": pack_id,
            "reachable": False,
            "error": "Cloud content is not configured.",
        }

    manifest_url = f"{base}/{pack_id}/manifest.json"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(manifest_url)
        if response.status_code != 200:
            return {
                "packId": pack_id,
                "reachable": False,
                "error": "Listening pack is not available.",
            }
        manifest = response.json()
        return {
            "packId": pack_id,
            "reachable": True,
            "version": manifest.get("version"),
            "sizeBytes": manifest.get("sizeBytes"),
            "fileCount": len(manifest.get("files", [])),
        }
    except HTTPException:
        raise
    except Exception:
        return {
            "packId": pack_id,
            "reachable": False,
            "error": "Could not verify listening pack.",
        }


@router.post("/purge-stale-data")
async def purge_stale_data(
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    """Delete attempts older than configured retention (default 12 months)."""
    from app.services.gdpr import purge_stale_attempts

    return await purge_stale_attempts(settings.data_retention_days)
