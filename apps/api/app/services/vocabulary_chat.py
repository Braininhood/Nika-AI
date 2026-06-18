"""Nika vocabulary intents — explain, translate, save (works with or without cloud LLM)."""

from __future__ import annotations

import re
import uuid

from app.services.deepl import translate_text
from app.services.generate_assessment import is_assessment_request
from app.services.llm import generate_chat_reply

EXPLAIN_SYSTEM = """You are Nika, OET vocabulary coach. Explain English healthcare/OET terms clearly in 2-4 sentences.
Include: plain meaning, drug class or clinical use if relevant, typical OET context (reading/listening/writing/speaking), one example phrase.
If the learner misspelled a term, name the correct spelling first, then explain the correct term.
Never give clinical advice for real patients. English only."""

_VOCAB_INTENT = re.compile(
    r"\b("
    r"what\s+does|what\s+is|what'?s|explain|define|meaning\s+of|translate|"
    r"how\s+do\s+you\s+say|pronounc(e|iation)|spell(ing)?|"
    r"vocab(ulary)?|word|phrase|term|help"
    r")\b",
    re.I,
)

_QUOTED = re.compile(r"['\"]([^'\"]{2,120})['\"]")

# Common learner misspellings → correct OET healthcare term
_TERM_CORRECTIONS: dict[str, str] = {
    "neproxodine": "naproxen",
    "naproxodine": "naproxen",
    "naproxedin": "naproxen",
    "naproxine": "naproxen",
    "ibuprofin": "ibuprofen",
    "paracetamol": "paracetamol",
    "acetaminophen": "paracetamol",
    "npo": "nil by mouth",
    "n.b.m.": "nil by mouth",
}

_INVALID_TARGETS = frozenset(
    {
        "it",
        "this",
        "that",
        "these",
        "those",
        "they",
        "them",
        "he",
        "she",
        "we",
        "you",
        "mean",
        "means",
        "one",
        "something",
        "anything",
        "everything",
        "help",
        "hi",
        "hello",
        "hey",
    }
)


def _clean_candidate(candidate: str) -> str:
    candidate = candidate.strip()
    candidate = re.sub(r"\b(mean|means)\s*$", "", candidate, flags=re.I).strip()
    candidate = re.sub(
        r"\b(in|to|for)\s+(english|russian|polish|hindi|arabic|spanish|ukrainian)\b.*$",
        "",
        candidate,
        flags=re.I,
    )
    return candidate.strip(" .,!?:;\"'")


def _is_valid_target(candidate: str) -> bool:
    cleaned = _clean_candidate(candidate)
    if len(cleaned) < 2:
        return False
    lower = cleaned.lower()
    if lower in _INVALID_TARGETS:
        return False
    # Reject bare pronoun phrases
    if re.fullmatch(r"(it|this|that|these|those)", lower):
        return False
    return True


def normalize_vocabulary_term(raw: str) -> tuple[str, str | None]:
    """Return (canonical term, original if corrected else None)."""
    cleaned = _clean_candidate(raw)
    key = cleaned.lower().replace("-", " ").strip()
    corrected = _TERM_CORRECTIONS.get(key)
    if corrected:
        return corrected, cleaned
    return cleaned, None


def _target_term_suffix(text: str) -> str | None:
    """e.g. 'ibuprofen - mean?', 'naproxen — translate?'"""
    patterns = [
        r"^([a-zA-Z][\w'-]{2,}(?:\s+[a-zA-Z][\w'-]+){0,4})\s*[-–—]\s*(?:mean|means|translate|translation)\s*\??\s*$",
        r"([a-zA-Z][\w'-]{2,}(?:\s+[a-zA-Z][\w'-]+){0,4})\s*[-–—]\s*(?:mean|means|translate|translation)\s*\??\s*$",
    ]
    for pattern in patterns:
        match = re.search(pattern, text.strip(), re.I)
        if match:
            candidate = _clean_candidate(match.group(1))
            if _is_valid_target(candidate):
                return candidate[:120]
    return None


