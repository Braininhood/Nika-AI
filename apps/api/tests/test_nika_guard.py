"""Tests for Nika topic guard — runnable without pytest."""

import sys

from app.services.nika_guard import TopicVerdict, classify_question


def test_allows_oet_questions():
    r = classify_question("How long is Reading Part A?")
    assert r.verdict == TopicVerdict.ALLOWED
    assert r.category == "oet"


def test_allows_regulator_questions():
    r = classify_question("What OET grades does GPhC require for pharmacists?")
    assert r.verdict == TopicVerdict.ALLOWED
    assert r.category == "regulatory"


def test_allows_study_plan():
    r = classify_question("What should I study today?")
    assert r.verdict == TopicVerdict.ALLOWED


def test_refuses_life_questions():
    r = classify_question("What should I cook for dinner tonight?")
    assert r.verdict == TopicVerdict.REFUSED


def test_refuses_weather():
    r = classify_question("What's the weather in London?")
    assert r.verdict == TopicVerdict.REFUSED


def test_refuses_clinical_advice():
    r = classify_question("What medicine should I give this patient?")
    assert r.verdict == TopicVerdict.REFUSED


def test_allows_practice_task_request():
    r = classify_question("i need more writing practice, create 2 tasks for today")
    assert r.verdict == TopicVerdict.ALLOWED
    assert r.category == "practice_tasks"


def test_allows_mix_tasks():
    r = classify_question("what about mix tasks?")
    assert r.verdict == TopicVerdict.ALLOWED
    assert r.category == "practice_tasks"


def test_allows_vocabulary_meaning_question():
    r = classify_question("What does nil by mouth mean")
    assert r.verdict == TopicVerdict.ALLOWED
    assert r.category == "vocabulary"


def run_all() -> None:
    test_allows_oet_questions()
    test_allows_regulator_questions()
    test_allows_study_plan()
    test_refuses_life_questions()
    test_refuses_weather()
    test_refuses_clinical_advice()
    test_allows_practice_task_request()
    test_allows_mix_tasks()
    test_allows_vocabulary_meaning_question()
    print("All nika guard tests passed.")


if __name__ == "__main__":
    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
