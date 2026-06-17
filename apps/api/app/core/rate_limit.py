"""Per-user / per-IP API rate limiting — Redis when available, in-memory fallback."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings
from app.core.security import verify_supabase_jwt

_memory: dict[str, list[float]] = defaultdict(list)
_WINDOW_SECONDS = 60


def _client_key(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        return f"ip:{request.client.host if request.client else 'unknown'}"
    return f"ip:{request.client.host if request.client else 'unknown'}"


async def _user_or_ip_key(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1].strip()
        payload = await verify_supabase_jwt(token)
        if payload and payload.get("sub"):
            return f"user:{payload['sub']}"
    return _client_key(request)


async def _increment(key: str, limit: int) -> bool:
    now = time.time()
    window_start = now - _WINDOW_SECONDS
    redis_key = f"rl:{key}"

    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        pipe = client.pipeline()
        pipe.zremrangebyscore(redis_key, 0, window_start)
        pipe.zadd(redis_key, {str(now): now})
        pipe.zcard(redis_key)
        pipe.expire(redis_key, _WINDOW_SECONDS + 5)
        _, _, count, _ = await pipe.execute()
        await client.aclose()
        return int(count) <= limit
    except Exception:
        hits = [t for t in _memory[key] if t >= window_start]
        hits.append(now)
        _memory[key] = hits
        return len(hits) <= limit


class RateLimitMiddleware(BaseHTTPMiddleware):
    """OWASP — rate limit authenticated API routes to reduce abuse."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        if not path.startswith("/api/v1"):
            return await call_next(request)

        if request.method == "OPTIONS":
            return await call_next(request)

        limit = settings.api_rate_limit_per_minute
        key = await _user_or_ip_key(request)
        allowed = await _increment(key, limit)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
            )

        return await call_next(request)
