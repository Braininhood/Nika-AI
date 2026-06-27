"""Rule-based writing feedback with optional LLM polish (Phase 6)."""

from __future__ import annotations

CRITERION_LABELS = {
    "purpose": "Purpose",
    "content": "Content",
    "conciseness": "Conciseness",
    "genre": "Genre & Style",
    "organisation": "Organisation",
    "language": "Language",
}


def _scenario_title(payload: dict) -> str:
    ctx = payload.get("scenario_context") or {}
    if isinstance(ctx, dict) and ctx.get("title"):
        return str(ctx["title"])
    sid = payload.get("scenario_id")
    return str(sid) if sid else "this scenario"


def analyse_writing(payload: dict) -> dict:
    letter = (payload.get("letter_text") or "").strip()
    words = letter.split() if letter else []
    word_count = payload.get("word_count") or len(words)
    scores = dict(payload.get("criterion_scores") or {})

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

    ctx = payload.get("scenario_context") if isinstance(payload.get("scenario_context"), dict) else {}
    must_include = [str(x) for x in (ctx.get("must_include") or []) if x]
    should_omit = [str(x) for x in (ctx.get("should_omit") or []) if x]

    strengths: list[str] = []
    improvements: list[str] = []
    missed_facts: list[str] = []

    for key, score in scores.items():
        label = CRITERION_LABELS.get(key, key.replace("_", " ").title())
        if score >= 0.6:
            strengths.append(f"{label} looks solid ({int(score * 100)}%).")
        else:
            improvements.append(f"Strengthen {label.lower()} — currently {int(score * 100)}%.")

    for fact in must_include:
        tokens = [t for t in fact.lower().split() if len(t) > 3]
        if tokens and not any(t in lower for t in tokens[:4]):
            missed_facts.append(fact)

    for fact in should_omit:
        tokens = [t for t in fact.lower().split() if len(t) > 3]
        if tokens and any(t in lower for t in tokens[:3]):
            improvements.append(f"Consider omitting non-essential detail: “{fact[:80]}…”")

    if missed_facts:
        improvements.append(
            f"Add {len(missed_facts)} key fact(s) from the case notes that are missing from your letter."
        )

    failed = [k for k, v in scores.items() if v < 0.6]
    actions = improvements[:4] or [f"Focus on {k} — review Writing Academy lesson" for k in failed[:3]]
    if not actions:
        actions = ["Strong draft — try another scenario under exam timing"]

    avg = sum(scores.values()) / max(len(scores), 1)
    grade_hint = "B" if avg >= 0.75 else "C+" if avg >= 0.55 else "C"
    title = _scenario_title(payload)

    if strengths and not improvements:
        summary = f"Strong draft for “{title}”. {word_count} words — key criteria met."
    elif improvements:
        summary = (
            f"Your letter for “{title}” ({word_count} words) shows gaps in "
            f"{', '.join(CRITERION_LABELS.get(k, k) for k in failed[:2]) or 'several criteria'}. "
            "See strengths and improvements below."
        )
    else:
        summary = f"Indicative grade: {grade_hint}. Analysis for {payload.get('profession', 'healthcare')} writing — {word_count} words."

    return {
        "status": "ok",
        "criterion_scores": scores,
        "grade_estimate": grade_hint,
        "feedback": summary,
        "strengths": strengths,
        "improvements": improvements,
        "missed_facts": missed_facts,
        "actions": actions,
        "updated_skill": "writing",
    }
