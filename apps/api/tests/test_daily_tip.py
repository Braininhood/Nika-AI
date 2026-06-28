"""Tests for daily profession tips."""

from app.services.daily_tip import PROFESSION_LABELS, get_daily_tip


def test_daily_tip_dentistry():
    tip = get_daily_tip("dentistry")
    assert tip["profession"] == "dentistry"
    assert tip["term"] == "Gingival bleeding"
    assert tip["phonetic"]
    assert tip["speaking"]["opening"]
    assert tip["grade_a_phrase"]
    assert len(tip["vocabulary_phrases"]) >= 1


def test_daily_tip_pharmacy():
    tip = get_daily_tip("pharmacy")
    assert tip["profession"] == "pharmacy"
    assert tip["term"]
    assert tip["tip_id"].startswith("pharmacy-")


def test_pharmacy_tip_pool_size():
    from app.services.daily_tip import _tips_for_profession

    pool = _tips_for_profession("pharmacy")
    assert len(pool) >= 5, "Pharmacy needs multiple tips for daily rotation"


def test_daily_tip_fallback_profession():
    tip = get_daily_tip("radiography")
    assert tip["profession"] == "radiography"
    assert tip["profession_label"] == PROFESSION_LABELS["radiography"]
    assert tip["headline"].startswith("Radiography")


def test_daily_tip_stable_same_day():
    a = get_daily_tip("nursing")
    b = get_daily_tip("nursing")
    assert a["tip_id"] == b["tip_id"]
    assert a["date"] == b["date"]


def run_all() -> None:
    test_daily_tip_dentistry()
    test_daily_tip_pharmacy()
    test_pharmacy_tip_pool_size()
    test_daily_tip_fallback_profession()
    test_daily_tip_stable_same_day()
    print("All daily tip tests passed.")


if __name__ == "__main__":
    run_all()
