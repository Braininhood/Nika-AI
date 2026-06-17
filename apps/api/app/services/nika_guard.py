"""Topic guard — Nika only answers OET, regulatory, and platform-study questions."""

from __future__ import annotations

import re
from dataclasses import dataclass
from enum import Enum


class TopicVerdict(str, Enum):
    ALLOWED = "allowed"
    REFUSED = "refused"


@dataclass
class GuardResult:
    verdict: TopicVerdict
    reason: str
    category: str | None = None


REFUSAL_MESSAGE = (
    "I'm Nika, your OET study coach. I can only help with OET exam preparation, "
    "official healthcare regulator requirements (e.g. GPhC, GMC, NMC), and how to "
    "use this app. I can't answer personal, medical, or general life questions. "
    "Try asking about OET format, your study plan, or your target regulator."
)

_OFF_TOPIC_PATTERNS = [
    re.compile(p, re.I)
    for p in [
        r"\b(weather|football|soccer|movie|netflix|dating|relationship|boyfriend|girlfriend)\b",
        r"\b(recipe|cook(ing)?|restaurant)\b",
        r"\b(politics|election|president|war)\b",
        r"\b(bitcoin|crypto|stock\s*market|invest)\b",
        r"\b(homework|math\s+problem|physics|history\s+exam)\b",
        r"\b(should i (quit|leave|divorce)|life\s+advice)\b",
        r"\b(diagnos(e|is)|prescri(be|ption)|dosage|treat(ment)?)\s+(my|this)\s+patient\b",
        r"\bwhat\s+medicine\s+should\s+i\s+give\b",
    ]
]

_ALLOWED_PATTERNS = [
    (
        re.compile(
            r"\b(gphc|gmc|nmc|hcpc|gdc|rcvs|ahpra|nmbi|mcnz|ecfmg|mcc|nnas|"
            r"regulator|registration|revalidation|pin|license|licence)\b",
            re.I,
        ),
        "regulatory",
    ),
    (re.compile(r"\boet\b", re.I), "oet"),
    (re.compile(r"\b(listening|reading|writing|speaking)\s+(part\s+[abc]|sub-?test|criteria|exam)\b", re.I), "oet"),
    (re.compile(r"\b(purpose|conciseness|genre|organisation|content)\s+(criterion|marks?)\b", re.I), "oet"),
    (re.compile(r"\b(mock|placement|diagnostic|flashcard|study|today'?s?\s+plan|progress)\b", re.I), "platform"),
        (
            re.compile(
                r"\b((write|writing|read|reading|listen|listening|speak|speaking)\s+practice|"
                r"(create|give|suggest|need|want|more|make|generate|build)\b.*\b(tasks?|exercises?|practice|quiz|test|assessment)|"
                r"mix(ed)?\s+tasks?|balanced\s+tasks?|vocabulary\s+(quiz|test|practice))\b",
                re.I,
            ),
            "practice_tasks",
        ),
        (re.compile(r"\b(vocab|vocabulary|translate|pronunciation)\b", re.I), "vocabulary"),
    (
        re.compile(
            r"\b(what\s+does|what\s+is|what'?s|explain|define|meaning\s+of|how\s+do\s+you\s+say)\b",
            re.I,
        ),
        "vocabulary",
    ),
    (re.compile(r"\b(import|offline|audio|pdf|answer\s*key|sample\s+test)\b", re.I), "platform"),
    (re.compile(r"\b(oet\.com|official\s+oet|graded\s+sample)\b", re.I), "oet"),
    (re.compile(r"\b(why\s+did\s+i\s+lose|weak\s+skill|my\s+progress|my\s+grade)\b", re.I), "personal_study"),
    (re.compile(r"\b(pharmacy|nursing|medicine|dentist|physio|allied\s+health)\s+(oet|writing|speaking)\b", re.I), "oet"),
    (re.compile(r"\bhow\s+(long|many)\s+(minutes?|words?|questions?)\b", re.I), "oet"),
    (re.compile(r"\b(ice|concerns?\s+and\s+expectations?|role\s*play|role\s*card)\b", re.I), "oet"),
]


def classify_question(message: str) -> GuardResult:
    text = (message or "").strip()
    if not text:
        return GuardResult(TopicVerdict.REFUSED, "empty", None)

    for pattern in _OFF_TOPIC_PATTERNS:
        if pattern.search(text):
            return GuardResult(TopicVerdict.REFUSED, "off_topic_pattern", None)

    for pattern, category in _ALLOWED_PATTERNS:
        if pattern.search(text):
            return GuardResult(TopicVerdict.ALLOWED, "matched", category)

    # Short greetings / Nika identity — allow with platform category
    if re.match(r"^(hi|hello|hey|thanks|thank you)\b", text, re.I):
        return GuardResult(TopicVerdict.ALLOWED, "greeting", "platform")

    # Default: refuse unknown topics (strict scope)
    return GuardResult(TopicVerdict.REFUSED, "out_of_scope", None)
