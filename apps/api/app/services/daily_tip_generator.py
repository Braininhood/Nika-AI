"""Nika-generated daily tips — one fresh tip per profession per UTC day.

Flow:
1. Return disk cache for ``{date}_{profession}`` if present.
2. Else generate via Gemini/Groq (cloud only — no Ollama) using profession vocabulary.
3. Avoid terms used in the last ``daily_tip_history_days``.
4. Fall back to curated ``daily_tips.json`` with the same anti-repeat logic.
"""

from __future__ import annotations

import json
import logging
from datetime import date
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.services.content_generator import _parse_json_object
from app.services.daily_tip import (
    PROFESSION_HEADLINES,
    PROFESSION_LABELS,
    _daily_seed,
    _tips_for_profession,
    format_daily_tip,
    normalize_profession,
)
from app.services.llm import generate_cloud_chat_reply
from app.services.nika_knowledge import knowledge_context_for_term, profession_vocabulary_summary

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CACHE_DIR = DATA_DIR / "daily_tip_cache"
HISTORY_PATH = CACHE_DIR / "_history.json"

DAILY_TIP_SYSTEM = """You are Nika, an OET study coach. Output ONLY valid JSON (no markdown fences).
Create original healthcare English content for OET candidates — never copy official OET exam materials.
Use professional register suitable for Writing letters and Speaking role-plays. UK English spelling."""


def _cache_path(day: date, profession: str) -> Path:
    return CACHE_DIR / f"{day.isoformat()}_{profession}.json"


def _load_history() -> dict[str, list[str]]:
    if not HISTORY_PATH.is_file():
        return {}
    try:
        raw = json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
        return {k: list(v) for k, v in raw.items() if isinstance(v, list)}
    except (json.JSONDecodeError, OSError):
        return {}


