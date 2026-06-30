"""Admin user management schemas."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field

from app.schemas.profile import ProfileUpdate, ProfileResponse


class AdminUserStatsSummary(BaseModel):
    total_users: int
    active_7d: int
    active_30d: int
    new_7d: int
    onboarding_complete: int
    banned: int


class AdminUserListItem(BaseModel):
    id: str
    email: str | None = None
    role: str = "learner"
    created_at: str | None = None
    last_sign_in_at: str | None = None
    email_confirmed: bool = False
    magic_link_pending: bool = False
    providers: list[str] = Field(default_factory=list)
    banned: bool = False
    profession: str | None = None
    target_country: str | None = None
    onboarding_complete: bool = False
    attempt_count: int = 0
    last_activity_at: str | None = None


class AdminUserListResponse(BaseModel):
    users: list[AdminUserListItem]
    page: int
    per_page: int
    total: int


class AdminUserActivityStats(BaseModel):
    attempt_count: int = 0
    last_activity_at: str | None = None
    by_skill: dict[str, int] = Field(default_factory=dict)
    diagnostic_count: int = 0
    vocabulary_count: int = 0


class AdminUserDetail(BaseModel):
    id: str
    email: str | None = None
    role: str = "learner"
    created_at: str | None = None
    last_sign_in_at: str | None = None
    email_confirmed: bool = False
    magic_link_pending: bool = False
    providers: list[str] = Field(default_factory=list)
    banned: bool = False
    banned_until: str | None = None
    profile: ProfileResponse | None = None
    activity: AdminUserActivityStats = Field(default_factory=AdminUserActivityStats)


class AdminUserCreate(BaseModel):
    email: EmailStr
    role: Literal["learner", "admin"] = "learner"
    send_invite: bool = True
    profession: str | None = None
    target_country: str | None = None


class AdminUserUpdate(BaseModel):
    email: EmailStr | None = None
    role: Literal["learner", "admin"] | None = None
    banned: bool | None = None
    profile: ProfileUpdate | None = None


class EmailTemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    subject: str
    variables: list[str]
    personalized: bool = False


class SendUserEmailRequest(BaseModel):
    template_id: str
    from_address: Literal["noreply", "support"] = "noreply"
    subject: str | None = None
    variables: dict[str, Any] = Field(default_factory=dict)


class SendUserEmailResponse(BaseModel):
    ok: bool
    message_id: str | None = None
