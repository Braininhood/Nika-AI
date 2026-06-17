"""JWT verification for Supabase-issued tokens."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import settings

security = HTTPBearer(auto_error=False)

_jwks_cache: dict[str, Any] | None = None
_jwks_fetched_at: float = 0.0
_JWKS_TTL_SECONDS = 3600


@dataclass
class AuthUser:
    id: str
    email: str | None = None
    role: str = "learner"


async def _fetch_jwks() -> dict[str, Any]:
    global _jwks_cache, _jwks_fetched_at

    if _jwks_cache and (time.time() - _jwks_fetched_at) < _JWKS_TTL_SECONDS:
        return _jwks_cache

    if not settings.supabase_url:
        return {"keys": []}

    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(jwks_url)
        response.raise_for_status()
        data: dict[str, Any] = response.json()
        _jwks_cache = data
        _jwks_fetched_at = time.time()
        return data


def _verify_with_secret(token: str) -> dict[str, Any] | None:
    if not settings.supabase_jwt_secret:
        return None
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        return None


async def _verify_with_jwks(token: str) -> dict[str, Any] | None:
    jwks = await _fetch_jwks()
    keys = jwks.get("keys") or []
    if not keys:
        return None

    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        return None

    kid = header.get("kid")
    matching = [k for k in keys if k.get("kid") == kid] if kid else keys
    if not matching:
        matching = keys

    for key in matching:
        try:
            return jwt.decode(
                token,
                key,
                algorithms=[header.get("alg", "ES256"), "RS256", "ES256"],
                audience="authenticated",
                options={"verify_aud": True},
            )
        except JWTError:
            continue
    return None


async def _verify_with_supabase_api(token: str) -> dict[str, Any] | None:
    if not settings.supabase_url or not settings.supabase_anon_key:
        return None

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers={
                "apikey": settings.supabase_anon_key,
                "Authorization": f"Bearer {token}",
            },
        )
        if response.status_code != 200:
            return None
        user = response.json()
        return {
            "sub": user.get("id"),
            "email": user.get("email"),
            "app_metadata": user.get("app_metadata") or {},
        }


async def verify_supabase_jwt(token: str) -> dict[str, Any] | None:
    payload = _verify_with_secret(token)
    if payload:
        return payload

    payload = await _verify_with_jwks(token)
    if payload:
        return payload

    return await _verify_with_supabase_api(token)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    payload = await verify_supabase_jwt(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    app_metadata = payload.get("app_metadata") or {}
    return AuthUser(
        id=user_id,
        email=payload.get("email"),
        role=app_metadata.get("role", "learner"),
    )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser | None:
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


async def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """JWT app_metadata.role must be admin (set in Supabase SQL only)."""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return user
