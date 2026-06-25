"""Nika vocabulary intents — explain, translate, save (works with or without cloud LLM)."""

from __future__ import annotations

import re
import uuid

from app.services.deepl import translate_text
from app.services.generate_assessment import is_assessment_request
from app.services.healthcare_vocabulary import format_vocab_entry, lookup_healthcare_term
from app.services.llm import generate_chat_reply
from app.services.nika_knowledge import knowledge_context_for_term
from app.services.rag import format_context, retrieve_chunks

EXPLAIN_SYSTEM = """You are Nika, OET vocabulary coach for healthcare professionals learning English.

Explain healthcare terms clearly in 3–5 sentences. Always cover:
1. Plain English meaning (expand abbreviations fully on first mention)
2. Clinical context — what the term measures or describes, not treatment advice for real patients
3. Where it appears in OET (Listening note completion, Reading texts, Writing case notes, Speaking role-plays)
4. One example phrase a candidate might write or hear

IMPORTANT:
- If the learner pasted a full phrase with a value (e.g. "eGFR is 58 mL/min"), explain the MAIN term (eGFR), not the unit (min, mg, mL).
- Distinguish abbreviations from measurement units (mL/min = millilitres per minute, not a vocabulary word).
- If the learner misspelled a term, name the correct spelling first.
- Never give clinical advice for real patients. English only."""

_VOCAB_INTENT = re.compile(
    r"\b("
    r"what\s+does|what\s+is|what'?s|explain|define|meaning\s+of|translate|"
    r"how\s+do\s+you\s+say|pronounc(e|iation)|spell(ing)?|"
    r"vocab(ulary)?|word|phrase|term|help"
    r")\b",
    re.I,
)

_QUOTED = re.compile(r"['\"]([^'\"]{2,120})['\"]")

# Measurement units and noise — never treat as the vocabulary target
_UNIT_FRAGMENTS = frozenset(
    {
        "min",
        "mins",
        "minute",
        "minutes",
        "max",
        "mg",
        "ml",
        "mcg",
        "g",
        "kg",
        "hr",
        "hrs",
        "hour",
        "hours",
        "day",
        "days",
        "week",
        "weeks",
        "mmol",
        "mol",
        "pg",
        "dl",
        "mmhg",
        "bpm",
        "percent",
        "daily",
        "weekly",
    }
)

# Common OET healthcare abbreviations — prefer these over trailing unit tokens
_MEDICAL_ABBREV = re.compile(
    r"\b("
    r"eGFR|GFR|HbA1c|BNP|CKD|AF|NSTEMI|STEMI|COPD|DM|HTN|"
    r"BP|HR|RR|SpO2|BMI|CRP|ESR|INR|APT|DVT|PE|"
    r"NPO|NBM|PRN|STAT|IV|IM|SC|PO|"
    r"MRI|CT|ECG|EKG|CXR|"
    r"NSAID|ACE|ARB|"
    r"ICE|FYI|"
    r"BD|TDS|QDS|OD"
    r")\b",
    re.I,
)

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
    "egfr": "eGFR",
    "gfr": "eGFR",
    "hba1c": "HbA1c",
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
    if lower in _UNIT_FRAGMENTS:
        return False
    if re.fullmatch(r"m[lL]|k[gG]|m[gG]|mcg|mmol", cleaned):
        return False
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
    known = lookup_healthcare_term(cleaned)
    if known:
        return known.display, cleaned if cleaned != known.display else None
    return cleaned, None


def _target_term_is_value_what_is_it(text: str) -> str | None:
    """e.g. 'eGFR is 58 mL/min - what is it' → eGFR"""
    if not re.search(r"\bwhat\s+is\s+it\b", text, re.I):
        return None
    match = re.search(
        r"^([a-zA-Z][\w'-]{1,}(?:\s+[a-zA-Z][\w'-]+){0,3})\s+is\s+[\d.]",
        text.strip(),
        re.I,
    )
    if match:
        candidate = _clean_candidate(match.group(1))
        if _is_valid_target(candidate):
            return candidate[:120]
    return None


