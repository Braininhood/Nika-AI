"""Daily profession tip — one curated OET tip per profession per calendar day."""

from __future__ import annotations

import json
from datetime import date
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "daily_tips.json"

PROFESSION_LABELS: dict[str, str] = {
    "medicine": "Medicine",
    "nursing": "Nursing",
    "pharmacy": "Pharmacy",
    "dentistry": "Dentistry",
    "physiotherapy": "Physiotherapy",
    "radiography": "Radiography",
    "occupational_therapy": "Occupational therapy",
    "optometry": "Optometry",
    "podiatry": "Podiatry",
    "veterinary_science": "Veterinary science",
    "speech_pathology": "Speech pathology",
    "dietetics": "Dietetics",
}

PROFESSION_HEADLINES: dict[str, str] = {
    code: f"{label} English for OET"
    for code, label in PROFESSION_LABELS.items()
}


@lru_cache(maxsize=1)
def _load_tips() -> list[dict[str, Any]]:
    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return list(raw.get("tips") or [])


def _daily_seed(profession: str) -> int:
    return hash(f"{date.today().isoformat()}:{profession}") % 10_000


def _tips_for_profession(profession: str) -> list[dict[str, Any]]:
    tips = _load_tips()
    specific = [t for t in tips if profession in (t.get("professions") or [])]
    if specific:
        return specific
    generic = [t for t in tips if "all" in (t.get("professions") or [])]
    return generic or tips


def get_daily_tip(profession: str | None = None) -> dict[str, Any]:
    prof = (profession or "medicine").strip().lower().replace("-", "_")
    if prof not in PROFESSION_LABELS:
        prof = "medicine"

    pool = _tips_for_profession(prof)
    seed = _daily_seed(prof)
    tip = pool[seed % len(pool)]

    headline = tip.get("headline") or PROFESSION_HEADLINES.get(prof, "Healthcare English for OET")
    if "all" in (tip.get("professions") or []):
        headline = PROFESSION_HEADLINES.get(prof, headline)

    return {
        "date": date.today().isoformat(),
        "profession": prof,
        "profession_label": PROFESSION_LABELS.get(prof, prof.replace("_", " ").title()),
        "tip_id": tip["id"],
        "headline": headline,
        "term": tip["term"],
        "phonetic": tip.get("phonetic", ""),
        "definition": tip.get("definition", ""),
        "example": tip.get("example", ""),
        "speaking": tip.get("speaking") or {},
        "writing_clinical": tip.get("writing_clinical") or [],
        "writing_key_phrases": tip.get("writing_key_phrases") or [],
        "exam_tip_use": tip.get("exam_tip_use") or [],
        "exam_tip_avoid": tip.get("exam_tip_avoid") or [],
        "grade_a_phrase": tip.get("grade_a_phrase", ""),
        "vocabulary_phrases": tip.get("vocabulary_phrases") or [],
    }
