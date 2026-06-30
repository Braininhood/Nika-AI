"""Supabase Auth Admin API (service role)."""

from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException

from app.core.config import settings


def _admin_headers() -> dict[str, str]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


def _auth_url(path: str) -> str:
    return f"{settings.supabase_url.rstrip('/')}/auth/v1{path}"


async def list_auth_users(*, page: int = 1, per_page: int = 50) -> tuple[list[dict[str, Any]], int | None]:
    """Return (users, total) for one page. Total may be None if not provided."""
    params = {"page": str(page), "per_page": str(per_page)}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(_auth_url("/admin/users"), headers=_admin_headers(), params=params)

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Could not list users")

    data = response.json()
    users = data.get("users") if isinstance(data, dict) else data
    if not isinstance(users, list):
        users = []
    total = None
    if isinstance(data, dict):
        for key in ("total", "count"):
            if isinstance(data.get(key), int):
                total = data[key]
                break
    return users, total


async def get_auth_user(user_id: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(_auth_url(f"/admin/users/{user_id}"), headers=_admin_headers())

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Could not load user")

    body = response.json()
    return body if isinstance(body, dict) else {}


async def create_auth_user(
    *,
    email: str,
    role: str = "learner",
    email_confirm: bool = True,
) -> dict[str, Any]:
    payload = {
        "email": email,
        "email_confirm": email_confirm,
        "app_metadata": {"role": role},
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(_auth_url("/admin/users"), headers=_admin_headers(), json=payload)

    if response.status_code == 422:
        raise HTTPException(status_code=409, detail="A user with this email already exists")
    if response.status_code >= 400:
        detail = "Could not create user"
        try:
            body = response.json()
            if isinstance(body, dict) and body.get("msg"):
                detail = str(body["msg"])[:200]
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    body = response.json()
    return body if isinstance(body, dict) else {}


async def update_auth_user(user_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.put(
            _auth_url(f"/admin/users/{user_id}"),
            headers=_admin_headers(),
            json=patch,
        )

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Could not update user")

    body = response.json()
    return body if isinstance(body, dict) else {}


async def delete_auth_user(user_id: str) -> None:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.delete(_auth_url(f"/admin/users/{user_id}"), headers=_admin_headers())

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if response.status_code not in (200, 204):
        raise HTTPException(status_code=502, detail="Could not delete user")


async def generate_magic_link(email: str) -> str:
    payload = {"type": "magiclink", "email": email}
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            _auth_url("/admin/generate_link"),
            headers=_admin_headers(),
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Could not generate sign-in link")

    body = response.json()
    link = body.get("action_link") if isinstance(body, dict) else None
    if not link:
        raise HTTPException(status_code=502, detail="Could not generate sign-in link")
    return str(link)


def auth_user_role(user: dict[str, Any]) -> str:
    meta = user.get("app_metadata") or user.get("raw_app_meta_data") or {}
    role = meta.get("role")
    return str(role) if role else "learner"


def auth_user_banned(user: dict[str, Any]) -> bool:
    banned_until = user.get("banned_until")
    if not banned_until:
        return False
    return banned_until != "none"


def auth_user_providers(user: dict[str, Any]) -> list[str]:
    identities = user.get("identities")
    if not isinstance(identities, list):
        return []
    providers: list[str] = []
    for identity in identities:
        if isinstance(identity, dict) and identity.get("provider"):
            providers.append(str(identity["provider"]))
    return providers


# Providers that verify email at the identity provider (not magic-link flow).
OAUTH_PROVIDERS = frozenset(
    {
        "google",
        "apple",
        "azure",
        "github",
        "facebook",
        "gitlab",
        "bitbucket",
        "discord",
        "twitch",
        "twitter",
        "slack",
        "spotify",
        "workos",
        "linkedin",
    }
)


def is_email_verified(user: dict[str, Any]) -> bool:
    """True when email is confirmed via magic link, admin create, or OAuth (e.g. Google)."""
    if user.get("email_confirmed_at") or user.get("confirmed_at"):
        return True
    if user.get("is_sso_user"):
        return True
    providers = auth_user_providers(user)
    return any(provider in OAUTH_PROVIDERS for provider in providers)


def is_magic_link_pending(user: dict[str, Any]) -> bool:
    """Email/password signup that never completed the magic-link step (excludes OAuth users)."""
    if is_email_verified(user):
        return False
    providers = auth_user_providers(user)
    # No identities in list payload → treat as email signup if never verified.
    if not providers:
        return True
    return "email" in providers and not any(p in OAUTH_PROVIDERS for p in providers)
