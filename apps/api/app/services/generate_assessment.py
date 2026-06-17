"""Rule-based assessment builder — Nika-created quizzes from in-app pools."""

from __future__ import annotations

import hashlib
import re
import uuid

# Minimal cross-skill pool (mirrors web assessment banks)
ASSESSMENT_POOL: list[dict] = [
    {
        "id": "as-l-001",
        "skill": "listening",
        "type": "mcq",
        "tags": ["listening:part-b-gist"],
        "prompt": "Handover: fluid restriction 1L/day for heart failure. Main concern?",
        "options": ["Dehydration", "Fluid overload", "Kidney stones", "Low sodium"],
        "correctAnswer": "Fluid overload",
        "explanation": "Restriction limits fluid to prevent overload.",
    },
    {
        "id": "as-l-002",
        "skill": "listening",
        "type": "true_false",
        "tags": ["listening:part-a-detail"],
        "prompt": "True or false: 'Take two tablets at bedtime' means two tablets per day.",
        "options": ["True", "False"],
        "correctAnswer": "False",
        "explanation": "Bedtime only — unless stated otherwise, not necessarily total daily dose.",
    },
    {
        "id": "as-w-001",
        "skill": "writing",
        "type": "mcq",
        "tags": ["writing:purpose"],
        "prompt": "Which opening best states Purpose in a referral letter?",
        "options": [
            "I am writing to refer…",
            "The patient was nice",
            "It was raining",
            "See attached photo",
        ],
        "correctAnswer": "I am writing to refer…",
        "explanation": "Purpose criterion requires clear reason for writing early.",
    },
    {
        "id": "as-w-002",
        "skill": "writing",
        "type": "true_false",
        "tags": ["writing:conciseness"],
        "prompt": "True or false: Including every case note detail improves Conciseness marks.",
        "options": ["True", "False"],
        "correctAnswer": "False",
        "explanation": "Select relevant details only — conciseness penalises irrelevant content.",
    },
    {
        "id": "as-s-001",
        "skill": "speaking",
        "type": "mcq",
        "tags": ["speaking:ice-expectations"],
        "prompt": "In ICE, 'E' stands for…",
        "options": ["Examination", "Expectations", "Emergency", "Exercise"],
        "correctAnswer": "Expectations",
        "explanation": "Ideas, Concerns, and Expectations — OET communication framework.",
    },
    {
        "id": "as-s-002",
        "skill": "speaking",
        "type": "ordering",
        "tags": ["speaking:structure"],
        "prompt": "Order a professional role-play opening (first → last):",
        "options": [
            "Introduce yourself and role",
            "Elicit patient's Ideas",
            "Close with summary plan",
            "Confirm patient identity",
        ],
        "correctAnswer": [
            "Introduce yourself and role",
            "Confirm patient identity",
            "Elicit patient's Ideas",
            "Close with summary plan",
        ],
        "explanation": "Intro → identity → ICE → close.",
    },
    {
        "id": "as-v-001",
        "skill": "vocab",
        "type": "gap_fill",
        "tags": ["vocab:clinical"],
        "prompt": "Complete: The patient reported mild ___ (discomfort) after the procedure.",
        "options": ["malaise", "euphoria", "apathy", "lethargy"],
        "correctAnswer": "malaise",
        "explanation": "Malaise = general feeling of unwell — common clinical term.",
    },
    {
        "id": "as-v-002",
        "skill": "vocab",
        "type": "mcq",
        "tags": ["vocab:medications"],
        "prompt": "'PRN' on a drug chart means…",
        "options": ["As needed", "Every morning", "Before food only", "Do not give"],
        "correctAnswer": "As needed",
        "explanation": "Pro re nata — when required.",
    },
    {
        "id": "as-r-001",
        "skill": "reading",
        "type": "true_false",
        "tags": ["reading:part-c-inference"],
        "prompt": "True or false: 'Not without drawbacks' means the change has some disadvantages.",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "Double negative implies drawbacks exist.",
    },
    {
        "id": "as-r-002",
        "skill": "reading",
        "type": "gap_fill",
        "tags": ["reading:vocabulary"],
        "prompt": "Complete: The policy will be ___ until further notice.",
        "options": ["suspended", "celebrated", "exported", "ignored"],
        "correctAnswer": "suspended",
        "explanation": "Policies are suspended pending review.",
    },
]

CLEVER_TYPES = ("true_false", "gap_fill", "ordering", "matching", "mcq")

SKILL_ALIASES = {
    "listening": "listening",
    "listen": "listening",
    "reading": "reading",
    "read": "reading",
    "writing": "writing",
    "write": "writing",
    "letter": "writing",
    "speaking": "speaking",
    "speak": "speaking",
    "roleplay": "speaking",
    "vocab": "vocab",
    "vocabulary": "vocab",
    "words": "vocab",
    "mixed": "mixed",
    "all": "mixed",
}


def is_assessment_request(message: str) -> bool:
    lower = message.lower()
    if re.search(
        r"\b(create|generate|make|build|give me|set up)\b.*\b(quiz|test|assessment|questions?|exam)\b",
        lower,
    ):
        return True
    if re.search(r"\b(quiz|test|assessment)\b.*\b(on|about|for)\b", lower):
        return True
    if re.search(r"\b(vocabulary|vocab)\s+(quiz|test|drill)\b", lower):
        return True
    return False


