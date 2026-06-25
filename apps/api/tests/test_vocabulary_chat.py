"""Tests for vocabulary term extraction — runnable without pytest."""

import sys

from app.services.vocabulary_chat import (
    extract_vocabulary_target,
    is_vocabulary_request,
    normalize_vocabulary_term,
)


def test_nil_by_mouth():
    msg = "What does nil by mouth mean"
    assert extract_vocabulary_target(msg) == "nil by mouth"
    assert is_vocabulary_request(msg)


def test_neproxodine_what_is_it():
    msg = "hi, i need help, neproxodine - what is it?"
    assert extract_vocabulary_target(msg) == "neproxodine"
    word, orig = normalize_vocabulary_term("neproxodine")
    assert word == "naproxen"
    assert orig == "neproxodine"
    assert is_vocabulary_request(msg)


def test_does_not_extract_pronoun_it():
    msg = "what is it?"
    assert extract_vocabulary_target(msg) is None


def test_quoted_term():
    assert extract_vocabulary_target('explain "presenting complaint"') == "presenting complaint"


def test_ibuprofen_mean_shorthand():
    msg = "ibuprofen - mean?"
    assert extract_vocabulary_target(msg) == "ibuprofen"
    assert is_vocabulary_request(msg)


def test_ibuprofen_translate_shorthand():
    msg = "ibuprofen - translate?"
    assert extract_vocabulary_target(msg) == "ibuprofen"
    assert is_vocabulary_request(msg)


def test_translate_term_prefix():
    msg = "translate ibuprofen"
    assert extract_vocabulary_target(msg) == "ibuprofen"
    assert is_vocabulary_request(msg)


def test_egfr_is_value_what_is_it():
    msg = "eGFR is 58 mL/min - what is it"
    assert extract_vocabulary_target(msg) == "eGFR"
    word, _ = normalize_vocabulary_term("eGFR")
    assert word == "eGFR"
    assert is_vocabulary_request(msg)


def test_does_not_extract_min_from_ml_per_min():
    msg = "eGFR is 58 mL/min - what is it"
    assert extract_vocabulary_target(msg) != "min"


def test_hba1c_with_value():
    msg = "HbA1c is 64 mmol/mol - what is it?"
    assert extract_vocabulary_target(msg) == "HbA1c"


def test_what_is_egfr():
    msg = "what is eGFR"
    assert extract_vocabulary_target(msg) == "eGFR"


def test_glossary_lookup():
    from app.services.healthcare_vocabulary import lookup_healthcare_term

    entry = lookup_healthcare_term("egfr")
    assert entry is not None
    assert entry.display == "eGFR"


def run_all() -> None:
    test_nil_by_mouth()
    test_neproxodine_what_is_it()
    test_does_not_extract_pronoun_it()
    test_quoted_term()
    test_ibuprofen_mean_shorthand()
    test_ibuprofen_translate_shorthand()
    test_translate_term_prefix()
    test_egfr_is_value_what_is_it()
    test_does_not_extract_min_from_ml_per_min()
    test_hba1c_with_value()
    test_what_is_egfr()
    test_glossary_lookup()
    print("All vocabulary chat tests passed.")


if __name__ == "__main__":
    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
