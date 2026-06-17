"""Tests for study advice service."""

from app.services.study_advice import build_study_advice, study_context_for_message

SAMPLE_SKILL_MAP = {
    "userId": "test",
    "priority": ["writing", "reading"],
    "diagnostic": {
        "writing": {"estBand": "C+", "gap": 1, "weakTags": ["writing:purpose"]},
        "reading": {"estBand": "B", "gap": 0, "weakTags": []},
        "listening": {"estBand": "B", "gap": 0, "weakTags": []},
        "speaking": {"estBand": "C+", "gap": 1, "weakTags": ["speaking:ice-expectations"]},
    },
}


def test_build_study_advice_has_daily_plan():
    advice = build_study_advice(SAMPLE_SKILL_MAP, profession="pharmacy", country="UK")
    assert "daily_plan" in advice
    assert advice["daily_plan"]["prioritySkill"]
    assert "summary_text" in advice
    assert "Today's plan" in advice["summary_text"]


def test_study_context_for_plan_question():
    ctx = study_context_for_message(
        "What should I study today?",
        SAMPLE_SKILL_MAP,
        profession="pharmacy",
        country="UK",
    )
    assert "TODAY'S PERSONALIZED PLAN" in ctx
    assert "writing" in ctx.lower()


def test_study_context_skips_unrelated():
    ctx = study_context_for_message(
        "How long is Reading Part A?",
        SAMPLE_SKILL_MAP,
        profession="pharmacy",
    )
    assert ctx == ""


def run_all() -> None:
    test_build_study_advice_has_daily_plan()
    test_study_context_for_plan_question()
    test_study_context_skips_unrelated()
    print("All study advice tests passed.")


if __name__ == "__main__":
    import sys

    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
