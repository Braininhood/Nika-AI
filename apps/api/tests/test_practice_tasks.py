"""Tests for rule-based practice task builder."""

from app.services.practice_tasks import build_practice_tasks, is_practice_task_request


def test_detects_practice_request():
    assert is_practice_task_request(
        "i need more writing practice, can you create 2-3 tasks for today?"
    )


def test_builds_writing_tasks_for_pharmacy():
    result = build_practice_tasks(
        "create 3 writing tasks",
        profession="pharmacy",
        country="UK",
        skill_map={"priority": ["writing"], "diagnostic": {"writing": {"gap": 1}}},
    )
    assert len(result["tasks"]) >= 1
    assert result["tasks"][0]["skill"] == "writing"
    assert "/writing/practice/" in result["tasks"][0]["route"]
    assert result["provider"] == "content_catalog"
    assert "cost" not in result["reply"].lower()


def test_write_shorthand_maps_to_writing():
    result = build_practice_tasks(
        "i need more write practice, create 2-3 tasks",
        profession="pharmacy",
        country="UK",
        skill_map={"priority": ["reading"], "diagnostic": {"reading": {"gap": 1}}},
    )
    assert all(t["skill"] == "writing" for t in result["tasks"])


def test_mixed_tasks_default():
    result = build_practice_tasks(
        "give me more tasks",
        profession="pharmacy",
        country="UK",
        skill_map={"priority": ["listening"], "diagnostic": {"listening": {"gap": 1}}},
    )
    skills = {t["skill"] for t in result["tasks"]}
    assert len(skills) > 1
    assert result["skill"] == "mixed"
    assert "four sub-tests" in result["reply"]


def test_mix_tasks_explicit():
    result = build_practice_tasks("what about mix tasks?", profession="pharmacy", country="UK")
    skills = {t["skill"] for t in result["tasks"]}
    assert len(skills) > 1


def run_all() -> None:
    test_detects_practice_request()
    test_builds_writing_tasks_for_pharmacy()
    test_write_shorthand_maps_to_writing()
    test_mixed_tasks_default()
    test_mix_tasks_explicit()
    print("All practice task tests passed.")


if __name__ == "__main__":
    import sys

    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
