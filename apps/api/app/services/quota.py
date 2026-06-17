"""Daily AI quota per user — Redis when available, in-memory fallback."""

from __future__ import annotations

import time
from dataclasses import dataclass

from app.core.config import settings

_memory: dict[str, tuple[int, str]] = {}


@dataclass
class QuotaStatus:
    allowed: bool
    used: int
    limit: int
    resets_at: str


def _today_key() -> str:
    return time.strftime("%Y-%m-%d", time.gmtime())


def _reset_at_iso() -> str:
    now = time.gmtime()
    tomorrow = time.struct_time(
        (now.tm_year, now.tm_mon, now.tm_mday + 1, 0, 0, 0, now.tm_wday, now.tm_yday, now.tm_isdst)
    )
    return time.strftime("%Y-%m-%dT00:00:00Z", tomorrow)


async def peek_quota(user_id: str) -> QuotaStatus:
    """Read current usage without incrementing."""
    limit = settings.ai_daily_quota
    day = _today_key()
    key = f"ai:quota:{user_id}:{day}"

    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        raw = await client.get(key)
        used = int(raw) if raw else 0
        await client.aclose()
    except Exception:
        mem_key = f"{user_id}:{day}"
        used = _memory.get(mem_key, (0, day))[0]

    return QuotaStatus(
        allowed=used < limit,
        used=used,
        limit=limit,
        resets_at=_reset_at_iso(),
    )


async def check_and_increment_quota(user_id: str) -> QuotaStatus:
    limit = settings.ai_daily_quota
    day = _today_key()
    key = f"ai:quota:{user_id}:{day}"

    try:
        import redis.asyncio as aioredis

        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        used = await client.incr(key)
        if used == 1:
            await client.expire(key, 86400)
        await client.aclose()
    except Exception:
        mem_key = f"{user_id}:{day}"
        prev = _memory.get(mem_key, (0, day))
        used = prev[0] + 1
        _memory[mem_key] = (used, day)

    return QuotaStatus(
        allowed=used <= limit,
        used=used,
        limit=limit,
        resets_at=_reset_at_iso(),
    )
