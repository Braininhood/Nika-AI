"""Learner-facing merged content catalog."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import AuthUser, get_current_user
from app.services.content_store import SKILLS, merged_catalog

router = APIRouter()


@router.get("/catalog/{skill}")
async def get_skill_catalog(
    skill: str,
    _user: AuthUser = Depends(get_current_user),
) -> dict:
    if skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")
    return await merged_catalog(skill)
