"""Per-user progress variables for personalized admin emails."""

from __future__ import annotations

from collections import Counter
from datetime import date, datetime, timedelta, timezone
from typing import Any

from app.core.supabase_rest import supabase_rest
from app.services.user_skill_map import load_user_skill_map

_SKILL_LABELS = {
    "writing": "Writing",
    "reading": "Reading",
    "listening": "Listening",
    "speaking": "Speaking",
}


def _capitalize_skill(skill: str) -> str:
    return _SKILL_LABELS.get(skill.lower(), skill.replace("_", " ").title())


def _parse_day(iso: str | None) -> date | None:
    if not iso:
        return None
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _streak_days(attempt_days: set[date], *, today: date) -> int:
    if not attempt_days:
        return 0
    streak = 0
    cursor = today
    while cursor in attempt_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _nika_tip(*, study_days: int, minutes: int, focus_skill: str, streak: int) -> str:
    if study_days == 0:
        return "Even 15 minutes today will restart momentum — open your plan and complete one task."
    if streak >= 5:
        return f"Strong streak ({streak} days). Keep {focus_skill} in the mix so skills stay balanced."
    if minutes < 60:
        return f"Good start. Add one more short {focus_skill} block this week to build exam stamina."
    return "Solid week. Review your dashboard and let Nika adjust tomorrow's plan from your results."


async def progress_variables_for_user(user_id: str) -> dict[str, str]:
    """Build template variables from real attempts, profile, and skill map."""
    now = datetime.now(timezone.utc)
    today = now.date()
    week_start = now - timedelta(days=7)

    profile_rows = await supabase_rest(
        "GET",
        "profiles",
        params={"id": f"eq.{user_id}", "select": "profession,exam_date,study_goal"},
    )
    profile = profile_rows[0] if isinstance(profile_rows, list) and profile_rows else {}

    attempt_rows = await supabase_rest(
        "GET",
        "attempts",
        params={
            "user_id": f"eq.{user_id}",
            "select": "skill,created_at,duration_seconds",
            "order": "created_at.desc",
            "limit": "500",
        },
    )
    attempts = [r for r in attempt_rows if isinstance(r, dict)] if isinstance(attempt_rows, list) else []

    week_attempts: list[dict[str, Any]] = []
    all_days: set[date] = set()
    total_minutes = 0
    week_minutes = 0
    skill_counter: Counter[str] = Counter()

    for row in attempts:
        created = row.get("created_at")
        dt = None
        if created:
            try:
                dt = datetime.fromisoformat(str(created).replace("Z", "+00:00"))
            except ValueError:
                dt = None
        if dt:
            all_days.add(dt.date())
        duration = int(row.get("duration_seconds") or 0)
        mins = max(1, duration // 60) if duration else 5
        total_minutes += mins
        skill = str(row.get("skill") or "writing")
        skill_counter[skill] += 1
        if dt and dt >= week_start:
            week_attempts.append(row)
            week_minutes += mins

    week_days = len({d for d in all_days if d >= (today - timedelta(days=6))})
    top_skill = _capitalize_skill(skill_counter.most_common(1)[0][0]) if skill_counter else "Writing"

    skill_map = await load_user_skill_map(user_id)
    focus_skill = top_skill
    priority_skill = top_skill
    if skill_map:
        priority = skill_map.get("priority")
        if isinstance(priority, list) and priority:
            priority_skill = _capitalize_skill(str(priority[0]))
            focus_skill = priority_skill

    streak = _streak_days(all_days, today=today)
    attempt_count = len(attempts)
    week_attempt_count = len(week_attempts)

    exam_date_raw = profile.get("exam_date")
    days_to_exam = ""
    exam_date_label = ""
    if exam_date_raw:
        exam_day = _parse_day(str(exam_date_raw))
        if exam_day:
            exam_date_label = exam_day.strftime("%d %b %Y")
            delta = (exam_day - today).days
            days_to_exam = str(max(0, delta))

    tip = _nika_tip(
        study_days=week_days,
        minutes=week_minutes,
        focus_skill=focus_skill,
        streak=streak,
    )

    return {
        "StudyDays": str(week_days),
        "Minutes": str(week_minutes),
        "TopSkill": top_skill,
        "PrioritySkill": priority_skill,
        "FocusSkill": focus_skill,
        "StreakDays": str(streak),
        "AttemptCount": str(attempt_count),
        "WeekAttempts": str(week_attempt_count),
        "TaskCount": str(min(5, max(1, 3 if week_attempt_count < 3 else 2))),
        "NikaTip": tip,
        "DaysToExam": days_to_exam or "—",
        "ExamDate": exam_date_label or "not set",
        "StudyUrl": "/plan",
        "ProgressUrl": "/dashboard",
        "UnsubscribeUrl": "/profile",
    }


def demo_progress_variables() -> dict[str, str]:
    """Sample stats for admin email preview when no learner is selected."""
    base = "https://nika-oet.fun"
    return {
        "StudyDays": "4",
        "Minutes": "95",
        "TopSkill": "Reading",
        "PrioritySkill": "Writing",
        "FocusSkill": "Writing",
        "StreakDays": "3",
        "AttemptCount": "28",
        "WeekAttempts": "6",
        "TaskCount": "3",
        "NikaTip": "Good momentum — one more short Writing block this week will balance your skills.",
        "DaysToExam": "42",
        "ExamDate": "15 Aug 2026",
        "StudyUrl": f"{base}/plan",
        "ProgressUrl": f"{base}/dashboard",
        "UnsubscribeUrl": f"{base}/profile",
    }