def _parse_skill(message: str, skill_map: dict | None) -> str:
    lower = message.lower()
    for alias, skill in SKILL_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", lower):
            return skill
    if skill_map and skill_map.get("priority"):
        return skill_map["priority"][0]
    return "reading"


def _parse_count(message: str, default: int = 5) -> int:
    match = re.search(r"\b(\d+)\s*(questions?|items?|q)?\b", message.lower())
    if match:
        return max(3, min(10, int(match.group(1))))
    return default


def _clever_pick(pool: list[dict], limit: int) -> list[dict]:
    picked: list[dict] = []
    used: set[str] = set()
    for qtype in CLEVER_TYPES:
        for q in pool:
            if q["id"] in used or q.get("type") != qtype:
                continue
            picked.append(q)
            used.add(q["id"])
            break
        if len(picked) >= limit:
            break
    for q in pool:
        if len(picked) >= limit:
            break
        if q["id"] not in used:
            picked.append(q)
            used.add(q["id"])
    return picked[:limit]


async def _load_db_questions(skill: str, excluded: set[str]) -> list[dict]:
    from app.services.content_store import list_content_items

    items = await list_content_items(skill, include_inactive=False)
    out: list[dict] = []
    for row in items:
        if row.get("itemType") != "quiz_question" or not row.get("isActive"):
            continue
        payload = row.get("payload") or {}
        qid = str(payload.get("id") or row.get("externalId") or "")
        if qid and qid not in excluded:
            out.append(payload)
    return out


async def generate_assessment(
    message: str,
    *,
    profession: str | None = None,
    skill_map: dict | None = None,
    exclude_ids: list[str] | None = None,
) -> dict:
    from app.services.content_generator import generate_quiz_questions

    skill = _parse_skill(message, skill_map)
    count = _parse_count(message)
    assessment_id = str(uuid.uuid4())
    excluded = set(exclude_ids or [])

    weak = []
    if skill_map:
        diag = skill_map.get("diagnostic", {}).get(skill if skill != "mixed" else "reading", {})
        weak = diag.get("weakTags") or []

    target_skill = skill if skill != "mixed" else "reading"
    db_pool = await _load_db_questions(target_skill, excluded)
    if db_pool:
        questions = _clever_pick(db_pool, count)
        if len(questions) >= 3:
            title = f"Nika {target_skill.title()} quiz"
            prof = (profession or "your profession").replace("_", " ")
            reply = (
                f"I built a **{title.lower()}** ({len(questions)} questions) from your content library "
                f"for **{prof}**. Open the assessment below."
            )
            return {
                "id": assessment_id,
                "title": title,
                "skill": skill,
                "questions": questions,
                "route": f"/study/assessment/{assessment_id}",
                "reply": reply,
                "provider": "nika_content_db",
            }

    try:
        generated = await generate_quiz_questions(
            skill=skill if skill != "mixed" else "reading",
            profession=profession,
            country=(skill_map or {}).get("targetCountry"),
            count=count,
            weak_tags=weak,
        )
        questions = [q for q in generated if q.get("id") not in excluded][:count]
        if len(questions) >= 3:
            title = f"Nika generated {skill.title()} quiz"
            prof = (profession or "your profession").replace("_", " ")
            reply = (
                f"I created a **fresh {title.lower()}** ({len(questions)} questions) for **{prof}**. "
                "These are AI-generated from your weak areas — open the assessment below."
            )
            return {
                "id": assessment_id,
                "title": title,
                "skill": skill,
                "questions": questions,
                "route": f"/study/assessment/{assessment_id}",
                "reply": reply,
                "provider": "nika_llm_generated",
            }
    except Exception:
        pass

    if skill == "mixed":
        skills_cycle = ["reading", "listening", "writing", "speaking", "vocab"]
        questions: list[dict] = []
        for i in range(count):
            s = skills_cycle[i % len(skills_cycle)]
            pool = [q for q in ASSESSMENT_POOL if q["skill"] == s]
            if pool:
                questions.append(pool[i % len(pool)])
        title = "Mixed OET assessment"
    else:
        pool = [q for q in ASSESSMENT_POOL if q["skill"] == skill and q["id"] not in excluded]
        if not pool:
            pool = [q for q in ASSESSMENT_POOL if q["skill"] == skill]
        if not pool:
            pool = [q for q in ASSESSMENT_POOL if q["skill"] == "reading"]
        questions = _clever_pick(pool, count)
        labels = {
            "reading": "Reading",
            "listening": "Listening",
            "writing": "Writing criteria",
            "speaking": "Speaking communication",
            "vocab": "Healthcare vocabulary",
        }
        title = f"{labels.get(skill, skill.title())} clever quiz"

    prof = (profession or "your profession").replace("_", " ")
    reply = (
        f"I built a **{title}** ({len(questions)} questions) for **{prof}**. "
        f"Mixed question types where possible — open the assessment below. "
        f"Your Skill Map updates when you submit."
    )

    return {
        "id": assessment_id,
        "title": title,
        "skill": skill,
        "questions": questions,
        "route": f"/study/assessment/{assessment_id}",
        "reply": reply,
        "provider": "nika_generated",
    }
