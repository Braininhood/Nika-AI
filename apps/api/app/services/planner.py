"""Rule-based study plan — aligned with web buildDailyPlan (Phase 9)."""

from __future__ import annotations

from datetime import date

from app.services.content_pickers import (
    pick_listening_block,
    pick_reading_block,
    pick_role_card,
    pick_writing_scenario,
)
from app.services.scenario_catalog import pick_plan_scenario

LESSON_ROUTES = {
    "writing:purpose": "/writing/learn/w-lesson-purpose",
    "writing:content-selection": "/writing/learn/w-lesson-content",
    "writing:content": "/writing/learn/w-lesson-content",
    "writing:conciseness": "/writing/learn/w-lesson-concise",
    "writing:genre": "/writing/learn/w-lesson-genre",
    "writing:organisation": "/writing/learn/w-lesson-org",
    "writing:language": "/writing/learn/w-lesson-language",
}


def _format_weak_tag(tag: str) -> str:
    part = tag.split(":", 1)[1] if ":" in tag else tag
    return part.replace("-", " ").title()


def _letter_type_label(letter_type: str) -> str:
    return letter_type[:1].upper() + letter_type[1:] if letter_type else "Letter"


def _gap(skill_map: dict, skill: str) -> int:
    return skill_map.get("diagnostic", {}).get(skill, {}).get("gap", 1)


def _weak_tags(skill_map: dict, skill: str, default: str) -> list[str]:
    tags = skill_map.get("diagnostic", {}).get(skill, {}).get("weakTags")
    return tags if tags else [default]


def _recommended_writing_stage(skill_map: dict) -> str:
    writing = skill_map.get("diagnostic", {}).get("writing", {})
    gap = writing.get("gap", 1)
    est = writing.get("estBand", "C+")
    if gap >= 2 or est in ("C", "D"):
        return "learn"
    if gap == 1:
        return "guided"
    return "practice"


def _recommended_reading_stage(skill_map: dict) -> str:
    gap = _gap(skill_map, "reading")
    if gap >= 2:
        return "learn"
    if gap == 1:
        return "practice"
    return "exam"


def _recommended_listening_stage(skill_map: dict) -> str:
    gap = _gap(skill_map, "listening")
    if gap >= 2:
        return "learn"
    if gap == 1:
        return "practice"
    return "exam"


def _recommended_speaking_stage(skill_map: dict) -> str:
    gap = _gap(skill_map, "speaking")
    if gap >= 2:
        return "learn"
    if gap == 1:
        return "practice"
    return "exam"


def _reading_part(skill_map: dict) -> str:
    tags = _weak_tags(skill_map, "reading", "reading:part-b-gist")
    tag = tags[0]
    if "part-a" in tag:
        return "A"
    if "part-c" in tag:
        return "C"
    return "B"


def _listening_part(skill_map: dict) -> str:
    tags = _weak_tags(skill_map, "listening", "listening:part-b-gist")
    tag = tags[0]
    if "part-a" in tag:
        return "A"
    if "part-c" in tag:
        return "C"
    return "B"


