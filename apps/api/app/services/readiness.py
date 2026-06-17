"""Readiness gates and exam-ready state (Phase 5 + Phase 8 ML)."""

from __future__ import annotations

from app.services.readiness_model import predict_readiness_probability

CONSECUTIVE_PASSES_REQUIRED = 2
GRADE_ORDER = ["E", "D", "C", "C+", "B", "A"]


def _grade_index(grade: str) -> int:
    try:
        return GRADE_ORDER.index(grade)
    except ValueError:
        return 2


def mock_meets_target(skill_grades: dict, target_grades: dict) -> bool:
    for skill in ("listening", "reading", "writing", "speaking"):
        band = skill_grades.get(skill)
        target = target_grades.get(skill, "B")
        if not band or _grade_index(band) < _grade_index(target):
            return False
    return True


def compute_readiness_state(
    consecutive_passes: int,
    all_gates_met: bool,
) -> str:
    if consecutive_passes >= CONSECUTIVE_PASSES_REQUIRED:
        return "exam_ready"
    if consecutive_passes == 1:
        return "mock_pass_pending"
    if all_gates_met:
        return "mock_eligible"
    return "studying"


def evaluate_gates(skill_map: dict, stats: dict) -> list[dict]:
    diagnostic = skill_map.get("diagnostic", {})
    sessions = stats.get("sessionsBySkill", {})
    weak_skills = [s for s in ("listening", "reading", "writing", "speaking") if diagnostic.get(s, {}).get("gap", 0) > 0]

    volume_met = not weak_skills or all(sessions.get(s, 0) >= 3 for s in weak_skills)
    no_critical = not any(diagnostic.get(s, {}).get("gap", 0) >= 2 for s in weak_skills)

    return [
        {
            "id": "min_volume",
            "label": "Practice volume",
            "met": volume_met,
            "detail": "≥3 sessions per weak skill" if volume_met else "Need more practice sessions",
        },
        {
            "id": "no_critical",
            "label": "No critical gaps",
            "met": no_critical,
            "detail": "No skill 2+ grades below target" if no_critical else "Close large gaps first",
        },
    ]


def readiness_status_payload(
    skill_map: dict,
    stats: dict,
    consecutive_passes: int = 0,
    *,
    include_ml: bool = True,
) -> dict:
    gates = evaluate_gates(skill_map, stats)
    all_gates_met = all(g["met"] for g in gates)
    state = compute_readiness_state(consecutive_passes, all_gates_met)
    payload = {
        "state": state,
        "consecutivePasses": consecutive_passes,
        "gates": gates,
        "allGatesMet": all_gates_met,
        "consecutivePassesRequired": CONSECUTIVE_PASSES_REQUIRED,
    }
    if include_ml:
        payload["mlPrediction"] = predict_readiness_probability(
            skill_map, stats, consecutive_passes
        )
    return payload
