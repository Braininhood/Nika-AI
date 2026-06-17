"""Rule-based practice task picker — no LLM, uses catalog + skill map."""

from __future__ import annotations

import re

from app.services.generate_assessment import is_assessment_request
from app.services.scenario_catalog import pick_plan_scenario, scenarios_for_user

ALL_SKILLS = ("listening", "reading", "writing", "speaking")

READING_PART_ROUTES = {
    "A": "/reading/part-a",
    "B": "/reading/part-b",
    "C": "/reading/part-c",
}

LISTENING_PART_ROUTES = {
    "A": "/listening/part-a",
    "B": "/listening/part-b",
    "C": "/listening/part-c",
}

SKILL_LABELS = {
    "listening": "Listening",
    "reading": "Reading",
    "writing": "Writing",
    "speaking": "Speaking",
}


def is_practice_task_request(message: str) -> bool:
    lower = message.lower()
    if is_assessment_request(message):
        return True
    if re.search(
        r"\b(create|give|suggest|need|want|more|extra|another|additional)\b.*\b(tasks?|exercises?|practice)\b",
        lower,
    ):
        return True
    if re.search(r"\b((write|writing|read|reading|listen|listening|speak|speaking)\s+practice)\b", lower):
        return True
    if re.search(r"\b(mix(ed)?|balanced|rotation)\b.*\b(tasks?|practice)\b", lower):
        return True
    if re.search(r"\b(finish(ed)?|complete(d)?)\b.*\bplan\b.*\b(tasks?|more)\b", lower):
        return True
    if re.search(r"\b\d+\s*[-–]?\s*\d*\s*(tasks?|exercises?)\b", lower):
        return True
    return False


def wants_mixed_tasks(message: str) -> bool:
    return bool(
        re.search(
            r"\b(mix(ed)?|variety|all\s+(four|4)\s+skills?|each\s+skill|full\s+exam|balanced|rotation|four\s+sub-?tests?|oet\s+schedule)\b",
            message,
            re.I,
        )
    )


def _explicit_skill(message: str) -> str | None:
    lower = message.lower()
    skill_patterns: list[tuple[str, str]] = [
        (r"\b(write|writing)\s+practice\b", "writing"),
        (r"\b(read|reading)\s+practice\b", "reading"),
        (r"\b(listen|listening)\s+practice\b", "listening"),
        (r"\b(speak|speaking)\s+practice\b", "speaking"),
        (r"\b(only|just)\s+(write|writing)\b", "writing"),
        (r"\b(only|just)\s+(read|reading)\b", "reading"),
        (r"\b(only|just)\s+(listen|listening)\b", "listening"),
        (r"\b(only|just)\s+(speak|speaking)\b", "speaking"),
        (r"\b(write|writing)\s+tasks?\b", "writing"),
        (r"\b(read|reading)\s+tasks?\b", "reading"),
        (r"\b(listen|listening)\s+tasks?\b", "listening"),
        (r"\b(speak|speaking)\s+tasks?\b", "speaking"),
        (r"\b(letter|referral|case\s*notes?)\b", "writing"),
    ]
    for pattern, skill in skill_patterns:
        if re.search(pattern, lower):
            return skill
    return None


def _task_count(message: str, default: int = 4) -> int:
    match = re.search(r"\b(\d+)\s*[-–]?\s*(\d+)?\s*(tasks?|exercises?)?\b", message.lower())
    if not match:
        return default
    a = int(match.group(1))
    b = int(match.group(2)) if match.group(2) else a
    return max(1, min(8, max(a, b)))


def _skill_order(skill_map: dict | None) -> list[str]:
    if skill_map and skill_map.get("priority"):
        ordered = list(skill_map["priority"])
        for skill in ALL_SKILLS:
            if skill not in ordered:
                ordered.append(skill)
        return ordered
    return list(ALL_SKILLS)


def _writing_gap(skill_map: dict | None) -> int:
    if not skill_map:
        return 1
    return skill_map.get("diagnostic", {}).get("writing", {}).get("gap", 1)


