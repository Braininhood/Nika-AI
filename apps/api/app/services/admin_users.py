"""Admin user management — list, CRUD, stats, email."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException

from app.core.supabase_rest import supabase_rest
from app.schemas.admin_users import (
    AdminUserActivityStats,
    AdminUserCreate,
    AdminUserDetail,
    AdminUserListItem,
    AdminUserListResponse,
    AdminUserStatsSummary,
    AdminUserUpdate,
    SendUserEmailRequest,
    SendUserEmailResponse,
)
from app.schemas.profile import ProfileResponse
from app.services import email as email_service
from app.services import email_templates
from app.services import supabase_auth_admin as auth_admin
from app.services.gdpr import delete_user_account
from app.services.user_progress_email import progress_variables_for_user

logger = logging.getLogger(__name__)


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


async def _fetch_profiles_map(user_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not user_ids:
        return {}
    ids = ",".join(user_ids)
    rows = await supabase_rest(
        "GET",
        "profiles",
        params={"id": f"in.({ids})", "select": "*"},
    )
    if not isinstance(rows, list):
        return {}
    return {str(row["id"]): row for row in rows if isinstance(row, dict) and row.get("id")}


async def _fetch_attempt_stats(user_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not user_ids:
        return {}
    ids = ",".join(user_ids)
    rows = await supabase_rest(
        "GET",
        "attempts",
        params={
            "user_id": f"in.({ids})",
            "select": "user_id,skill,created_at",
            "order": "created_at.desc",
            "limit": "5000",
        },
    )
    if not isinstance(rows, list):
        return {}

    stats: dict[str, dict[str, Any]] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        uid = str(row.get("user_id") or "")
        if not uid:
            continue
        bucket = stats.setdefault(uid, {"count": 0, "last": None, "by_skill": {}})
        bucket["count"] += 1
        skill = str(row.get("skill") or "unknown")
        bucket["by_skill"][skill] = bucket["by_skill"].get(skill, 0) + 1
        created = row.get("created_at")
        if created and not bucket["last"]:
            bucket["last"] = created
    return stats


def _profile_to_response(row: dict[str, Any] | None) -> ProfileResponse | None:
    if not row:
        return None
    grades = row.get("target_grades")
    return ProfileResponse(
        id=str(row["id"]),
        email=row.get("email"),
        profession=row.get("profession"),
        target_country=row.get("target_country"),
        target_regulator=row.get("target_regulator"),
        target_grades=grades if isinstance(grades, dict) else None,
        onboarding_complete=bool(row.get("onboarding_completed_at")),
        exam_date=row.get("exam_date"),
        study_goal=row.get("study_goal") or "training",
        ai_consent=bool(row.get("ai_consent_at")),
        ai_consent_at=row.get("ai_consent_at"),
    )


def _merge_list_item(
    auth_user: dict[str, Any],
    profile: dict[str, Any] | None,
    attempt_stats: dict[str, Any] | None,
) -> AdminUserListItem:
    attempt_stats = attempt_stats or {}
    return AdminUserListItem(
        id=str(auth_user.get("id")),
        email=auth_user.get("email"),
        role=auth_admin.auth_user_role(auth_user),
        created_at=auth_user.get("created_at"),
        last_sign_in_at=auth_user.get("last_sign_in_at"),
        email_confirmed=auth_admin.is_email_verified(auth_user),
        magic_link_pending=auth_admin.is_magic_link_pending(auth_user),
        providers=auth_admin.auth_user_providers(auth_user),
        banned=auth_admin.auth_user_banned(auth_user),
        profession=profile.get("profession") if profile else None,
        target_country=profile.get("target_country") if profile else None,
        onboarding_complete=bool(profile.get("onboarding_completed_at")) if profile else False,
        attempt_count=int(attempt_stats.get("count") or 0),
        last_activity_at=attempt_stats.get("last"),
    )


async def get_users_stats() -> AdminUserStatsSummary:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    users: list[dict[str, Any]] = []
    page = 1
    while True:
        batch, _ = await auth_admin.list_auth_users(page=page, per_page=200)
        users.extend(batch)
        if len(batch) < 200:
            break
        page += 1

    profiles = await supabase_rest("GET", "profiles", params={"select": "id,onboarding_completed_at"})
    onboarding_complete = 0
    if isinstance(profiles, list):
        onboarding_complete = sum(1 for p in profiles if isinstance(p, dict) and p.get("onboarding_completed_at"))

    active_7d = 0
    active_30d = 0
    new_7d = 0
    banned = 0
    for user in users:
        if auth_admin.auth_user_banned(user):
            banned += 1
        created = _parse_dt(user.get("created_at"))
        if created and created >= week_ago:
            new_7d += 1
        last_sign_in = _parse_dt(user.get("last_sign_in_at"))
        if last_sign_in and last_sign_in >= week_ago:
            active_7d += 1
        if last_sign_in and last_sign_in >= month_ago:
            active_30d += 1

    return AdminUserStatsSummary(
        total_users=len(users),
        active_7d=active_7d,
        active_30d=active_30d,
        new_7d=new_7d,
        onboarding_complete=onboarding_complete,
        banned=banned,
    )


async def list_users(
    *,
    page: int = 1,
    per_page: int = 25,
    search: str | None = None,
    role: str | None = None,
) -> AdminUserListResponse:
    per_page = max(1, min(per_page, 100))
    page = max(1, page)

    if search:
        search_lower = search.strip().lower()
        all_users: list[dict[str, Any]] = []
        fetch_page = 1
        while True:
            batch, _ = await auth_admin.list_auth_users(page=fetch_page, per_page=200)
            all_users.extend(batch)
            if len(batch) < 200:
                break
            fetch_page += 1

        if role:
            all_users = [u for u in all_users if auth_admin.auth_user_role(u) == role]
        if search_lower:
            all_users = [
                u
                for u in all_users
                if search_lower in (u.get("email") or "").lower()
                or search_lower in str(u.get("id") or "").lower()
            ]

        total = len(all_users)
        start = (page - 1) * per_page
        page_users = all_users[start : start + per_page]
    else:
        page_users, total = await auth_admin.list_auth_users(page=page, per_page=per_page)
        if role:
            page_users = [u for u in page_users if auth_admin.auth_user_role(u) == role]
            if total is None:
                total = len(page_users)

    user_ids = [str(u["id"]) for u in page_users if u.get("id")]
    profiles_map = await _fetch_profiles_map(user_ids)
    attempt_map = await _fetch_attempt_stats(user_ids)

    items = [
        _merge_list_item(
            user,
            profiles_map.get(str(user.get("id"))),
            attempt_map.get(str(user.get("id"))),
        )
        for user in page_users
    ]

    return AdminUserListResponse(
        users=items,
        page=page,
        per_page=per_page,
        total=total if total is not None else len(items),
    )


async def get_user_detail(user_id: str) -> AdminUserDetail:
    auth_user = await auth_admin.get_auth_user(user_id)
    profiles_map = await _fetch_profiles_map([user_id])
    profile_row = profiles_map.get(user_id)
    attempt_map = await _fetch_attempt_stats([user_id])
    attempt_stats = attempt_map.get(user_id, {})

    diagnostic = await supabase_rest(
        "GET",
        "diagnostic_sessions",
        params={"user_id": f"eq.{user_id}", "select": "id", "limit": "500"},
    )
    vocabulary = await supabase_rest(
        "GET",
        "vocabulary_entries",
        params={"user_id": f"eq.{user_id}", "select": "id", "limit": "500"},
    )

    activity = AdminUserActivityStats(
        attempt_count=int(attempt_stats.get("count") or 0),
        last_activity_at=attempt_stats.get("last"),
        by_skill=attempt_stats.get("by_skill") or {},
        diagnostic_count=len(diagnostic) if isinstance(diagnostic, list) else 0,
        vocabulary_count=len(vocabulary) if isinstance(vocabulary, list) else 0,
    )

    return AdminUserDetail(
        id=str(auth_user.get("id")),
        email=auth_user.get("email"),
        role=auth_admin.auth_user_role(auth_user),
        created_at=auth_user.get("created_at"),
        last_sign_in_at=auth_user.get("last_sign_in_at"),
        email_confirmed=auth_admin.is_email_verified(auth_user),
        magic_link_pending=auth_admin.is_magic_link_pending(auth_user),
        banned=auth_admin.auth_user_banned(auth_user),
        banned_until=auth_user.get("banned_until"),
        providers=auth_admin.auth_user_providers(auth_user),
        profile=_profile_to_response(profile_row),
        activity=activity,
    )


async def create_user(body: AdminUserCreate) -> AdminUserDetail:
    auth_user = await auth_admin.create_auth_user(
        email=body.email,
        role=body.role,
        email_confirm=True,
    )
    user_id = str(auth_user.get("id") or "")
    if not user_id:
        raise HTTPException(status_code=502, detail="Could not create user")

    profile_patch: dict[str, Any] = {"email": body.email}
    if body.profession:
        profile_patch["profession"] = body.profession
    if body.target_country:
        profile_patch["target_country"] = body.target_country

    await supabase_rest(
        "PATCH",
        "profiles",
        params={"id": f"eq.{user_id}"},
        json=profile_patch,
        prefer="return=minimal",
    )

    if body.send_invite:
        try:
            link = await auth_admin.generate_magic_link(body.email)
            variables = email_templates.build_template_variables(
                email=body.email,
                user_metadata=auth_user.get("user_metadata"),
                overrides={"MessageBody": f"Your OET Coach account is ready. Sign in here: {link}"},
                template_id="custom_message",
            )
            subject, html = email_templates.render_email_template("custom_message", variables)
            await email_service.send_email(
                to=body.email,
                subject=subject,
                html=html,
                from_address="noreply",
            )
        except HTTPException:
            raise
        except Exception:
            logger.exception("Invite email failed for %s", body.email)

    logger.info("Admin created user %s (%s)", user_id, body.email)
    return await get_user_detail(user_id)


async def update_user(user_id: str, body: AdminUserUpdate, *, actor_id: str) -> AdminUserDetail:
    auth_patch: dict[str, Any] = {}

    if body.email is not None:
        auth_patch["email"] = body.email
    if body.role is not None:
        auth_user = await auth_admin.get_auth_user(user_id)
        meta = auth_user.get("app_metadata") or {}
        auth_patch["app_metadata"] = {**meta, "role": body.role}
    if body.banned is not None:
        auth_patch["ban_duration"] = "876000h" if body.banned else "none"

    if auth_patch:
        await auth_admin.update_auth_user(user_id, auth_patch)

    if body.profile is not None:
        patch = body.profile.model_dump(exclude_unset=True)
        if patch.get("onboarding_complete") is True:
            patch["onboarding_completed_at"] = datetime.now(timezone.utc).isoformat()
            patch.pop("onboarding_complete", None)
        elif patch.get("onboarding_complete") is False:
            patch["onboarding_completed_at"] = None
            patch.pop("onboarding_complete", None)
        if patch.get("ai_consent") is True:
            patch["ai_consent_at"] = datetime.now(timezone.utc).isoformat()
            patch.pop("ai_consent", None)
        elif patch.get("ai_consent") is False:
            patch["ai_consent_at"] = None
            patch.pop("ai_consent", None)
        if "target_grades" in patch and patch["target_grades"] is not None:
            grades = patch["target_grades"]
            patch["target_grades"] = grades.model_dump() if hasattr(grades, "model_dump") else grades

        if patch:
            await supabase_rest(
                "PATCH",
                "profiles",
                params={"id": f"eq.{user_id}"},
                json=patch,
                prefer="return=minimal",
            )

    logger.info("Admin %s updated user %s", actor_id, user_id)
    return await get_user_detail(user_id)


async def delete_user(user_id: str, *, actor_id: str) -> None:
    if user_id == actor_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account from admin")
    await delete_user_account(user_id)
    logger.info("Admin %s deleted user %s", actor_id, user_id)


async def send_user_email(user_id: str, body: SendUserEmailRequest) -> SendUserEmailResponse:
    auth_user = await auth_admin.get_auth_user(user_id)
    email = auth_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="User has no email address")

    overrides: dict[str, Any] = dict(body.variables or {})
    if email_templates.is_personalized(body.template_id):
        progress = await progress_variables_for_user(user_id)
        overrides = {**progress, **overrides}

    variables = email_templates.build_template_variables(
        email=email,
        user_metadata=auth_user.get("user_metadata"),
        overrides=overrides,
        template_id=body.template_id,
    )
    subject, html = email_templates.render_email_template(body.template_id, variables)
    if body.subject:
        subject = body.subject

    message_id = await email_service.send_email(
        to=email,
        subject=subject,
        html=html,
        from_address=body.from_address,
    )
    logger.info("Admin sent %s email to %s (%s)", body.template_id, email, user_id)
    return SendUserEmailResponse(ok=True, message_id=message_id)
