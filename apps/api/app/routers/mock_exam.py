"""Mock exam submit API."""

from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.security import AuthUser, get_current_user
from app.services.readiness import compute_readiness_state, mock_meets_target

router = APIRouter()

VALID_GRADES = frozenset({"A", "B", "C+", "C", "D", "E"})
_MOCK_ID = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


class MockSubmitBody(BaseModel):
    mock_id: str = Field(alias="mockId", min_length=1, max_length=64)
    skill_grades: dict[str, str] = Field(alias="skillGrades")
    target_grades: dict[str, str] = Field(alias="targetGrades")

    model_config = {"populate_by_name": True}

    @field_validator("mock_id")
    @classmethod
    def valid_mock_id(cls, value: str) -> str:
        if not _MOCK_ID.match(value):
            raise ValueError("Invalid mock id")
        return value

    @field_validator("skill_grades", "target_grades")
    @classmethod
    def valid_grades(cls, value: dict[str, str]) -> dict[str, str]:
        for skill, grade in value.items():
            if skill not in ("listening", "reading", "writing", "speaking"):
                raise ValueError(f"Invalid skill: {skill}")
            if grade not in VALID_GRADES:
                raise ValueError(f"Invalid grade: {grade}")
        return value


@router.post("/submit")
async def submit_mock(
    body: MockSubmitBody,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    if not body.skill_grades:
        raise HTTPException(status_code=400, detail="skill_grades required")

    passed = mock_meets_target(body.skill_grades, body.target_grades)
    consecutive = 2 if passed else 0
    state = compute_readiness_state(consecutive if passed else 0, all_gates_met=False)
    if passed:
        state = "mock_pass_pending" if consecutive < 2 else "exam_ready"

    failed = [
        s
        for s in ("listening", "reading", "writing", "speaking")
        if body.skill_grades.get(s)
        and __import__("app.services.readiness", fromlist=["_grade_index"])._grade_index(
            body.skill_grades[s]
        )
        < __import__("app.services.readiness", fromlist=["_grade_index"])._grade_index(
            body.target_grades.get(s, "B")
        )
    ]

    return {
        "mockId": body.mock_id,
        "userId": user.id,
        "passed": passed,
        "failedSkills": failed,
        "readinessState": "studying" if not passed else state,
        "consecutivePasses": consecutive,
        "adaptPlan": not passed,
    }
