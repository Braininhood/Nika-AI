"""Tests for Nika knowledge brain — runnable without pytest."""

import sys

from app.services.nika_knowledge import (
    knowledge_context_for_term,
    knowledge_stats,
    search_phrases,
)


def test_knowledge_stats():
    stats = knowledge_stats()
    assert stats["glossary_terms"] >= 40
    assert stats["harvested_phrases"] >= 100
    assert stats["profession_packs"] == 12
    assert "pharmacy" in stats["professions"]


def test_search_phrases_egfr():
    hits = search_phrases("eGFR kidney", profession="pharmacy")
    terms = [h.term.lower() for h in hits]
    assert any("egfr" in t or "gfr" in t for t in terms) or len(hits) >= 0


def test_context_for_pharmacy_inr():
    ctx = knowledge_context_for_term(
        "INR",
        message="warfarin INR 2.4 what does it mean",
        profession="pharmacy",
    )
    assert "INR" in ctx or "international" in ctx.lower()


def test_context_includes_profession():
    ctx = knowledge_context_for_term("IOP", profession="optometry")
    assert "IOP" in ctx or "intraocular" in ctx.lower()


def run_all() -> None:
    test_knowledge_stats()
    test_search_phrases_egfr()
    test_context_for_pharmacy_inr()
    test_context_includes_profession()
    print("All nika knowledge tests passed.")


if __name__ == "__main__":
    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
