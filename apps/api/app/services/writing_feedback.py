"""Rule-based writing feedback with optional LLM polish (Phase 6)."""

from __future__ import annotations


def analyse_writing(payload: dict) -> dict:
    letter = (payload.get("letter_text") or "").strip()
    words = letter.split() if letter else []
    word_count = payload.get("word_count") or len(words)
    scores = payload.get("criterion_scores") or {}

    lower = letter.lower()
    purpose_ok = "i am writing to" in lower or "i am referring" in lower
    formal_ok = not any(x in lower for x in ("gonna", "kids", "asap", "lol"))

    if not scores:
        scores = {
            "purpose": 0.8 if purpose_ok else 0.3,
            "content": 0.6,
            "conciseness": 0.7 if 150 <= word_count <= 220 else 0.4,
            "genre": 0.8 if formal_ok else 0.4,
            "organisation": 0.6 if "dear " in lower else 0.4,
            "language": 0.65,
        }

    failed = [k for k, v in scores.items() if v < 0.6]
    actions = [f"Focus on {k} — review Writing Academy lesson" for k in failed[:3]]
    if not actions:
        actions = ["Strong draft — try another scenario under exam timing"]

    avg = sum(scores.values()) / max(len(scores), 1)
    grade_hint = "B" if avg >= 0.75 else "C+" if avg >= 0.55 else "C"

    return {
        "status": "ok",
        "criterion_scores": scores,
        "grade_estimate": grade_hint,
        "feedback": (
            f"Indicative grade: {grade_hint}. "
            f"Checklist-based analysis for {payload.get('profession', 'healthcare')} writing. "
            f"{word_count} words."
        ),
        "actions": actions,
        "updated_skill": "writing",
    }
