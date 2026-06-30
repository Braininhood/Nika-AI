"""Admin audiences — manual groups, smart segments, email campaigns."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

GroupKind = Literal["manual", "profession", "country"]


class UserGroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    kind: GroupKind = "manual"
    filter_value: str | None = Field(default=None, max_length=120)


class UserGroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    kind: GroupKind | None = None
    filter_value: str | None = Field(default=None, max_length=120)


class UserGroupMemberItem(BaseModel):
    id: str
    email: str | None = None
    profession: str | None = None
    added_at: str | None = None


class UserGroupSummary(BaseModel):
    id: str
    name: str
    description: str | None = None
    kind: GroupKind = "manual"
    filter_value: str | None = None
    member_count: int = 0
    created_at: str | None = None
    updated_at: str | None = None


class UserGroupDetail(UserGroupSummary):
    members: list[UserGroupMemberItem] = Field(default_factory=list)


class SmartSegmentInfo(BaseModel):
    id: str
    name: str
    description: str
    member_count: int = 0


class GroupMembersUpdate(BaseModel):
    user_ids: list[str] = Field(min_length=1)


class EmailPreviewRequest(BaseModel):
    template_id: str
    sample_user_id: str | None = None
    sample_email: str | None = None
    subject: str | None = None
    variables: dict[str, Any] = Field(default_factory=dict)


class EmailPreviewResponse(BaseModel):
    subject: str
    html: str
    plain_text: str


class EmailCampaignRequest(BaseModel):
    template_id: str
    from_address: Literal["noreply", "support"] = "noreply"
    subject: str | None = None
    variables: dict[str, Any] = Field(default_factory=dict)
    dry_run: bool = False
    audience_type: Literal["users", "group", "segment"]
    user_ids: list[str] = Field(default_factory=list)
    group_id: str | None = None
    segment_id: str | None = None


class EmailCampaignResult(BaseModel):
    audience_size: int
    sent: int
    failed: int
    skipped: int
    dry_run: bool
    errors: list[str] = Field(default_factory=list)
