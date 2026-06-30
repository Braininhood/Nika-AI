"""Admin email preview and bulk campaigns."""

from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException

from app.schemas.admin_groups import (
    EmailCampaignRequest,
    EmailCampaignResult,
    EmailPreviewRequest,
    EmailPreviewResponse,
    SmartSegmentInfo,
)
from app.schemas.admin_users import SendUserEmailRequest
from app.services import admin_groups
from app.services import email as email_service
from app.services import email_templates
from app.services import supabase_auth_admin as auth_admin
from app.services.admin_users import send_user_email
from app.services.user_progress_email import progress_variables_for_user

logger = logging.getLogger(__name__)

SMART_SEGMENTS: dict[str, dict[str, str]] = {
    "all_learners": {
        "name": "All learners",
        "description": "Every non-admin account that is not banned.",
    },
    "onboarding_incomplete": {
        "name": "Onboarding incomplete",
        "description": "Signed up but never finished onboarding.",
    },
    "email_unverified": {
        "name": "Magic link pending",
        "description": "Email signup only — requested a sign-in link but never clicked it (Google/OAuth excluded).",
    },
    "inactive_30d": {
        "name": "Inactive 30+ days",
        "description": "No sign-in in the last 30 days (or never signed in).",
    },
    "no_practice": {
        "name": "No practice yet",
        "description": "Zero recorded practice attempts.",
    },
    "active_7d": {
        "name": "Active last 7 days",
        "description": "Signed in during the past week.",
    },
    "exam_soon": {
        "name": "Exam within 30 days",
        "description": "Learners with an exam date in the next 30 days.",
    },
}


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


async def _load_all_auth_users() -> list[dict[str, Any]]:
    users: list[dict[str, Any]] = []
    page = 1
    while True:
        batch, _ = await auth_admin.list_auth_users(page=page, per_page=200)
        users.extend(batch)
        if len(batch) < 200:
            break
        page += 1
    return users


async def _load_profiles_map(user_ids: list[str]) -> dict[str, dict[str, Any]]:
    if not user_ids:
        return {}
    from app.core.supabase_rest import supabase_rest

    rows = await supabase_rest(
        "GET",
        "profiles",
        params={
            "id": f"in.({','.join(user_ids)})",
            "select": "id,email,onboarding_completed_at",
        },
    )
    if not isinstance(rows, list):
        return {}
    return {str(r["id"]): r for r in rows if isinstance(r, dict) and r.get("id")}


async def _load_attempt_user_ids() -> set[str]:
    from app.core.supabase_rest import supabase_rest

    rows = await supabase_rest("GET", "attempts", params={"select": "user_id", "limit": "10000"})
    if not isinstance(rows, list):
        return set()
    return {str(r["user_id"]) for r in rows if isinstance(r, dict) and r.get("user_id")}


def _is_sendable_learner(user: dict[str, Any]) -> bool:
    if auth_admin.auth_user_role(user) == "admin":
        return False
    if auth_admin.auth_user_banned(user):
        return False
    return bool(user.get("email"))


async def resolve_segment_user_ids(segment_id: str) -> list[str]:
    if segment_id not in SMART_SEGMENTS:
        raise HTTPException(status_code=404, detail="Segment not found")

    users = await _load_all_auth_users()
    learners = [u for u in users if _is_sendable_learner(u)]
    user_ids = [str(u["id"]) for u in learners if u.get("id")]

    if segment_id == "all_learners":
        return user_ids

    profiles = await _load_profiles_map(user_ids)
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)

    if segment_id == "onboarding_incomplete":
        return [
            uid
            for uid in user_ids
            if not (profiles.get(uid) or {}).get("onboarding_completed_at")
        ]

    if segment_id == "email_unverified":
        return [str(u["id"]) for u in learners if auth_admin.is_magic_link_pending(u)]

    if segment_id == "inactive_30d":
        inactive: list[str] = []
        for user in learners:
            uid = str(user.get("id") or "")
            last = _parse_dt(user.get("last_sign_in_at"))
            if not last or last < month_ago:
                inactive.append(uid)
        return inactive

    if segment_id == "no_practice":
        with_attempts = await _load_attempt_user_ids()
        return [uid for uid in user_ids if uid not in with_attempts]

    if segment_id == "active_7d":
        week_ago = now - timedelta(days=7)
        active: list[str] = []
        for user in learners:
            last = _parse_dt(user.get("last_sign_in_at"))
            if last and last >= week_ago:
                active.append(str(user.get("id")))
        return active

    if segment_id == "exam_soon":
        from app.core.supabase_rest import supabase_rest

        if not user_ids:
            return []
        exam_rows = await supabase_rest(
            "GET",
            "profiles",
            params={
                "id": f"in.({','.join(user_ids)})",
                "select": "id,exam_date",
                "exam_date": "not.is.null",
            },
        )
        if not isinstance(exam_rows, list):
            return []
        soon: list[str] = []
        today = now.date()
        horizon = today + timedelta(days=30)
        for row in exam_rows:
            if not isinstance(row, dict):
                continue
            uid = str(row.get("id") or "")
            raw = row.get("exam_date")
            if not raw:
                continue
            try:
                exam_day = date.fromisoformat(str(raw)[:10])
            except ValueError:
                continue
            if today <= exam_day <= horizon:
                soon.append(uid)
        return soon

    return []