def _target_before_what_is_it(text: str) -> str | None:
    """e.g. 'neproxodine - what is it?' or 'help, naproxen, what is it?'"""
    patterns = [
        r"([a-zA-Z][\w'-]{2,}(?:\s+[a-zA-Z][\w'-]+){0,4})\s*[-–—]\s*what\s+is\s+it\b",
        r",\s*([a-zA-Z][\w'-]{3,})\s*[-–—]\s*what\s+is\s+it\b",
        r"\bhelp(?:\s+with)?\s+([a-zA-Z][\w'-]{3,})\s*[-–—,]?\s*what\s+is\s+it\b",
        r"\babout\s+([a-zA-Z][\w'-]{3,})\s*[-–—,]?\s*what\s+is\s+it\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            candidate = _clean_candidate(match.group(1))
            if _is_valid_target(candidate):
                return candidate[:120]
    return None


def _scan_healthcare_token(text: str) -> str | None:
    """Last likely term in a help-style message."""
    if not re.search(r"\bwhat\s+is\s+it\b", text, re.I):
        return None
    # Strip question tail
    head = re.split(r"\bwhat\s+is\s+it\b", text, maxsplit=1, flags=re.I)[0]
    tokens = re.findall(r"[a-zA-Z][\w'-]{2,}", head)
    for token in reversed(tokens):
        lower = token.lower()
        if lower in _INVALID_TARGETS:
            continue
        if lower in {"need", "want", "please", "thanks", "thank"}:
            continue
        return token
    return None


def extract_vocabulary_target(message: str) -> str | None:
    text = (message or "").strip()
    if not text:
        return None

    quoted = _QUOTED.search(text)
    if quoted:
        candidate = quoted.group(1).strip()
        if _is_valid_target(candidate):
            return candidate

    # "TERM - mean?" / "TERM - translate?" before generic patterns
    term_suffix = _target_term_suffix(text)
    if term_suffix:
        return term_suffix

    # "TERM - what is it?" before generic "what is X" (avoids capturing "it")
    before_it = _target_before_what_is_it(text)
    if before_it:
        return before_it

    patterns = [
        r"(?:what\s+does|what\s+is|what'?s|explain|define|meaning\s+of|translate|translation\s+of)\s+(.+?)(?:\?|$)",
        r"(?:translate|translation\s+of)\s+(.+?)(?:\?|$)",
        r"(?:how\s+do\s+you\s+say|pronounc(?:e|iation)\s+(?:of\s+)?)\s*(.+?)(?:\?|$)",
        r"(?:word|phrase|term)\s+[:\"]?\s*(.+?)(?:\?|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            candidate = _clean_candidate(match.group(1))
            if _is_valid_target(candidate):
                return candidate[:120]

    bare = re.search(r"\bvocab(?:ulary)?\s*[:—-]\s*(.+?)(?:\?|$)", text, re.I)
    if bare:
        candidate = _clean_candidate(bare.group(1))
        if _is_valid_target(candidate):
            return candidate[:120]

    scanned = _scan_healthcare_token(text)
    if scanned and _is_valid_target(scanned):
        return scanned[:120]

    return None


def is_vocabulary_request(message: str) -> bool:
    if is_assessment_request(message):
        return False
    text = (message or "").strip()
    if not text:
        return False
    if _QUOTED.search(text):
        return True
    if _target_term_suffix(text):
        return True
    if re.search(r"\bwhat\s+is\s+it\b", text, re.I) and extract_vocabulary_target(text):
        return True
    if not _VOCAB_INTENT.search(text):
        return False
    if re.search(r"\b(quiz|test|assessment|practice\s+tasks?)\b", text, re.I):
        return False
    return bool(extract_vocabulary_target(text))


async def handle_vocabulary_chat(
    *,
    message: str,
    profession: str | None = None,
    native_language: str | None = None,
) -> dict | None:
    raw_word = extract_vocabulary_target(message)
    if not raw_word:
        return None

    word, misspelling = normalize_vocabulary_term(raw_word)

    prof = (profession or "healthcare").replace("_", " ")
    prompt = f"Explain the healthcare term '{word}' for an OET {prof} candidate."
    if misspelling and misspelling.lower() != word.lower():
        prompt += f" The learner wrote '{misspelling}' — confirm the correct term is '{word}'."

    explanation, provider = await generate_chat_reply(
        system=EXPLAIN_SYSTEM,
        user_message=prompt,
        context=f"OET healthcare English vocabulary. Term: {word}",
        temperature=0.3,
    )

    native_translation: str | None = None
    translate_provider = "none"
    target = (native_language or "").upper().split("-")[0]
    if target and target not in ("EN", ""):
        tr = await translate_text(word, target_lang=target, source_lang="EN")
        if tr.get("text") and not tr.get("error"):
            native_translation = tr["text"]
            translate_provider = tr.get("provider", "deepl")

    lang_note = f" ({target})" if native_translation else ""
    title = f"**{word}**"
    if misspelling and misspelling.lower() != word.lower():
        title = f"**{word}** _(you wrote “{misspelling}”)_"

    reply_lines = [
        f"{title} — OET healthcare vocabulary\n",
        explanation,
    ]
    if native_translation:
        reply_lines.append(f"\n**Your language{lang_note}:** {native_translation}")

    reply_lines.append(
        "\nI've added this to your vocabulary list — open [Vocabulary](/vocabulary) to review, "
        "hear pronunciation, or take a [clever quiz](/study/clever/vocab)."
    )

    entry_id = str(uuid.uuid4())

    return {
        "reply": "\n".join(reply_lines),
        "refused": False,
        "reason": "vocabulary",
        "category": "vocabulary",
        "tasks": [
            {
                "skill": "vocab",
                "title": "Open my vocabulary list",
                "route": "/vocabulary",
                "durationMinutes": 5,
            },
            {
                "skill": "vocab",
                "title": "Vocabulary clever quiz",
                "route": "/study/clever/vocab",
                "durationMinutes": 10,
            },
        ],
        "vocabulary": {
            "id": entry_id,
            "word": word,
            "englishExplanation": explanation,
            "nativeTranslation": native_translation,
            "nativeLanguage": target or "EN",
            "source": "nika",
        },
        "sources": [{"id": "vocabulary", "title": "OET vocabulary", "source": "oet-coach"}],
        "provider": f"{provider}+{translate_provider}",
    }
