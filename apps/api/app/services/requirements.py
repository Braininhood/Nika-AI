"""Country + regulator → target OET grades."""

from __future__ import annotations

from typing import TypedDict


class TargetGrades(TypedDict):
    listening: str
    reading: str
    writing: str
    speaking: str
    single_sitting: bool


DEFAULT: TargetGrades = {
    "listening": "B",
    "reading": "B",
    "writing": "B",
    "speaking": "B",
    "single_sitting": False,
}

REQUIREMENTS: dict[str, TargetGrades] = {
    "NMC": {
        "listening": "B",
        "reading": "B",
        "writing": "C+",
        "speaking": "B",
        "single_sitting": False,
    },
    "GMC": DEFAULT,
    "GPhC": DEFAULT,
    "HCPC": DEFAULT,
    "GDC": DEFAULT,
    "RCVS": DEFAULT,
    "AHPRA": DEFAULT,
    "NMBI": {
        "listening": "B",
        "reading": "B",
        "writing": "C+",
        "speaking": "B",
        "single_sitting": False,
    },
    "MEDICAL_COUNCIL_IE": DEFAULT,
    "NCNZ": {
        "listening": "B",
        "reading": "B",
        "writing": "C+",
        "speaking": "B",
        "single_sitting": False,
    },
    "MCNZ": DEFAULT,
    "ECFMG": {
        "listening": "B",
        "reading": "B",
        "writing": "C+",
        "speaking": "B",
        "single_sitting": True,
    },
    "US_NURSING": {
        "listening": "B",
        "reading": "B",
        "writing": "B",
        "speaking": "B",
        "single_sitting": True,
    },
    "NNAS": DEFAULT,
    "MCC": DEFAULT,
    "OTHER": DEFAULT,
}


def get_target_grades(regulator_code: str) -> TargetGrades:
    return REQUIREMENTS.get(regulator_code, DEFAULT)