async def list_smart_segments() -> list[SmartSegmentInfo]:
    segments: list[SmartSegmentInfo] = []
    for segment_id, meta in SMART_SEGMENTS.items():
        user_ids = await resolve_segment_user_ids(segment_id)
        segments.append(
            SmartSegmentInfo(
                id=segment_id,
                name=meta["name"],
                description=meta["description"],
                member_count=len(user_ids),
            )
        )
    return segments


async def preview_email(body: EmailPreviewRequest) -> EmailPreviewResponse:
    email: str | None = body.sample_email
    metadata: dict[str, Any] | None = None

    if body.sample_user_id:
        auth_user = await auth_admin.get_auth_user(body.sample_user_id)
        email = auth_user.get("email") or email
        metadata = auth_user.get("user_metadata")

    if not email:
        email = "student@example.com"

    overrides: dict[str, Any] = dict(body.variables or {})
    if email_templates.is_personalized(body.template_id):
        if body.sample_user_id:
            progress = await progress_variables_for_user(body.sample_user_id)
        else:
            from app.services.user_progress_email import demo_progress_variables

            progress = demo_progress_variables()
        overrides = {**progress, **overrides}

    variables = email_templates.build_template_variables(
        email=email,
        user_metadata=metadata,
        overrides=overrides,
        template_id=body.template_id,
    )
    default_subject, html = email_templates.render_email_template(body.template_id, variables)
    subject = body.subject.strip() if body.subject and body.subject.strip() else default_subject
    return EmailPreviewResponse(
        subject=subject,
        html=html,
        plain_text=email_templates.html_to_plain_text(html),
    )


async def _resolve_audience_user_ids(body: EmailCampaignRequest) -> list[str]:
    if body.audience_type == "users":
        return list(dict.fromkeys(body.user_ids))
    if body.audience_type == "group":
        if not body.group_id:
            raise HTTPException(status_code=400, detail="group_id is required")
        return await admin_groups.resolve_group_user_ids(body.group_id)
    if body.audience_type == "segment":
        if not body.segment_id:
            raise HTTPException(status_code=400, detail="segment_id is required")
        return await resolve_segment_user_ids(body.segment_id)
    raise HTTPException(status_code=400, detail="Invalid audience type")


async def run_email_campaign(body: EmailCampaignRequest, *, actor_id: str) -> EmailCampaignResult:
    user_ids = await _resolve_audience_user_ids(body)
    audience_size = len(user_ids)

    if body.dry_run:
        return EmailCampaignResult(
            audience_size=audience_size,
            sent=0,
            failed=0,
            skipped=0,
            dry_run=True,
        )

    sent = 0
    failed = 0
    skipped = 0
    errors: list[str] = []

    send_body = SendUserEmailRequest(
        template_id=body.template_id,
        from_address=body.from_address,
        subject=body.subject,
        variables=body.variables,
    )

    for user_id in user_ids:
        try:
            auth_user = await auth_admin.get_auth_user(user_id)
            if not _is_sendable_learner(auth_user):
                skipped += 1
                continue
            await send_user_email(user_id, send_body)
            sent += 1
            await asyncio.sleep(0.55)
        except HTTPException as exc:
            failed += 1
            detail = exc.detail if isinstance(exc.detail, str) else "Send failed"
            errors.append(f"{user_id}: {detail}")
        except Exception:
            failed += 1
            errors.append(f"{user_id}: unexpected error")

    logger.info(
        "Admin %s campaign %s → sent=%s failed=%s skipped=%s audience=%s",
        actor_id,
        body.template_id,
        sent,
        failed,
        skipped,
        audience_size,
    )
    return EmailCampaignResult(
        audience_size=audience_size,
        sent=sent,
        failed=failed,
        skipped=skipped,
        dry_run=False,
        errors=errors[:20],
    )
