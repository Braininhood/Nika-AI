"""Load persisted skill maps from Supabase (cross-device sync)."""

from __future__ import annotations

from fastapi import HTTPException

from app.routers.profile import _supabase_rest


def default_skill_map(user_id: str, profession: str | None = None) -> dict:
    """Fallback when no cloud snapshot exists yet."""
    return {
        "userId": user_id,
        "profession": profession or "medicine",
        "targetRegulator": "GMC",
        "targetGrades": {
            "listening": "B",
            "reading": "B",
            "writing": "B",
            "speaking": "B",
            "single_sitting": False,
        },
        "diagnostic": {
            "writing": {"estBand": "C+", "gap": 1, "weakTags": ["writing:purpose"]},
            "reading": {"estBand": "C+", "gap": 1, "weakTags": ["reading:part-b-gist"]},
            "listening": {"estBand": "C+", "gap": 1, "weakTags": ["listening:part-b-gist"]},
            "speaking": {"estBand": "C+", "gap": 1, "weakTags": ["speaking:ice-expectations"]},
        },
        "priority": ["writing", "listening", "reading", "speaking"],
        "estimatedWeeksToTarget": 8,
    }


async def load_user_skill_map(user_id: str) -> dict | None:
    try:
        rows = await _supabase_rest(
            "GET",
            "user_skill_snapshots",
            params={
                "user_id": f"eq.{user_id}",
                "select": "snapshot,computed_at",
                "order": "computed_at.desc",
                "limit": "1",
            },
        )
    except HTTPException:
        return None
    if not rows:
        return None
    row = rows[0] if isinstance(rows, list) else rows
    snapshot = row.get("snapshot") if isinstance(row, dict) else None
    return snapshot if isinstance(snapshot, dict) else None


async def resolve_skill_map(
    user_id: str,
    *,
    payload_map: dict | None = None,
    profession: str | None = None,
) -> dict:
    """Prefer client snapshot (Dexie), then cloud, then defaults."""
    if payload_map and isinstance(payload_map, dict) and payload_map.get("diagnostic"):
        return payload_map
    loaded = await load_user_skill_map(user_id)
    if loaded:
        return loaded
    return default_skill_map(user_id, profession)
