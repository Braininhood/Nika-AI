"""Admin groups, segments, and email campaigns."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import AuthUser, require_admin
from app.schemas.admin_groups import (
    EmailCampaignRequest,
    EmailCampaignResult,
    EmailPreviewRequest,
    EmailPreviewResponse,
    GroupMembersUpdate,
    SmartSegmentInfo,
    UserGroupCreate,
    UserGroupDetail,
    UserGroupSummary,
    UserGroupUpdate,
)
from app.services import admin_groups as groups_service
from app.services import admin_messaging as messaging_service

router = APIRouter()


@router.get("/groups", response_model=list[UserGroupSummary])
async def list_groups(_admin: AuthUser = Depends(require_admin)) -> list[UserGroupSummary]:
    return await groups_service.list_groups()


@router.post("/groups", response_model=UserGroupSummary, status_code=201)
async def create_group(
    body: UserGroupCreate,
    _admin: AuthUser = Depends(require_admin),
) -> UserGroupSummary:
    return await groups_service.create_group(body)


@router.get("/groups/{group_id}", response_model=UserGroupDetail)
async def get_group(
    group_id: str,
    _admin: AuthUser = Depends(require_admin),
) -> UserGroupDetail:
    return await groups_service.get_group(group_id)


@router.patch("/groups/{group_id}", response_model=UserGroupSummary)
async def update_group(
    group_id: str,
    body: UserGroupUpdate,
    _admin: AuthUser = Depends(require_admin),
) -> UserGroupSummary:
    return await groups_service.update_group(group_id, body)


@router.delete("/groups/{group_id}", status_code=204)
async def delete_group(
    group_id: str,
    _admin: AuthUser = Depends(require_admin),
) -> None:
    await groups_service.delete_group(group_id)


@router.post("/groups/{group_id}/members", response_model=UserGroupDetail)
async def add_group_members(
    group_id: str,
    body: GroupMembersUpdate,
    _admin: AuthUser = Depends(require_admin),
) -> UserGroupDetail:
    return await groups_service.add_group_members(group_id, body)


@router.delete("/groups/{group_id}/members/{user_id}", response_model=UserGroupDetail)
async def remove_group_member(
    group_id: str,
    user_id: str,
    _admin: AuthUser = Depends(require_admin),
) -> UserGroupDetail:
    return await groups_service.remove_group_member(group_id, user_id)


@router.get("/segments", response_model=list[SmartSegmentInfo])
async def list_segments(_admin: AuthUser = Depends(require_admin)) -> list[SmartSegmentInfo]:
    return await messaging_service.list_smart_segments()


@router.post("/email/preview", response_model=EmailPreviewResponse)
async def preview_email(
    body: EmailPreviewRequest,
    _admin: AuthUser = Depends(require_admin),
) -> EmailPreviewResponse:
    return await messaging_service.preview_email(body)


@router.post("/email/campaign", response_model=EmailCampaignResult)
async def send_campaign(
    body: EmailCampaignRequest,
    admin: AuthUser = Depends(require_admin),
) -> EmailCampaignResult:
    return await messaging_service.run_email_campaign(body, actor_id=admin.id)
