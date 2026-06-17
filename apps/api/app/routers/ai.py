"""AI routes — writing feedback, speaking feedback, and Nika tutor chat."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.quota_deps import require_ai_consent, require_ai_quota
from app.core.security import AuthUser, get_current_user
from app.schemas.ai import (
    SpeakingFeedbackRequest,
    SpeakingInterlocutorRequest,
    WritingFeedbackRequest,
)
from app.services.feedback_llm import enrich_speaking_feedback, enrich_writing_feedback
from app.services.generate_assessment import generate_assessment
from app.services.nika_tutor import answer_nika_chat
from app.services.quota import QuotaStatus, peek_quota
from app.services.study_advice import build_study_advice
from app.services.skill_snapshot import apply_speaking_to_snapshot, apply_writing_to_snapshot
from app.services.speaking_interlocutor import next_interlocutor_line
from app.services.speaking_feedback import analyse_speaking
from app.services.user_skill_map import resolve_skill_map
from app.services.writing_feedback import analyse_writing

router = APIRouter()


class NikaStudyPlanRequest(BaseModel):
    skill_map: dict
    profession: str | None = None
    country: str | None = None
    regulator: str | None = None
    exam_weeks: int | None = None


class NikaChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    profession: str | None = None
    regulator: str | None = None
    country: str | None = None
    skill_focus: str | None = None
    skill_map: dict | None = None
    native_language: str | None = None
    exclude_ids: list[str] = Field(default_factory=list, max_length=50)


class GenerateAssessmentRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    profession: str | None = None
    skill_map: dict | None = None
    exclude_ids: list[str] = Field(default_factory=list, max_length=50)


def _writing_payload(body: WritingFeedbackRequest) -> dict:
    return body.model_dump(exclude_none=True)


def _speaking_payload(body: SpeakingFeedbackRequest) -> dict:
    data = body.model_dump(exclude_none=True)
    if body.messages:
        data["messages"] = [m.model_dump() for m in body.messages]
    return data


@router.post("/writing-feedback")
async def writing_feedback(
    body: WritingFeedbackRequest,
    user: AuthUser = Depends(get_current_user),
    _quota: QuotaStatus = Depends(require_ai_quota),
) -> dict:
    payload = _writing_payload(body)
    result = analyse_writing(payload)
    result = await enrich_writing_feedback(result, payload)

    weak_tags = []
    scores = result.get("criterion_scores", {})
    tag_map = {
        "purpose": "writing:purpose",
        "content": "writing:content-selection",
        "conciseness": "writing:conciseness",
        "genre": "writing:genre",
        "organisation": "writing:organisation",
        "language": "writing:language",
    }
    for key, score in scores.items():
        if score < 0.6:
            weak_tags.append(tag_map.get(key, f"writing:{key}"))

    snapshot = await resolve_skill_map(
        user.id,
        payload_map=payload.get("skill_map"),
        profession=payload.get("profession"),
    )
    updated = apply_writing_to_snapshot(snapshot, scores, weak_tags)

    return {
        **result,
        "user_id": user.id,
        "skill_map_delta": updated.get("diagnostic", {}).get("writing"),
        "priority": updated.get("priority"),
    }


@router.post("/speaking-interlocutor")
async def speaking_interlocutor(
    body: SpeakingInterlocutorRequest,
    user: AuthUser = Depends(get_current_user),
    _quota: QuotaStatus = Depends(require_ai_quota),
) -> dict:
    payload = body.model_dump()
    payload["messages"] = [m.model_dump() for m in body.messages]
    result = await next_interlocutor_line(payload)
    return {"user_id": user.id, **result}


@router.post("/speaking-feedback")
async def speaking_feedback(
    body: SpeakingFeedbackRequest,
    user: AuthUser = Depends(get_current_user),
    _quota: QuotaStatus = Depends(require_ai_quota),
) -> dict:
    payload = _speaking_payload(body)
    result = analyse_speaking(payload)
    result = await enrich_speaking_feedback(result, payload)

    weak_tags = result.get("weak_tags", [])

    snapshot = await resolve_skill_map(
        user.id,
        payload_map=payload.get("skill_map"),
        profession=payload.get("profession"),
    )
    clinical = result.get("clinical_scores", {})
    avg = sum(clinical.values()) / max(len(clinical), 1) if clinical else 0.6
    updated = apply_speaking_to_snapshot(snapshot, avg, weak_tags)

    return {
        **result,
        "user_id": user.id,
        "skill_map_delta": updated.get("diagnostic", {}).get("speaking"),
        "priority": updated.get("priority"),
    }


@router.post("/generate-assessment")
async def nika_generate_assessment(
    payload: GenerateAssessmentRequest,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    result = await generate_assessment(
        payload.message.strip(),
        profession=payload.profession,
        skill_map=payload.skill_map,
        exclude_ids=payload.exclude_ids,
    )
    return {"user_id": user.id, **result}


@router.post("/chat")
async def nika_chat(
    payload: NikaChatRequest,
    user: AuthUser = Depends(get_current_user),
    _quota: QuotaStatus = Depends(require_ai_quota),
) -> dict:
    result = await answer_nika_chat(
        user_id=user.id,
        message=payload.message.strip(),
        profession=payload.profession,
        regulator=payload.regulator,
        country=payload.country,
        skill_map=payload.skill_map,
        skill_focus=payload.skill_focus,
        native_language=payload.native_language,
        exclude_ids=payload.exclude_ids,
        skip_quota=True,
    )
    return {
        "user_id": user.id,
        "question": payload.message,
        **result,
    }


@router.post("/study-plan")
async def nika_study_plan(
    payload: NikaStudyPlanRequest,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    from app.services.content_pickers import load_picker_pools

    pools = await load_picker_pools()
    advice = build_study_advice(
        payload.skill_map,
        profession=payload.profession,
        country=payload.country,
        exam_weeks=payload.exam_weeks,
        content_pools=pools,
    )
    return {
        "user_id": user.id,
        "regulator": payload.regulator,
        **advice,
    }


@router.get("/chat/quota")
async def nika_chat_quota(
    user: AuthUser = Depends(get_current_user),
    _consent: AuthUser = Depends(require_ai_consent),
) -> dict:
    status = await peek_quota(user.id)
    return {
        "user_id": user.id,
        "used": status.used,
        "limit": status.limit,
        "resets_at": status.resets_at,
    }
