"""User attempt stats from Supabase for planner + ML."""

from __future__ import annotations

from app.core.supabase_rest import supabase_rest

SKILLS = ("listening", "reading", "writing", "speaking")


async def load_attempt_stats(user_id: str) -> dict:
    rows = await supabase_rest(
        "GET",
        "attempts",
        params={
            "user_id": f"eq.{user_id}",
            "select": "skill,scenario_id,score_raw,created_at",
            "order": "created_at.desc",
            "limit": "120",
        },
    )
    if not isinstance(rows, list):
        rows = []

    sessions_by_skill = {s: 0 for s in SKILLS}
    recent_by_skill: dict[str, list[str]] = {s: [] for s in SKILLS}
    question_ids: list[str] = []

    for row in rows:
        skill = row.get("skill")
        if skill in sessions_by_skill:
            sessions_by_skill[skill] += 1
            sid = row.get("scenario_id")
            if sid and sid not in recent_by_skill[skill]:
                recent_by_skill[skill].append(sid)
        raw = row.get("score_raw") or {}
        if isinstance(raw, dict):
            for qid in raw.get("questionIds") or []:
                if qid not in question_ids:
                    question_ids.append(qid)

    return {
        "sessionsBySkill": sessions_by_skill,
        "recentBySkill": recent_by_skill,
        "questionIds": question_ids[:80],
        "totalAttempts": len(rows),
    }
