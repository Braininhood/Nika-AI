"""Apply activity results to skill snapshots."""

from __future__ import annotations

from datetime import datetime, timezone

GRADE_ORDER = ["E", "D", "C", "C+", "B", "A"]


def _grade_index(grade: str) -> int:
    try:
        return GRADE_ORDER.index(grade)
    except ValueError:
        return 2


def _score_to_band(score: float) -> str:
    if score >= 0.85:
        return "B"
    if score >= 0.65:
        return "C+"
    if score >= 0.45:
        return "C"
    return "D"


def apply_writing_to_snapshot(snapshot: dict, criterion_scores: dict, weak_tags: list[str]) -> dict:
    avg = sum(criterion_scores.values()) / max(len(criterion_scores), 1)
    est_band = _score_to_band(avg)
    target = snapshot.get("targetGrades", {}).get("writing", "B")
    gap = max(0, _grade_index(target) - _grade_index(est_band))

    diagnostic = dict(snapshot.get("diagnostic", {}))
    writing = dict(diagnostic.get("writing", {}))
    existing_tags = writing.get("weakTags", [])
    merged = list(dict.fromkeys([*weak_tags, *existing_tags]))[:5]

    diagnostic["writing"] = {
        "estBand": est_band,
        "gap": gap,
        "weakTags": merged or ["writing:purpose"],
    }

    priority = sorted(
        ["listening", "reading", "writing", "speaking"],
        key=lambda s: diagnostic.get(s, {}).get("gap", 0),
        reverse=True,
    )

    return {
        **snapshot,
        "diagnostic": diagnostic,
        "priority": priority,
        "computedAt": datetime.now(timezone.utc).isoformat(),
    }


def apply_speaking_to_snapshot(snapshot: dict, overall_score: float, weak_tags: list[str]) -> dict:
    est_band = _score_to_band(overall_score)
    target = snapshot.get("targetGrades", {}).get("speaking", "B")
    gap = max(0, _grade_index(target) - _grade_index(est_band))

    diagnostic = dict(snapshot.get("diagnostic", {}))
    speaking = dict(diagnostic.get("speaking", {}))
    existing_tags = speaking.get("weakTags", [])
    merged = list(dict.fromkeys([*weak_tags, *existing_tags]))[:5]

    diagnostic["speaking"] = {
        "estBand": est_band,
        "gap": gap,
        "weakTags": merged or ["speaking:ice-expectations"],
    }

    priority = sorted(
        ["listening", "reading", "writing", "speaking"],
        key=lambda s: diagnostic.get(s, {}).get("gap", 0),
        reverse=True,
    )

    return {
        **snapshot,
        "diagnostic": diagnostic,
        "priority": priority,
        "computedAt": datetime.now(timezone.utc).isoformat(),
    }
