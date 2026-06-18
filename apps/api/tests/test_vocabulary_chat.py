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


def run_all() -> None:
    test_nil_by_mouth()
    test_neproxodine_what_is_it()
    test_does_not_extract_pronoun_it()
    test_quoted_term()
    test_ibuprofen_mean_shorthand()
    test_ibuprofen_translate_shorthand()
    test_translate_term_prefix()
    print("All vocabulary chat tests passed.")


if __name__ == "__main__":
    try:
        run_all()
    except AssertionError:
        sys.exit(1)
    sys.exit(0)
