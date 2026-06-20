"""Compute skill maps from diagnostic answers."""

from __future__ import annotations

from datetime import datetime, timezone

SKILLS = ("listening", "reading", "writing", "speaking")
GRADE_ORDER = ["E", "D", "C", "C+", "B", "A"]


def _grade_index(grade: str) -> int:
    try:
        return GRADE_ORDER.index(grade)
    except ValueError:
        return 2


def _estimate_band(tier: int, accuracy: float) -> str:
    """Conservative placement — B requires tier-3 performance."""
    if tier <= 1:
        return "C" if accuracy >= 0.65 else "D"
    if tier == 2:
        if accuracy >= 0.85:
            return "C+"
        if accuracy >= 0.55:
            return "C"
        return "D"
    if accuracy >= 0.8:
        return "B"
    if accuracy >= 0.55:
        return "C+"
    return "C"


def compute_skill_map(
    answers: list[dict],
    *,
    user_id: str,
    profession: str,
    target_regulator: str,
    target_grades: dict,
) -> dict:
    by_skill: dict[str, list[dict]] = {s: [] for s in SKILLS}
    for row in answers:
        skill = row.get("skill")
        if skill in by_skill:
            by_skill[skill].append(row)

    diagnostic: dict = {}
    for skill in SKILLS:
        rows = by_skill[skill]
        if not rows:
            diagnostic[skill] = {
                "estBand": "C+",
                "gap": 1,
                "weakTags": [f"{skill}:foundation"],
            }
            continue

        tier = max(r.get("tier", 2) for r in rows)
        correct = sum(1 for r in rows if r.get("correct"))
        accuracy = correct / len(rows)
        peak_tier = max(tier, max((r.get("tier", 2) for r in rows), default=tier))
        est_band = _estimate_band(peak_tier, accuracy)
        target = target_grades.get(skill, "B")
        gap = max(0, _grade_index(target) - _grade_index(est_band))
        weak = list({r.get("tag") for r in rows if not r.get("correct") and r.get("tag")})
        if not weak:
            weak = [f"{skill}:foundation"]
        diagnostic[skill] = {"estBand": est_band, "gap": gap, "weakTags": weak}

    priority = sorted(SKILLS, key=lambda s: diagnostic[s]["gap"], reverse=True)
    total_gap = sum(diagnostic[s]["gap"] for s in SKILLS)

    return {
        "userId": user_id,
        "profession": profession,
        "targetRegulator": target_regulator,
        "targetGrades": target_grades,
        "diagnostic": diagnostic,
        "priority": priority,
        "estimatedWeeksToTarget": min(16, max(4, total_gap * 2 + 3)),
        "computedAt": datetime.now(timezone.utc).isoformat(),
    }