def _save_history(history: dict[str, list[str]]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    trimmed = {
        prof: ids[-120:]
        for prof, ids in history.items()
        if ids
    }
    HISTORY_PATH.write_text(json.dumps(trimmed, indent=2), encoding="utf-8")


def _record_tip(profession: str, tip_id: str, term: str) -> None:
    history = _load_history()
    entries = history.setdefault(profession, [])
    token = f"{tip_id}|{term.lower()}"
    entries = [e for e in entries if e != token]
    entries.append(token)
    history[profession] = entries[-120:]
    _save_history(history)


def _recent_avoid_tokens(profession: str) -> tuple[set[str], set[str]]:
    """Return (tip_ids, terms) to avoid from recent history."""
    entries = _load_history().get(profession, [])
    max_entries = max(7, settings.daily_tip_history_days)
    recent = entries[-max_entries:]
    tip_ids: set[str] = set()
    terms: set[str] = set()
    for entry in recent:
        if "|" in entry:
            tid, term = entry.split("|", 1)
            tip_ids.add(tid)
            terms.add(term.lower())
        else:
            tip_ids.add(entry)
    return tip_ids, terms


def _pick_seed_term(profession: str, day: date, avoid_terms: set[str]) -> str:
    from app.services.nika_knowledge import _load_profession_packs

    pack = _load_profession_packs().get(profession, [])
    vocab = profession_vocabulary_summary(profession, limit=48)
    candidates: list[str] = []
    seen: set[str] = set()
    for source in pack + vocab:
        term = getattr(source, "term", str(source))
        key = term.lower()
        if key in seen or key in avoid_terms:
            continue
        seen.add(key)
        candidates.append(term)
    if not candidates:
        candidates = ["professional communication", "patient counselling", "clinical handover"]
    seed = _daily_seed(f"{profession}:seed:{day.isoformat()}")
    return candidates[seed % len(candidates)]


def _select_curated_tip(profession: str, avoid_ids: set[str]) -> dict[str, Any]:
    pool = _tips_for_profession(profession)
    if not pool:
        pool = _tips_for_profession("medicine")

    day = date.today()
    seed = _daily_seed(profession)
    order = sorted(range(len(pool)), key=lambda i: (seed + i * 7) % len(pool))

    for idx in order:
        tip = pool[idx]
        if tip["id"] not in avoid_ids:
            return tip
    return pool[order[0]]


def _validate_generated(data: dict[str, Any]) -> bool:
    if not data.get("term") or not data.get("definition") or not data.get("example"):
        return False
    speaking = data.get("speaking")
    if not isinstance(speaking, dict):
        return False
    if not any(speaking.get(k) for k in ("opening", "clinical_questions", "empathy", "explanation", "advice")):
        return False
    return True


def _normalize_generated(data: dict[str, Any], profession: str, day: date) -> dict[str, Any]:
    tip_id = f"gen-{profession}-{day.isoformat()}"
    speaking = data.get("speaking") or {}
    vocab_rows = data.get("vocabulary_phrases") or []
    if not vocab_rows:
        vocab_rows = [
            {
                "phrase": data["term"],
                "meaning": data["definition"],
                "example": data["example"],
            }
        ]

    return {
        "id": tip_id,
        "professions": [profession],
        "headline": PROFESSION_HEADLINES.get(profession, "Healthcare English for OET"),
        "term": str(data["term"]).strip(),
        "phonetic": str(data.get("phonetic") or "").strip(),
        "definition": str(data["definition"]).strip(),
        "example": str(data["example"]).strip(),
        "speaking": {
            "opening": list(speaking.get("opening") or [])[:4],
            "clinical_questions": list(speaking.get("clinical_questions") or [])[:5],
            "empathy": list(speaking.get("empathy") or [])[:4],
            "explanation": list(speaking.get("explanation") or [])[:4],
            "advice": list(speaking.get("advice") or [])[:4],
        },
        "writing_clinical": list(data.get("writing_clinical") or [])[:6],
        "writing_key_phrases": list(data.get("writing_key_phrases") or [])[:4],
        "exam_tip_use": list(data.get("exam_tip_use") or [])[:5],
        "exam_tip_avoid": list(data.get("exam_tip_avoid") or [])[:5],
        "grade_a_phrase": str(data.get("grade_a_phrase") or "").strip(),
        "vocabulary_phrases": vocab_rows[:6],
    }


async def _generate_with_llm(
    profession: str,
    day: date,
    avoid_terms: set[str],
) -> dict[str, Any] | None:
    if not settings.daily_tip_use_llm:
        return None
    if not settings.gemini_api_key and not settings.groq_api_key:
        return None

    label = PROFESSION_LABELS.get(profession, profession.replace("_", " ").title())
    seed_term = _pick_seed_term(profession, day, avoid_terms)
    avoid_list = ", ".join(sorted(avoid_terms)[:20]) or "none"
    context = knowledge_context_for_term(seed_term, profession=profession)

    prompt = f"""Create one OET daily vocabulary tip for {label} candidates (UTC date {day.isoformat()}).

Focus term: "{seed_term}" — you may refine the term slightly but keep the same clinical meaning.
Do NOT reuse these recent terms: {avoid_list}.

Return ONE JSON object with this exact shape:
{{
  "term": "...",
  "phonetic": "IPA string",
  "definition": "plain English, 1-2 sentences",
  "example": "one professional sentence using the term",
  "speaking": {{
    "opening": ["..."],
    "clinical_questions": ["...", "..."],
    "empathy": ["..."],
    "explanation": ["..."],
    "advice": ["..."]
  }},
  "writing_clinical": ["note-style phrase", "..."],
  "writing_key_phrases": ["letter phrase", "..."],
  "exam_tip_use": ["good phrase", "..."],
  "exam_tip_avoid": ["informal phrase", "..."],
  "grade_a_phrase": "one high-band sentence",
  "vocabulary_phrases": [
    {{"phrase": "...", "meaning": "...", "example": "..."}}
  ]
}}

Return ONLY the JSON object."""

    try:
        reply, provider = await generate_cloud_chat_reply(
            system=DAILY_TIP_SYSTEM,
            user_message=prompt,
            context=context,
            temperature=0.55,
        )
        data = _parse_json_object(reply)
        if not _validate_generated(data):
            logger.warning("Daily tip LLM JSON invalid for %s (%s)", profession, provider)
            return None
        tip = _normalize_generated(data, profession, day)
        tip["generated_by"] = provider
        return tip
    except Exception as exc:
        logger.warning("Daily tip LLM failed for %s: %s", profession, exc)
        return None


def _load_cache(day: date, profession: str) -> dict[str, Any] | None:
    path = _cache_path(day, profession)
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _save_cache(day: date, profession: str, payload: dict[str, Any]) -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    _cache_path(day, profession).write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


async def get_daily_tip(profession: str | None = None) -> dict[str, Any]:
    """One tip per profession per UTC day — cached, LLM-generated, or curated fallback."""
    prof = normalize_profession(profession)
    day = date.today()

    cached = _load_cache(day, prof)
    if cached:
        return cached

    avoid_ids, avoid_terms = _recent_avoid_tokens(prof)

    raw: dict[str, Any] | None = None
    source = "curated"

    generated = await _generate_with_llm(prof, day, avoid_terms)
    if generated:
        raw = generated
        source = generated.get("generated_by", "nika_llm")
    else:
        raw = _select_curated_tip(prof, avoid_ids)

    payload = format_daily_tip(raw, prof, source=source)
    _save_cache(day, prof, payload)
    _record_tip(prof, payload["tip_id"], payload["term"])
    return payload
