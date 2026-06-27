"""Validated request bodies for AI routes — OWASP input validation."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field, field_validator

MAX_LETTER_CHARS = 12_000
MAX_TRANSCRIPT_CHARS = 8_000
MAX_MESSAGES = 40
MAX_MESSAGE_CHARS = 2_000


class WritingFeedbackRequest(BaseModel):
    letter_text: str = Field(default="", max_length=MAX_LETTER_CHARS)
    word_count: int | None = Field(default=None, ge=0, le=5000)
    profession: str | None = Field(default=None, max_length=64)
    scenario_id: str | None = Field(default=None, max_length=128)
    skill_map: dict[str, Any] | None = None
    criterion_scores: dict[str, float] | None = None
    scenario_context: dict[str, object] | None = None

    @field_validator("criterion_scores")
    @classmethod
    def clamp_scores(cls, value: dict[str, float] | None) -> dict[str, float] | None:
        if not value:
            return value
        return {k: max(0.0, min(1.0, float(v))) for k, v in list(value.items())[:12]}


class SpeakingMessage(BaseModel):
    role: str = Field(..., max_length=16)
    text: str = Field(default="", max_length=MAX_MESSAGE_CHARS)


class SpeakingFeedbackRequest(BaseModel):
    transcript: str = Field(default="", max_length=MAX_TRANSCRIPT_CHARS)
    profession: str | None = Field(default=None, max_length=64)
    role_card_id: str | None = Field(default=None, max_length=128)
    skill_map: dict[str, Any] | None = None
    messages: list[SpeakingMessage] = Field(default_factory=list, max_length=MAX_MESSAGES)
    patient_concerns: list[str] = Field(default_factory=list, max_length=8)
    patient_knowledge: str = Field(default="", max_length=2000)
    clinical_scores: dict[str, float] | None = None


class SpeakingInterlocutorRequest(BaseModel):
    role_card_id: str | None = Field(default=None, max_length=128)
    interlocutor_role: str | None = Field(default=None, max_length=64)
    patient_details: str = Field(default="", max_length=2000)
    messages: list[SpeakingMessage] = Field(default_factory=list, max_length=MAX_MESSAGES)
    patient_concerns: list[str] = Field(default_factory=list, max_length=8)
    patient_knowledge: str = Field(default="", max_length=2000)
    profession: str | None = Field(default=None, max_length=64)
    scenario_id: str | None = Field(default=None, max_length=128)
