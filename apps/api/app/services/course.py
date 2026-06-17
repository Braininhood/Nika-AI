"""Personal course generator (Phase 5) — mirrors client rules."""

from __future__ import annotations

SKILL_TITLES = {
    "writing": "Writing — criterion mastery",
    "reading": "Reading — parts & inference",
    "listening": "Listening — parts & detail",
    "speaking": "Speaking — clinical communication",
}


def _sort_skills_by_gap(diagnostic: dict) -> list[str]:
    skills = ["listening", "reading", "writing", "speaking"]
    return sorted(skills, key=lambda s: diagnostic.get(s, {}).get("gap", 0), reverse=True)


def generate_personal_course(
    skill_map: dict,
    *,
    profession: str | None = None,
    exam_weeks: int | None = None,
) -> dict:
    diagnostic = skill_map.get("diagnostic", {})
    ordered = _sort_skills_by_gap(diagnostic)
    modules = []

    for index, skill in enumerate(ordered):
        diag = diagnostic.get(skill, {})
        gap = diag.get("gap", 0)
        if gap == 0:
            status = "maintenance" if index > 2 else "completed"
        elif index == 0:
            status = "active"
        else:
            status = "locked"

        modules.append(
            {
                "id": f"mod-{skill}",
                "skill": skill,
                "title": SKILL_TITLES[skill],
                "focusTags": diag.get("weakTags", []),
                "status": status,
                "sequence": index + 1,
                "rationale": f"Gap {gap} on {skill}" if gap else f"{skill} at target",
            }
        )

    top = ordered[0] if ordered else "writing"
    summary = (
        f"{exam_weeks} week(s) to exam — focus {top}."
        if exam_weeks is not None and exam_weeks <= 4
        else f"Personal course — start with {top}."
    )

    return {
        "profession": profession,
        "modules": modules,
        "summary": summary,
        "generatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }
