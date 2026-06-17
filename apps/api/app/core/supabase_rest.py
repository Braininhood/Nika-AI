"""Supabase PostgREST helper (service role)."""

from __future__ import annotations

import httpx
from fastapi import HTTPException

from app.core.config import settings


async def supabase_rest(
    method: str,
    path: str,
    *,
    json: dict | list | None = None,
    params: dict | None = None,
    prefer: str | None = "return=representation",
) -> list | dict:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

    url = f"{settings.supabase_url.rstrip('/')}/rest/v1/{path}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.request(method, url, headers=headers, json=json, params=params)

    if response.status_code >= 400:
        detail = "Database request failed"
        try:
            body = response.json()
            if isinstance(body, dict) and body.get("message"):
                detail = str(body["message"])[:200]
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    if not response.content:
        return {}
    return response.json()
