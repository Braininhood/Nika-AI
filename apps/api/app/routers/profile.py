"""Profile routes — onboarding data and guest merge."""

from __future__ import annotations

from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
from app.core.security import AuthUser, get_current_user
from app.schemas.profile import ProfileResponse, ProfileUpdate, SkillMapPayload, SkillMapResponse, TargetGradesModel
from app.services.requirements import get_target_grades

router = APIRouter()


async def _supabase_rest(
    method: str,
    path: str,
    *,
    json: dict | None = None,
    params: dict | None = None,
) -> list | dict:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

    url = f"{settings.supabase_url.rstrip('/')}/rest/v1/{path}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.request(method, url, headers=headers, json=json, params=params)

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="Could not load profile")

    if not response.content:
        return {}
    data = response.json()
    return data


def _to_profile(row: dict) -> ProfileResponse:
    target_grades = row.get("target_grades")
    grades_model = TargetGradesModel(**target_grades) if target_grades else None
    exam_date = row.get("exam_date")
    ai_consent_at = row.get("ai_consent_at")
    return ProfileResponse(
        id=row["id"],
        email=row.get("email"),
        profession=row.get("profession"),
        target_country=row.get("target_country"),
        target_regulator=row.get("target_regulator"),
        target_grades=grades_model,
        onboarding_complete=row.get("onboarding_completed_at") is not None,
        exam_date=str(exam_date) if exam_date else None,
        study_goal=row.get("study_goal") or ("exam_prep" if exam_date else "training"),
        ai_consent=bool(ai_consent_at),
        ai_consent_at=str(ai_consent_at) if ai_consent_at else None,
    )


async def _load_profile_row(user_id: str) -> dict | None:
    try:
        rows = await _supabase_rest(
            "GET",
            "profiles",
            params={"id": f"eq.{user_id}", "select": "*"},
        )
    except HTTPException:
        return None
    if not rows:
        return None
    return rows[0] if isinstance(rows, list) else rows


@router.get("/me", response_model=ProfileResponse)
async def get_profile(user: AuthUser = Depends(get_current_user)) -> ProfileResponse:
    rows = await _supabase_rest(
        "GET",
        "profiles",
        params={"id": f"eq.{user.id}", "select": "*"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_profile(rows[0])


@router.patch("/me", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    user: AuthUser = Depends(get_current_user),
) -> ProfileResponse:
    payload: dict = {"updated_at": datetime.now(timezone.utc).isoformat()}

    if body.profession is not None:
        payload["profession"] = body.profession
    if body.target_country is not None:
        payload["target_country"] = body.target_country
    if body.target_regulator is not None:
        payload["target_regulator"] = body.target_regulator
        if body.target_grades is None:
            payload["target_grades"] = get_target_grades(body.target_regulator)
    if body.target_grades is not None:
        payload["target_grades"] = body.target_grades.model_dump()
    if body.onboarding_complete is True:
        payload["onboarding_completed_at"] = datetime.now(timezone.utc).isoformat()
    if body.exam_date is not None:
        payload["exam_date"] = body.exam_date or None
    if body.study_goal is not None:
        payload["study_goal"] = body.study_goal
    if body.guest_id:
        payload["guest_id"] = body.guest_id
    if body.ai_consent is True:
        payload["ai_consent_at"] = datetime.now(timezone.utc).isoformat()
    elif body.ai_consent is False:
        payload["ai_consent_at"] = None

    rows = await _supabase_rest(
        "PATCH",
        "profiles",
        json=payload,
        params={"id": f"eq.{user.id}"},
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _to_profile(rows[0] if isinstance(rows, list) else rows)


@router.get("/requirements/{regulator_code}", response_model=TargetGradesModel)
async def get_requirements(regulator_code: str) -> TargetGradesModel:
    return TargetGradesModel(**get_target_grades(regulator_code))


@router.get("/me/skill-map", response_model=SkillMapResponse)
async def get_skill_map(user: AuthUser = Depends(get_current_user)) -> SkillMapResponse:
    rows = await _supabase_rest(
        "GET",
        "user_skill_snapshots",
        params={
            "user_id": f"eq.{user.id}",
            "select": "snapshot,computed_at",
            "order": "computed_at.desc",
            "limit": "1",
        },
    )
    if not rows:
        return SkillMapResponse(skill_map=None, computed_at=None)
    row = rows[0] if isinstance(rows, list) else rows
    computed = row.get("computed_at")
    return SkillMapResponse(
        skill_map=row.get("snapshot") or {},
        computed_at=str(computed) if computed else None,
    )


@router.put("/me/skill-map", response_model=SkillMapResponse)
async def save_skill_map(
    body: SkillMapPayload,
    user: AuthUser = Depends(get_current_user),
) -> SkillMapResponse:
    computed_at = datetime.now(timezone.utc).isoformat()
    rows = await _supabase_rest(
        "POST",
        "user_skill_snapshots",
        json={
            "user_id": user.id,
            "snapshot": body.skill_map,
            "computed_at": computed_at,
        },
    )
    row = rows[0] if isinstance(rows, list) and rows else rows
    snapshot = (row or {}).get("snapshot") if isinstance(row, dict) else body.skill_map
    return SkillMapResponse(skill_map=snapshot or body.skill_map, computed_at=computed_at)


@router.get("/me/export")
async def export_my_data(user: AuthUser = Depends(get_current_user)) -> dict:
    from app.services.gdpr import export_user_data

    return await export_user_data(user.id)


@router.delete("/me")
async def delete_my_account(user: AuthUser = Depends(get_current_user)) -> dict:
    from app.services.gdpr import delete_user_account

    await delete_user_account(user.id)
    return {"status": "deleted", "user_id": user.id}
