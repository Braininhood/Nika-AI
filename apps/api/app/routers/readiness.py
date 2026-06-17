"""Readiness status API."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, get_current_user
from app.services.attempt_stats import load_attempt_stats
from app.services.readiness import readiness_status_payload
from app.services.readiness_model import predict_readiness_probability, record_training_outcome
from app.services.user_skill_map import default_skill_map, load_user_skill_map

router = APIRouter()


@router.get("/status")
async def get_readiness_status(user: AuthUser = Depends(get_current_user)) -> dict:
    skill_map = await load_user_skill_map(user.id) or default_skill_map(user.id)
    stats = await load_attempt_stats(user.id)
    payload = readiness_status_payload(skill_map, stats, consecutive_passes=0)
    payload["userId"] = user.id
    return payload


@router.get("/predict")
async def predict_readiness(user: AuthUser = Depends(get_current_user)) -> dict:
    skill_map = await load_user_skill_map(user.id) or default_skill_map(user.id)
    stats = await load_attempt_stats(user.id)
    return predict_readiness_probability(skill_map, stats, consecutive_passes=0)


@router.post("/record-outcome")
async def record_outcome(
    body: dict,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    """Record exam-ready outcome for ML retraining."""
    skill_map = await load_user_skill_map(user.id) or default_skill_map(user.id)
    stats = await load_attempt_stats(user.id)
    exam_ready = bool(body.get("examReady"))
    consecutive = int(body.get("consecutiveMockPasses") or 0)
    await record_training_outcome(
        user_id=user.id,
        skill_map=skill_map,
        stats=stats,
        consecutive_passes=consecutive,
        exam_ready=exam_ready,
    )
    return {"ok": True}