def _build_one_task(
    skill: str,
    index: int,
    *,
    profession: str | None,
    country: str | None,
    skill_map: dict | None,
) -> dict:
    gap = _writing_gap(skill_map)

    if skill == "writing":
        scenarios = scenarios_for_user(profession, country)
        max_diff = 1 if gap >= 2 else 2 if gap == 1 else 3
        pool = [s for s in scenarios if s.get("difficulty", 2) <= max_diff] or scenarios
        scenario = pool[index % len(pool)] if pool else pick_plan_scenario(profession, country, gap)
        sid = scenario["id"]
        return {
            "skill": "writing",
            "title": scenario.get("title", sid),
            "route": f"/writing/practice/{sid}",
            "durationMinutes": 25,
            "profession": scenario.get("profession", profession),
        }

    if skill == "reading":
        part = ["A", "B", "C"][index % 3]
        return {
            "skill": "reading",
            "title": f"Reading Part {part} — profession practice",
            "route": READING_PART_ROUTES[part],
            "durationMinutes": 15 if part == "A" else 20,
            "profession": profession,
        }

    if skill == "listening":
        part = ["A", "B", "C"][index % 3]
        return {
            "skill": "listening",
            "title": f"Listening Part {part} — accent practice",
            "route": LISTENING_PART_ROUTES[part],
            "durationMinutes": 12,
            "profession": profession,
        }

    return {
        "skill": "speaking",
        "title": f"Speaking role-play {(index % 3) + 1}",
        "route": "/speaking",
        "durationMinutes": 8,
        "profession": profession,
    }


def build_practice_tasks(
    message: str,
    *,
    profession: str | None = None,
    country: str | None = None,
    skill_map: dict | None = None,
) -> dict:
    count = _task_count(message)
    explicit = _explicit_skill(message)
    use_mix = wants_mixed_tasks(message) or not explicit
    prof_label = profession.replace("_", " ") if profession else "your profession"
    tasks: list[dict] = []

    if use_mix:
        order = _skill_order(skill_map)
        for i in range(count):
            skill = order[i % len(order)]
            tasks.append(
                _build_one_task(
                    skill,
                    i,
                    profession=profession,
                    country=country,
                    skill_map=skill_map,
                )
            )
        skills_used = sorted({t["skill"] for t in tasks}, key=lambda s: ALL_SKILLS.index(s))
        skill_names = " · ".join(SKILL_LABELS[s] for s in skills_used)
        lines = [
            f"• **{SKILL_LABELS[t['skill']]}** — {t['title']} ({t['durationMinutes']} min)"
            for t in tasks
        ]
        reply = (
            "OET has four sub-tests — Listening, Reading, Writing, and Speaking. "
            f"Here is a **mixed set** for **{prof_label}** ({skill_names}):\n\n"
            + "\n".join(lines)
            + "\n\nWork through them in any order — your Skill Map and plan update after each attempt. "
            'Ask for "listening only" or "writing practice" if you want one skill.'
        )
        return {
            "reply": reply,
            "tasks": tasks,
            "skill": "mixed",
            "provider": "content_catalog",
        }

    skill = explicit or (skill_map.get("priority") or ["writing"])[0] if skill_map else "writing"
    for i in range(count):
        tasks.append(
            _build_one_task(
                skill,
                i,
                profession=profession,
                country=country,
                skill_map=skill_map,
            )
        )

    lines = [
        f"• **{SKILL_LABELS[t['skill']]}** — {t['title']} ({t['durationMinutes']} min)"
        for t in tasks
    ]
    reply = (
        f"Here are {len(tasks)} **{SKILL_LABELS[skill]}** tasks for **{prof_label}**:\n\n"
        + "\n".join(lines)
        + "\n\nOpen each task below — your plan updates after each attempt. "
        "Want all four skills? Ask for **mixed tasks**."
    )

    return {
        "reply": reply,
        "tasks": tasks,
        "skill": skill,
        "provider": "content_catalog",
    }
