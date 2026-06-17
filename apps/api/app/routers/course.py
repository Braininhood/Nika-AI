"""Personal course API."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user
from app.routers.profile import _load_profile_row
from app.services.course import generate_personal_course

router = APIRouter()


@router.get("/current")
async def get_current_course(user: AuthUser = Depends(get_current_user)) -> dict:
    profile_row = await _load_profile_row(user.id)
    profession = profile_row.get("profession") if profile_row else None
    skill_map = {
        "diagnostic": {
            "writing": {"gap": 1, "weakTags": ["writing:purpose"]},
            "reading": {"gap": 0, "weakTags": []},
            "listening": {"gap": 0, "weakTags": []},
            "speaking": {"gap": 0, "weakTags": []},
        }
    }
    course = generate_personal_course(skill_map, profession=profession)
    course["userId"] = user.id
    course["version"] = 1
    return course


@router.post("/generate")
async def regenerate_course(user: AuthUser = Depends(get_current_user)) -> dict:
    return await get_current_course(user)
