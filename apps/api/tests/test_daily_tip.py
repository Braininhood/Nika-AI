"""Tests for daily profession tips."""

import asyncio
import json
from datetime import date

from app.services.daily_tip import (
    PROFESSION_LABELS,
    _tips_for_profession,
    format_daily_tip,
    get_curated_daily_tip,
    normalize_profession,
)
from app.services.daily_tip_generator import (
    CACHE_DIR,
    _cache_path,
    _record_tip,
    _recent_avoid_tokens,
    _select_curated_tip,
    get_daily_tip,
)


def test_daily_tip_dentistry():
    tip = get_curated_daily_tip("dentistry")
    assert tip["profession"] == "dentistry"
    assert tip["term"] == "Gingival bleeding"
    assert tip["phonetic"]
    assert tip["speaking"]["opening"]
    assert tip["grade_a_phrase"]
    assert len(tip["vocabulary_phrases"]) >= 1


def test_daily_tip_pharmacy():
    tip = get_curated_daily_tip("pharmacy")
    assert tip["profession"] == "pharmacy"
    assert tip["term"]
    assert tip["tip_id"].startswith("pharmacy-")


def test_pharmacy_tip_pool_size():
    pool = _tips_for_profession("pharmacy")
    assert len(pool) >= 5, "Pharmacy needs multiple tips for daily rotation"


def test_daily_tip_fallback_profession():
    tip = get_curated_daily_tip("radiography")
    assert tip["profession"] == "radiography"
    assert tip["profession_label"] == PROFESSION_LABELS["radiography"]
    assert tip["headline"].startswith("Radiography")


def test_daily_tip_stable_same_day():
    a = get_curated_daily_tip("nursing")
    b = get_curated_daily_tip("nursing")
    assert a["tip_id"] == b["tip_id"]
    assert a["date"] == b["date"]


def test_select_curated_avoids_recent():
    pool = _tips_for_profession("pharmacy")
    first = pool[0]["id"]
    tip = _select_curated_tip("pharmacy", {first})
    assert tip["id"] != first


def test_normalize_profession():
    assert normalize_profession("Pharmacy") == "pharmacy"
    assert normalize_profession("unknown-job") == "medicine"


def test_daily_tip_cache_hit():
    prof = "pharmacy"
    day = date.today()
    cache_file = _cache_path(day, prof)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    payload = format_daily_tip(
        {
            "id": "test-cached-tip",
            "professions": [prof],
            "term": "Cached term",
            "definition": "Definition",
            "example": "Example sentence.",
            "speaking": {"opening": ["Hello"]},
        },
        prof,
        source="test",
    )
    cache_file.write_text(json.dumps(payload), encoding="utf-8")
    try:
        tip = asyncio.run(get_daily_tip(prof))
        assert tip["tip_id"] == "test-cached-tip"
        assert tip["term"] == "Cached term"
    finally:
        if cache_file.is_file():
            cache_file.unlink()


def test_daily_tip_records_history(monkeypatch):
    monkeypatch.setattr("app.services.daily_tip_generator.settings.daily_tip_use_llm", False)
    prof = "dietetics"
    day = date.today()
    cache_file = _cache_path(day, prof)
    if cache_file.is_file():
        cache_file.unlink()

    tip = asyncio.run(get_daily_tip(prof))
    assert tip["source"] == "curated"
    avoid_ids, avoid_terms = _recent_avoid_tokens(prof)
    assert tip["tip_id"] in avoid_ids or tip["term"].lower() in avoid_terms
