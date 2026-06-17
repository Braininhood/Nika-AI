"""Diagnostic placement test routes — server-side scoring."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.security import AuthUser, get_current_user
from app.routers.profile import _load_profile_row
from app.services.diagnostic import compute_skill_map
from app.services.diagnostic_scoring import score_diagnostic_answer
from app.services.diagnostic_store import append_answer, complete_session, start_session
from app.services.requirements import get_target_grades

from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

SKILLS = ("listening", "reading", "writing", "speaking")


class DiagnosticStartResponse(BaseModel):
    session_id: str
    skills: list[str] = Field(default_factory=lambda: list(SKILLS))
    message: str = "Diagnostic session started"


class DiagnosticAnswer(BaseModel):
    skill: str = Field(..., max_length=32)
    item_id: str = Field(..., max_length=64)
    selected_index: int = Field(..., ge=0, le=10)
    # Legacy clients may send correct — ignored; server scores answers.
    correct: bool | None = None
    tier: int | None = None
    tag: str | None = None


class DiagnosticSubmitBody(BaseModel):
    answers: list[DiagnosticAnswer] = Field(default_factory=list, max_length=80)


class DiagnosticSubmitResponse(BaseModel):
    session_id: str
    skill_map: dict
    message: str = "Skill map computed"


@router.post("/start", response_model=DiagnosticStartResponse)
async def start_diagnostic(
    user: AuthUser = Depends(get_current_user),
) -> DiagnosticStartResponse:
    session_id = await start_session(user.id)
    return DiagnosticStartResponse(session_id=session_id)


@router.post("/{session_id}/answer")
async def submit_answer(
    session_id: str,
    body: DiagnosticAnswer,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    scored = score_diagnostic_answer(
        item_id=body.item_id,
        selected_index=body.selected_index,
    )
    if body.skill and body.skill != scored["skill"]:
        raise HTTPException(status_code=400, detail="Skill mismatch for item")

    result = await append_answer(session_id, user.id, scored)
    return {"session_id": session_id, "user_id": user.id, **result, "correct": scored["correct"]}


@router.post("/{session_id}/submit", response_model=DiagnosticSubmitResponse)
async def submit_diagnostic(
    session_id: str,
    body: DiagnosticSubmitBody,
    user: AuthUser = Depends(get_current_user),
) -> DiagnosticSubmitResponse:
    profile_row = await _load_profile_row(user.id)
    profession = (profile_row or {}).get("profession") or "medicine"
    regulator = (profile_row or {}).get("target_regulator") or "GMC"
    target_grades = (profile_row or {}).get("target_grades") or get_target_grades(regulator)

    session = await complete_session(session_id, user.id)
    stored = list(session.get("answers") or []) if session else []
    answers = stored
    if body.answers:
        answers = [
            score_diagnostic_answer(item_id=a.item_id, selected_index=a.selected_index)
            for a in body.answers
        ]

    if not answers:
        raise HTTPException(status_code=400, detail="No diagnostic answers provided")

    skill_map = compute_skill_map(
        answers,
        user_id=user.id,
        profession=profession,
        target_regulator=regulator,
        target_grades=target_grades,
    )
    return DiagnosticSubmitResponse(session_id=session_id, skill_map=skill_map)
