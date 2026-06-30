"""Admin user management routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.security import AuthUser, require_admin
from app.schemas.admin_users import (
    AdminUserCreate,
    AdminUserDetail,
    AdminUserListResponse,
    AdminUserStatsSummary,
    AdminUserUpdate,
    EmailTemplateInfo,
    SendUserEmailRequest,
    SendUserEmailResponse,
)
from app.services import admin_users as admin_users_service
from app.services import email_templates

router = APIRouter()


@router.get("/users/stats", response_model=AdminUserStatsSummary)
async def users_stats(_admin: AuthUser = Depends(require_admin)) -> AdminUserStatsSummary:
    return await admin_users_service.get_users_stats()


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: str | None = Query(None, max_length=200),
    role: str | None = Query(None, pattern="^(learner|admin)$"),
    _admin: AuthUser = Depends(require_admin),
) -> AdminUserListResponse:
    return await admin_users_service.list_users(
        page=page,
        per_page=per_page,
        search=search,
        role=role,
    )


@router.get("/users/{user_id}", response_model=AdminUserDetail)
async def get_user(
    user_id: str,
    _admin: AuthUser = Depends(require_admin),
) -> AdminUserDetail:
    return await admin_users_service.get_user_detail(user_id)


@router.post("/users", response_model=AdminUserDetail, status_code=201)
async def create_user(
    body: AdminUserCreate,
    _admin: AuthUser = Depends(require_admin),
) -> AdminUserDetail:
    return await admin_users_service.create_user(body)


@router.patch("/users/{user_id}", response_model=AdminUserDetail)
async def update_user(
    user_id: str,
    body: AdminUserUpdate,
    admin: AuthUser = Depends(require_admin),
) -> AdminUserDetail:
    return await admin_users_service.update_user(user_id, body, actor_id=admin.id)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    admin: AuthUser = Depends(require_admin),
) -> None:
    await admin_users_service.delete_user(user_id, actor_id=admin.id)


@router.get("/email/templates", response_model=list[EmailTemplateInfo])
async def list_email_templates(
    _admin: AuthUser = Depends(require_admin),
) -> list[EmailTemplateInfo]:
    return [EmailTemplateInfo(**row) for row in email_templates.list_email_templates()]


@router.post("/users/{user_id}/email", response_model=SendUserEmailResponse)
async def send_user_email(
    user_id: str,
    body: SendUserEmailRequest,
    _admin: AuthUser = Depends(require_admin),
) -> SendUserEmailResponse:
    return await admin_users_service.send_user_email(user_id, body)
