"""Profile request/response schemas."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

OetProfession = Literal[
    "medicine",
    "nursing",
    "pharmacy",
    "dentistry",
    "physiotherapy",
    "radiography",
    "occupational_therapy",
    "optometry",
    "podiatry",
    "veterinary_science",
    "speech_pathology",
    "dietetics",
]


class TargetGradesModel(BaseModel):
    listening: str = "B"
    reading: str = "B"
    writing: str = "B"
    speaking: str = "B"
    single_sitting: bool = False


StudyGoal = Literal["training", "exam_prep"]


class ProfileUpdate(BaseModel):
    profession: OetProfession | None = None
    target_country: str | None = None
    target_regulator: str | None = None
    target_grades: TargetGradesModel | None = None
    onboarding_complete: bool | None = None
    exam_date: str | None = Field(default=None, description="ISO date YYYY-MM-DD")
    study_goal: StudyGoal | None = None
    guest_id: str | None = Field(default=None, description="Guest UUID to merge on sign-up")
    ai_consent: bool | None = Field(default=None, description="Consent for AI processing (GDPR)")


class ProfileResponse(BaseModel):
    id: str
    email: str | None = None
    profession: str | None = None
    target_country: str | None = None
    target_regulator: str | None = None
    target_grades: TargetGradesModel | None = None
    onboarding_complete: bool = False
    exam_date: str | None = None
    study_goal: StudyGoal = "training"
    ai_consent: bool = False
    ai_consent_at: str | None = None


class SkillMapPayload(BaseModel):
    skill_map: dict


class SkillMapResponse(BaseModel):
    skill_map: dict | None = None
    computed_at: str | None = None
