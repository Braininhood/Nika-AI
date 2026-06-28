"""Schemas for cross-device study data sync."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AttemptSyncItem(BaseModel):
    id: str
    skill: str
    part: str | None = None
    scenario_id: str | None = None
    score_raw: dict = Field(default_factory=dict)
    grade_estimate: str | None = None
    duration_seconds: int | None = None
    created_at_ms: int
    writing: dict | None = None
    speaking: dict | None = None


class VocabularySyncItem(BaseModel):
    id: str
    word: str
    phrase: str | None = None
    context: str | None = None
    english_explanation: str
    native_translation: str | None = None
    native_language: str = "PL"
    phonetic_hint: str | None = None
    tags: list[str] = Field(default_factory=list)
    source: str = "manual"
    added_at_ms: int
    last_reviewed_at_ms: int | None = None


class StudySyncRequest(BaseModel):
    attempts: list[AttemptSyncItem] = Field(default_factory=list)
    vocabulary: list[VocabularySyncItem] = Field(default_factory=list)
    study_blob: dict = Field(default_factory=dict)
    study_blob_updated_at_ms: int | None = None


class StudySyncResponse(BaseModel):
    status: str
    attempts_upserted: int = 0
    vocabulary_upserted: int = 0
    study_blob_saved: bool = False


class StudyPullResponse(BaseModel):
    attempts: list[dict] = Field(default_factory=list)
    vocabulary: list[dict] = Field(default_factory=list)
    study_blob: dict = Field(default_factory=dict)
    study_blob_updated_at_ms: int | None = None
