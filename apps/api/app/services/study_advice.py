"""Personalized study advice — daily plan + course for Nika."""

from __future__ import annotations

import re

from app.services.course import generate_personal_course
from app.services.planner import build_daily_plan


def _is_study_plan_question(message: str) -> bool:
    lower = message.lower()
    return bool(
        re.search(
            r"\b(study\s+today|today'?s?\s+plan|what\s+should\s+i\s+study|my\s+plan|next\s+step|focus\s+today)\b",
            lower,
        )
    )


def build_study_advice(
    skill_map: dict,
    *,
    profession: str | None = None,
    country: str | None = None,
    exam_weeks: int | None = None,
    content_pools: dict | None = None,
) -> dict:
    daily = build_daily_plan(
        skill_map,
        profession=profession,
        target_country=country,
        content_pools=content_pools,
    )
    course = generate_personal_course(
        skill_map,
        profession=profession,
        exam_weeks=exam_weeks,
    )

    item_lines = []
    for item in daily.get("items", []):
        item_lines.append(
            f"• {item.get('title')} — {item.get('durationMinutes', 0)} min "
            f"(route: {item.get('route', '/')})"
        )

    summary = (
        f"Priority skill: {daily.get('prioritySkill', 'writing')}. "
        f"Estimated time: {daily.get('estimatedMinutes', 0)} minutes.\n"
        f"Course focus: {course.get('summary', '')}\n"
        "Today's plan:\n"
        + ("\n".join(item_lines) if item_lines else "• Review progress on /progress")
    )

    return {
        "daily_plan": daily,
        "personal_course": {
            "summary": course.get("summary"),
            "modules": course.get("modules", [])[:4],
        },
        "summary_text": summary,
    }


def study_context_for_message(message: str, skill_map: dict | None, **kwargs) -> str:
    if not skill_map or not _is_study_plan_question(message):
        return ""
    advice = build_study_advice(skill_map, **kwargs)
    return f"TODAY'S PERSONALIZED PLAN:\n{advice['summary_text']}"
