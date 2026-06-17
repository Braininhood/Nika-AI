"""Study plan routes — synced with web buildDailyPlan."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user
from app.routers.profile import _load_profile_row
from app.services.attempt_stats import load_attempt_stats
from app.services.content_pickers import load_picker_pools
from app.services.planner import build_daily_plan
from app.services.user_skill_map import load_user_skill_map, default_skill_map

router = APIRouter()


@router.get("/today")
async def get_today_plan(user: AuthUser = Depends(get_current_user)) -> dict:
    profile_row = await _load_profile_row(user.id)
    profession = profile_row.get("profession") if profile_row else None
    target_country = profile_row.get("target_country") if profile_row else None

    skill_map = await load_user_skill_map(user.id) or default_skill_map(
        user.id, profession
    )
    stats = await load_attempt_stats(user.id)
    rotation = stats.get("recentBySkill") or {}
    pools = await load_picker_pools()

    return build_daily_plan(
        skill_map,
        profession=profession,
        target_country=target_country,
        flashcards_due=0,
        readiness_state=None,
        rotation=rotation,
        content_pools=pools,
    )
