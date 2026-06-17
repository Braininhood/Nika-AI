"""Rule-based speaking feedback with optional LLM polish (Phase 6)."""

from __future__ import annotations


def _contains_any(text: str, hints: list[str]) -> bool:
    lower = text.lower()
    return any(h.lower() in lower for h in hints)


def analyse_speaking(payload: dict) -> dict:
    transcript = (payload.get("transcript") or "").strip()
    profession = payload.get("profession") or "healthcare"
    tasks: list[str] = payload.get("tasks") or []
    analysis = payload.get("analysis") or {}
    checklist = payload.get("checklist_ratings") or {}

    lower = transcript.lower()
    words = transcript.split() if transcript else []

    ice = analysis.get("ice_coverage") or {}
    task_coverage = analysis.get("task_coverage") or []

    clinical_scores = {
        "relationship": 0.7 if _contains_any(lower, ["hello", "good morning", "my name"]) else 0.35,
        "perspective": 0.75
        if ice.get("ideas") and ice.get("concerns")
        else 0.45
        if ice.get("ideas") or ice.get("concerns")
        else 0.3,
        "structure": 0.7
        if _contains_any(lower, ["first", "next", "let's start", "finally"])
        else 0.4,
        "gathering": 0.7
        if _contains_any(lower, ["tell me", "what", "how", "describe"])
        else 0.4,
        "giving": 0.75
        if _contains_any(
            lower,
            ["can you tell me back", "does that make sense", "what will you do", "any questions"],
        )
        else 0.35,
    }

    linguistic_scores = {
        "intelligibility": 0.7 if len(words) >= 80 else 0.45,
        "fluency": 0.65 if analysis.get("fillerCount", 0) < 10 else 0.4,
        "appropriateness": 0.7
        if not _contains_any(lower, ["gonna", "yeah nah", "no worries mate"])
        else 0.45,
        "grammar": 0.65,
    }

    checklist_passed = sum(1 for v in checklist.values() if v)
    checklist_total = max(len(checklist), 1)
    checklist_ratio = checklist_passed / checklist_total

    tasks_addressed = sum(1 for t in task_coverage if t.get("addressed"))
    task_ratio = tasks_addressed / max(len(tasks), len(task_coverage), 1)

    avg_clinical = sum(clinical_scores.values()) / len(clinical_scores)
    avg_linguistic = sum(linguistic_scores.values()) / len(linguistic_scores)
    composite = checklist_ratio * 0.35 + task_ratio * 0.35 + avg_clinical * 0.2 + avg_linguistic * 0.1

    grade_hint = "B" if composite >= 0.75 else "C+" if composite >= 0.55 else "C"

    weak_tags: list[str] = list(analysis.get("weakTags") or analysis.get("weak_tags") or [])
    if clinical_scores["perspective"] < 0.6 and "speaking:ice-expectations" not in weak_tags:
        weak_tags.append("speaking:ice-expectations")
    if clinical_scores["structure"] < 0.6 and "speaking:structure" not in weak_tags:
        weak_tags.append("speaking:structure")
    if clinical_scores["giving"] < 0.6 and "speaking:language" not in weak_tags:
        weak_tags.append("speaking:language")

    suggested = list(analysis.get("suggestedPhrases") or analysis.get("suggested_phrases") or [])[:4]
    actions = [f'Practise: "{p}"' for p in suggested[:3]]
    if not actions:
        actions = ["Re-record focusing on ICE questions before giving information"]

    return {
        "status": "ok",
        "grade_estimate": grade_hint,
        "clinical_scores": clinical_scores,
        "linguistic_scores": linguistic_scores,
        "task_coverage": task_coverage,
        "ice_coverage": ice,
        "checklist_ratio": round(checklist_ratio, 2),
        "feedback": (
            f"Indicative grade: {grade_hint}. "
            f"Clinical communication analysis for {profession} speaking. "
            f"{len(words)} words in transcript. "
            f"Tasks addressed: {tasks_addressed}/{max(len(tasks), len(task_coverage))}."
        ),
        "suggested_phrases": suggested,
        "weak_tags": weak_tags[:5],
        "actions": actions,
        "updated_skill": "speaking",
        "nika_voice_note": "Phase 6: Nika will practise live role-play as interlocutor.",
    }
