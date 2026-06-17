"""LLM-generated OET content — scenarios, blocks, quiz questions."""

from __future__ import annotations

import json
import re
from uuid import uuid4

from app.services.llm import generate_chat_reply

GENERATE_SYSTEM = """You are an OET content author. Output ONLY valid JSON (no markdown).
Create original exam-style content — never copy official OET materials.
Healthcare English only. Profession-accurate, locale-aware when country is given."""


async def generate_quiz_questions(
    *,
    skill: str,
    profession: str | None,
    country: str | None,
    count: int = 5,
    weak_tags: list[str] | None = None,
) -> list[dict]:
    tags = ", ".join(weak_tags or [f"{skill}:foundation"])
    prof = (profession or "medicine").replace("_", " ")
    loc = country or "UK"
    prompt = f"""Generate {count} OET {skill} quiz questions as JSON array.
Profession: {prof}. Locale: {loc}. Weak tags: {tags}.

Each object must have:
- id (string, unique, prefix "gen-")
- skill ("{skill}")
- type (one of: mcq, true_false, gap_fill, ordering, matching)
- tags (string array)
- prompt (string)
- options (string array, 2-4 items)
- correctAnswer (string or string array for ordering)
- explanation (string)

Return ONLY the JSON array."""

    reply, _provider = await generate_chat_reply(
        system=GENERATE_SYSTEM,
        user_message=prompt,
        context="",
        temperature=0.5,
    )
    return _parse_json_array(reply, skill)


async def generate_writing_scenario(
    *,
    profession: str | None,
    country: str | None,
    difficulty: int = 2,
) -> dict:
    prof = (profession or "medicine").replace("_", " ")
    loc = country or "UK"
    sid = f"w-gen-{uuid4().hex[:10]}"
    prompt = f"""Generate one OET writing scenario JSON object for {prof} ({loc}), difficulty {difficulty}/3.

Required shape:
{{
  "id": "{sid}",
  "profession": "{profession or 'medicine'}",
  "difficulty": {difficulty},
  "meta": {{
    "title": "...",
    "letterType": "referral|discharge|transfer|advice",
    "readerRole": "...",
    "estimatedWordCount": 180,
    "countryCode": "{loc if loc in ('UK','AU','US','IE','NZ','CA') else 'UK'}"
  }},
  "taskSheet": {{ "instruction": "...", "bulletPoints": ["..."] }},
  "caseNotes": [{{ "id": "cn1", "text": "...", "relevant": true }}],
  "assessorGuide": {{
    "purposeStatement": "...",
    "mustInclude": ["..."],
    "shouldOmit": ["..."]
  }}
}}

Return ONLY the JSON object."""

    reply, _ = await generate_chat_reply(
        system=GENERATE_SYSTEM,
        user_message=prompt,
        context="",
        temperature=0.55,
    )
    data = _parse_json_object(reply)
    data["id"] = data.get("id") or sid
    return data


async def generate_speaking_card(
    *,
    profession: str | None,
    country: str | None,
    difficulty: int = 2,
) -> dict:
    prof = (profession or "medicine").replace("_", " ")
    loc = country or "UK"
    cid = f"s-gen-{uuid4().hex[:10]}"
    prompt = f"""Generate one OET speaking role-play card JSON for {prof} ({loc}), difficulty {difficulty}/3.

Shape:
{{
  "id": "{cid}",
  "profession": "{profession or 'medicine'}",
  "countryCode": "UK",
  "difficulty": {difficulty},
  "setting": "...",
  "prepMinutes": 3,
  "durationMinutes": 5,
  "cardText": {{ "overview": "...", "task": "..." }},
  "patientAccent": "UK"
}}

Return ONLY JSON."""

    reply, _ = await generate_chat_reply(
        system=GENERATE_SYSTEM,
        user_message=prompt,
        context="",
        temperature=0.55,
    )
    data = _parse_json_object(reply)
    data["id"] = data.get("id") or cid
    return data


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _parse_json_array(text: str, skill: str) -> list[dict]:
    try:
        data = json.loads(_strip_fences(text))
        if isinstance(data, list):
            return [q for q in data if isinstance(q, dict)]
    except json.JSONDecodeError:
        pass
    return [
        {
            "id": f"gen-fallback-{uuid4().hex[:8]}",
            "skill": skill,
            "type": "mcq",
            "tags": [f"{skill}:foundation"],
            "prompt": "Which option best reflects professional OET communication?",
            "options": ["Clear purpose stated", "Informal slang", "No structure", "Unrelated detail"],
            "correctAnswer": "Clear purpose stated",
            "explanation": "OET rewards clear professional communication.",
        }
    ]


def _parse_json_object(text: str) -> dict:
    try:
        data = json.loads(_strip_fences(text))
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass
    return {}