def _scan_medical_abbrev(text: str) -> str | None:
    """Find a healthcare abbreviation in a 'what is it' style message."""
    if not re.search(r"\bwhat\s+is\s+it\b", text, re.I):
        return None
    matches = _MEDICAL_ABBREV.findall(text)
    if not matches:
        return None
    for abbrev in matches:
        if _is_valid_target(abbrev):
            return abbrev
    return None


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
    """e.g. 'neproxodine - what is it?' — but not 'mL/min - what is it' (unit fragment)."""
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
            if not _is_valid_target(candidate):
                continue
            if re.search(r"/" + re.escape(candidate) + r"\b", text, re.I):
                continue
            return candidate[:120]
    return None


def _scan_healthcare_token(text: str) -> str | None:
    """Last likely clinical term in a help-style message."""
    if not re.search(r"\bwhat\s+is\s+it\b", text, re.I):
        return None

    abbrev = _scan_medical_abbrev(text)
    if abbrev:
        return abbrev

    head = re.split(r"\bwhat\s+is\s+it\b", text, maxsplit=1, flags=re.I)[0]
    is_match = re.match(r"^([a-zA-Z][\w'-]{2,})\s+is\s+", head.strip(), re.I)
    if is_match:
        candidate = _clean_candidate(is_match.group(1))
        if _is_valid_target(candidate):
            return candidate

    tokens = re.findall(r"[a-zA-Z][\w'-]{2,}", head)
    for token in reversed(tokens):
        lower = token.lower()
        if lower in _INVALID_TARGETS or lower in _UNIT_FRAGMENTS:
            continue
        if lower in {"need", "want", "please", "thanks", "thank"}:
            continue
        if re.fullmatch(r"\d+", token):
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

    term_suffix = _target_term_suffix(text)
    if term_suffix:
        return term_suffix

    term_is_value = _target_term_is_value_what_is_it(text)
    if term_is_value:
        return term_is_value

    abbrev = _scan_medical_abbrev(text)
    if abbrev:
        return abbrev

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

    known = lookup_healthcare_term(word)
    chunks = await retrieve_chunks(
        f"{word} {message} OET healthcare vocabulary",
        profession=profession,
        limit=4,
    )
    rag_context = format_context(chunks)
    knowledge_ctx = knowledge_context_for_term(
        word, message=message, profession=profession
    )

    if known:
        explanation = format_vocab_entry(known, profession=prof or profession or "healthcare")
        provider = "glossary+harvest"
    else:
        prompt = (
            f"Explain the healthcare term '{word}' for an OET {prof} candidate.\n"
            f"Learner's full message: {message.strip()}"
        )
        if misspelling and misspelling.lower() != word.lower():
            prompt += f"\nThe learner wrote '{misspelling}' — confirm the correct term is '{word}'."

        context_parts: list[str] = []
        if knowledge_ctx:
            context_parts.append(knowledge_ctx)
        if rag_context:
            context_parts.append(f"Official OET guides:\n{rag_context}")
        if not context_parts:
            context_parts.append(f"OET healthcare English vocabulary. Term: {word}")

        explanation, provider = await generate_chat_reply(
            system=EXPLAIN_SYSTEM,
            user_message=prompt,
            context="\n\n".join(context_parts),
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

    if known:
        reply_body = explanation
    else:
        reply_body = explanation
        if not explanation.strip().startswith("**"):
            reply_body = f"{title} — OET healthcare vocabulary\n\n{explanation}"

    reply_lines = [reply_body]
    if native_translation:
        reply_lines.append(f"\n**Your language{lang_note}:** {native_translation}")

    reply_lines.append(
        "\nI've added this to your vocabulary list — open [Vocabulary](/vocabulary) to review, "
        "hear pronunciation, or take a [clever quiz](/study/clever/vocab)."
    )

    entry_id = str(uuid.uuid4())
    sources = [{"id": "vocabulary", "title": "OET vocabulary", "source": "oet-coach"}]
    if knowledge_ctx and not known:
        sources.append({"id": "content-harvest", "title": "OET Coach study material", "source": "oet-coach"})
    for c in chunks[:2]:
        sources.append({"id": c.id, "title": c.title, "source": c.source})

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
        "sources": sources,
        "provider": f"{provider}+{translate_provider}",
    }
