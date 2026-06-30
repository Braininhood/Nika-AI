"""Branded email templates for admin sends."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from app.core.config import settings

_TEMPLATES_DIR = Path(__file__).resolve().parents[4] / "supabase" / "templates"

_TEMPLATE_CATALOG: dict[str, dict[str, Any]] = {
    "study_reminder": {
        "file": "study_reminder.html",
        "name": "Study reminder",
        "description": "Daily plan nudge — task count and focus skill filled from each learner's data.",
        "subject": "Your study plan is waiting — OET Coach",
        "personalized": True,
        "variables": ["FirstName", "TaskCount", "Minutes", "PrioritySkill", "StudyUrl"],
        "defaults": {
            "TaskCount": "3",
            "Minutes": "15",
            "PrioritySkill": "Writing",
            "StudyUrl": "/plan",
        },
    },
    "study_streak": {
        "file": "study_streak.html",
        "name": "Streak at risk",
        "description": "Streak nudge — streak days computed per learner.",
        "subject": "Don't lose your streak — OET Coach",
        "personalized": True,
        "variables": ["FirstName", "StreakDays", "StudyUrl"],
        "defaults": {
            "StreakDays": "3",
            "StudyUrl": "/plan",
        },
    },
    "weekly_progress": {
        "file": "weekly_progress.html",
        "name": "Weekly progress",
        "description": "Weekly summary — each recipient sees their own study days, minutes, and focus.",
        "subject": "Your week with OET Coach",
        "personalized": True,
        "variables": ["FirstName", "StudyDays", "Minutes", "TopSkill", "NikaTip", "ProgressUrl"],
        "defaults": {
            "StudyDays": "4",
            "Minutes": "120",
            "TopSkill": "Reading",
            "NikaTip": "Small, consistent sessions beat cramming before exam day.",
            "ProgressUrl": "/dashboard",
        },
    },
    "personal_progress": {
        "file": "personal_progress.html",
        "name": "Personal progress report",
        "description": "Full stats email — attempts, streak, focus skill, and Nika tip per learner.",
        "subject": "Your OET progress snapshot — OET Coach",
        "personalized": True,
        "variables": [
            "FirstName",
            "StudyDays",
            "Minutes",
            "WeekAttempts",
            "AttemptCount",
            "StreakDays",
            "FocusSkill",
            "TopSkill",
            "NikaTip",
            "ProgressUrl",
        ],
        "defaults": {
            "StudyDays": "4",
            "Minutes": "95",
            "WeekAttempts": "6",
            "AttemptCount": "28",
            "StreakDays": "3",
            "FocusSkill": "Writing",
            "TopSkill": "Reading",
            "NikaTip": "Good momentum — one more short Writing block this week will balance your skills.",
            "ProgressUrl": "/dashboard",
        },
    },
    "welcome_back": {
        "file": "welcome_back.html",
        "name": "Welcome back",
        "description": "Re-engage inactive learners with their last known stats.",
        "subject": "We saved your desk — come back to OET Coach",
        "personalized": True,
        "variables": ["FirstName", "AttemptCount", "FocusSkill", "StudyUrl", "NikaTip"],
        "defaults": {
            "AttemptCount": "12",
            "FocusSkill": "Writing",
            "StudyUrl": "/plan",
            "NikaTip": "Even 15 minutes today will restart momentum — open your plan and complete one task.",
        },
    },
    "exam_countdown": {
        "file": "exam_countdown.html",
        "name": "Exam countdown",
        "description": "Exam date reminder with days remaining and focus skill.",
        "subject": "Your OET exam is approaching — OET Coach",
        "personalized": True,
        "variables": ["FirstName", "ExamDate", "DaysToExam", "FocusSkill", "StudyUrl", "NikaTip"],
        "defaults": {
            "ExamDate": "15 Aug 2026",
            "DaysToExam": "42",
            "FocusSkill": "Writing",
            "StudyUrl": "/plan",
            "NikaTip": "Focus on timed practice this week — exam day rewards consistency over cramming.",
        },
    },
    "custom_message": {
        "file": "custom_message.html",
        "name": "Custom message",
        "description": "Plain support message with optional subject line.",
        "subject": "Message from OET Coach",
        "personalized": False,
        "variables": ["FirstName", "MessageBody"],
        "defaults": {
            "MessageBody": "We wanted to check in and see how your OET preparation is going.",
        },
    },
}

_GO_VAR_RE = re.compile(r"\{\{\s*\.([A-Za-z0-9_]+)\s*\}\}")
_MUSTACHE_RE = re.compile(r"\{\{\s*([A-Za-z0-9_]+)\s*\}\}")


def list_email_templates() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for template_id, meta in _TEMPLATE_CATALOG.items():
        rows.append(
            {
                "id": template_id,
                "name": meta["name"],
                "description": meta["description"],
                "subject": meta["subject"],
                "variables": meta["variables"],
                "personalized": bool(meta.get("personalized")),
            }
        )
    return rows


def is_personalized(template_id: str) -> bool:
    meta = _TEMPLATE_CATALOG.get(template_id)
    return bool(meta and meta.get("personalized"))


def first_name_from_user(email: str | None, metadata: dict[str, Any] | None = None) -> str:
    meta = metadata or {}
    full_name = meta.get("full_name")
    if full_name:
        part = str(full_name).strip().split()[0]
        if part:
            return part
    if not email:
        return "there"
    local = email.split("@")[0]
    cleaned = local.replace(".", " ").replace("_", " ").replace("+", " ").replace("-", " ").strip().split()
    token = cleaned[0] if cleaned else "there"
    return token[:1].upper() + token[1:]


def _site_base() -> str:
    return (settings.site_url or "https://nika-oet.fun").rstrip("/")


def _complete_variables(template_id: str, variables: dict[str, str]) -> dict[str, str]:
    """Ensure every template slot has a value — never leave {{placeholders}} in output."""
    meta = _TEMPLATE_CATALOG.get(template_id)
    if not meta:
        return variables

    from app.services.user_progress_email import demo_progress_variables

    demo = demo_progress_variables() if meta.get("personalized") else {}
    defaults = meta.get("defaults") or {}
    out = dict(variables)

    for key in meta.get("variables") or []:
        if out.get(key):
            continue
        if key in demo:
            out[key] = demo[key]
        elif key in defaults:
            out[key] = str(defaults[key])

    base = _site_base()
    for key, val in list(out.items()):
        if key.endswith("Url") and val.startswith("/"):
            out[key] = f"{base}{val}"

    return out


def build_template_variables(
    *,
    email: str | None,
    user_metadata: dict[str, Any] | None,
    overrides: dict[str, Any] | None,
    template_id: str,
) -> dict[str, str]:
    meta = _TEMPLATE_CATALOG.get(template_id)
    if not meta:
        raise HTTPException(status_code=400, detail="Unknown email template")

    values: dict[str, str] = {
        "FirstName": first_name_from_user(email, user_metadata),
    }
    for key, val in (meta.get("defaults") or {}).items():
        values[key] = str(val)

    base = _site_base()
    for key, val in list(values.items()):
        if key.endswith("Url") and val.startswith("/"):
            values[key] = f"{base}{val}"

    if overrides:
        for key, val in overrides.items():
            if val is None:
                continue
            text = str(val)
            if key.endswith("Url") and text.startswith("/"):
                text = f"{base}{text}"
            values[key] = text

    return _complete_variables(template_id, values)


def render_email_template(template_id: str, variables: dict[str, str]) -> tuple[str, str]:
    meta = _TEMPLATE_CATALOG.get(template_id)
    if not meta:
        raise HTTPException(status_code=400, detail="Unknown email template")

    variables = _complete_variables(template_id, variables)

    path = _TEMPLATES_DIR / str(meta["file"])
    if not path.is_file():
        raise HTTPException(status_code=500, detail="Email template file missing")

    html = path.read_text(encoding="utf-8")

    def replace_go(match: re.Match[str]) -> str:
        return variables.get(match.group(1), "")

    def replace_mustache(match: re.Match[str]) -> str:
        return variables.get(match.group(1), "")

    html = _GO_VAR_RE.sub(replace_go, html)
    html = _MUSTACHE_RE.sub(replace_mustache, html)
    return str(meta["subject"]), html


def html_to_plain_text(html: str) -> str:
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", "", html, flags=re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</p>", "\n\n", text, flags=re.I)
    text = re.sub(r"</h1>", "\n\n", text, flags=re.I)
    text = re.sub(r"</li>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&apos;", "'").replace("&nbsp;", " ")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