def build_daily_plan(
    skill_map: dict,
    *,
    profession: str | None = None,
    target_country: str | None = None,
    flashcards_due: int = 0,
    readiness_state: str | None = None,
    rotation: dict | None = None,
    content_pools: dict[str, list[dict]] | None = None,
) -> dict:
    """Build today's plan — mirrors apps/web build-daily-plan.ts."""
    rot = rotation or {}
    pools = content_pools or {}
    priority = skill_map.get("priority") or ["writing", "listening", "reading", "speaking"]
    priority_skill = priority[0] if priority else "writing"
    items: list[dict] = []

    if flashcards_due > 0:
        items.append(
            {
                "type": "review",
                "skill": "mixed",
                "title": f"Flashcard review ({flashcards_due} due)",
                "durationMinutes": min(15, flashcards_due * 2),
                "route": "/reading/flashcards",
            }
        )

    if readiness_state in ("mock_eligible", "mock_pass_pending", "exam_ready"):
        title = (
            "Maintenance mock — stay exam sharp"
            if readiness_state == "exam_ready"
            else "2nd OET mock — confirm exam readiness"
            if readiness_state == "mock_pass_pending"
            else "Full OET mock — all 4 skills"
        )
        items.insert(
            0,
            {
                "type": "exam",
                "skill": "mixed",
                "title": title,
                "durationMinutes": 170,
                "route": "/mock",
            },
        )

    writing_recent = rot.get("writing") or []
    scenario = pick_writing_scenario(
        profession,
        target_country,
        _gap(skill_map, "writing"),
        writing_recent,
        pool=pools.get("writing"),
    ) or pick_plan_scenario(profession, target_country, _gap(skill_map, "writing"))

    if priority_skill == "reading":
        part = _reading_part(skill_map)
        stage = _recommended_reading_stage(skill_map)
        block = pick_reading_block(
            profession,
            target_country,
            _gap(skill_map, "reading"),
            part,
            rot.get("reading") or [],
            pool=pools.get("reading"),
        )
        top_tag = _weak_tags(skill_map, "reading", "reading:part-b-gist")[0]
        if stage == "learn":
            items.append(
                {
                    "type": "drill",
                    "skill": "reading",
                    "title": f"Adaptive quiz — {_format_weak_tag(top_tag)}",
                    "durationMinutes": 10,
                    "route": "/reading/quiz",
                }
            )
        if stage in ("learn", "practice"):
            items.append(
                {
                    "type": "practice",
                    "skill": "reading",
                    "title": f"Reading Part {part} — {block['title']}",
                    "durationMinutes": block.get("durationMinutes", 20),
                    "route": f"/reading/part-{part.lower()}/{block['id']}",
                }
            )
        if stage == "exam":
            items.append(
                {
                    "type": "exam",
                    "skill": "reading",
                    "title": "Reading exam — Parts B & C (45 min)",
                    "durationMinutes": 45,
                    "route": "/reading/exam",
                }
            )

    elif priority_skill == "listening":
        part = _listening_part(skill_map)
        stage = _recommended_listening_stage(skill_map)
        block = pick_listening_block(
            profession,
            target_country,
            _gap(skill_map, "listening"),
            part,
            rot.get("listening") or [],
            pool=pools.get("listening"),
        )
        top_tag = _weak_tags(skill_map, "listening", "listening:part-b-gist")[0]
        if stage == "learn":
            part_a = pick_listening_block(
                profession,
                target_country,
                _gap(skill_map, "listening"),
                "A",
                rot.get("listening") or [],
                pool=pools.get("listening"),
            )
            items.append(
                {
                    "type": "practice",
                    "skill": "listening",
                    "title": f"Listening Part A — {part_a['title']}",
                    "durationMinutes": part_a.get("durationMinutes", 12),
                    "route": f"/listening/part-a/{part_a['id']}",
                }
            )
        if stage in ("learn", "practice"):
            items.append(
                {
                    "type": "practice",
                    "skill": "listening",
                    "title": f"Listening Part {part} — {block['title']}",
                    "durationMinutes": block.get("durationMinutes", 12),
                    "route": f"/listening/part-{part.lower()}/{block['id']}",
                }
            )
        if stage == "exam":
            items.append(
                {
                    "type": "exam",
                    "skill": "listening",
                    "title": "Listening exam — Parts B & C flow",
                    "durationMinutes": 25,
                    "route": "/listening/exam",
                }
            )
        items.append(
            {
                "type": "review",
                "skill": "listening",
                "title": f"Weak tag focus — {_format_weak_tag(top_tag)}",
                "durationMinutes": 5,
                "route": "/listening",
            }
        )

    elif priority_skill == "speaking":
        stage = _recommended_speaking_stage(skill_map)
        card = pick_role_card(
            profession,
            target_country,
            _gap(skill_map, "speaking"),
            rot.get("speaking") or [],
            pool=pools.get("speaking"),
        )
        top_tag = _weak_tags(skill_map, "speaking", "speaking:ice-expectations")[0]
        if stage == "learn":
            items.append(
                {
                    "type": "learn",
                    "skill": "speaking",
                    "title": f"Model dialogue — {card.get('setting', 'role-play')}",
                    "durationMinutes": 15,
                    "route": f"/speaking/practice/{card['id']}",
                }
            )
        if stage in ("learn", "practice"):
            overview = (card.get("cardText") or {}).get("overview", "Role-play")[:40]
            items.append(
                {
                    "type": "practice",
                    "skill": "speaking",
                    "title": f"Role-play — {overview}…",
                    "durationMinutes": card.get("prepMinutes", 3) + card.get("durationMinutes", 5) + 5,
                    "route": f"/speaking/practice/{card['id']}",
                    "scenarioId": card["id"],
                }
            )
        if stage == "exam":
            items.append(
                {
                    "type": "exam",
                    "skill": "speaking",
                    "title": "Speaking exam — dual role-play simulation",
                    "durationMinutes": 16,
                    "route": f"/speaking/practice/{card['id']}",
                    "scenarioId": card["id"],
                }
            )
        items.append(
            {
                "type": "review",
                "skill": "speaking",
                "title": f"Weak tag focus — {_format_weak_tag(top_tag)}",
                "durationMinutes": 5,
                "route": "/speaking",
            }
        )

    else:
        writing = skill_map.get("diagnostic", {}).get("writing", {})
        weak_tags = _weak_tags(skill_map, "writing", "writing:purpose")
        top_tag = weak_tags[0]
        stage = _recommended_writing_stage(skill_map)
        learn_route = LESSON_ROUTES.get(top_tag, "/writing/learn")

        if stage == "learn" or writing.get("gap", 1) >= 1:
            items.append(
                {
                    "type": "learn",
                    "skill": "writing",
                    "title": f"Writing Academy — {_format_weak_tag(top_tag)}",
                    "durationMinutes": 15,
                    "route": learn_route,
                }
            )
        if stage == "learn":
            items.append(
                {
                    "type": "drill",
                    "skill": "writing",
                    "title": "Content-selection drills",
                    "durationMinutes": 10,
                    "route": "/writing/learn/drills",
                }
            )
        if stage == "guided":
            items.append(
                {
                    "type": "guided",
                    "skill": "writing",
                    "title": f"Guided: {scenario.get('title', scenario.get('id'))}",
                    "durationMinutes": 20,
                    "route": f"/writing/guided/{scenario['id']}",
                    "scenarioId": scenario["id"],
                }
            )
        if stage in ("practice", "guided"):
            items.append(
                {
                    "type": "practice",
                    "skill": "writing",
                    "title": f"{_letter_type_label(scenario.get('letterType', 'letter'))} — {scenario.get('title', '')}",
                    "durationMinutes": 25,
                    "route": f"/writing/practice/{scenario['id']}",
                    "scenarioId": scenario["id"],
                }
            )
        if stage == "practice" and writing.get("gap", 1) == 0:
            items.append(
                {
                    "type": "exam",
                    "skill": "writing",
                    "title": f"Exam timing — {scenario.get('title', '')}",
                    "durationMinutes": 45,
                    "route": f"/writing/exam/{scenario['id']}",
                    "scenarioId": scenario["id"],
                }
            )

    items.append(
        {
            "type": "learn",
            "skill": "mixed",
            "title": "Your personal course",
            "durationMinutes": 5,
            "route": "/course",
        }
    )
    items.append(
        {
            "type": "review",
            "skill": "mixed",
            "title": "Review Skill Map progress",
            "durationMinutes": 5,
            "route": "/progress",
        }
    )

    return {
        "date": date.today().isoformat(),
        "prioritySkill": priority_skill,
        "items": items,
        "estimatedMinutes": sum(i["durationMinutes"] for i in items),
        "primaryScenarioId": scenario.get("id"),
    }
