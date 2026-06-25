"""Nika knowledge brain — profession-aware OET vocabulary, phrases, and study context.

Loads curated glossary + auto-harvested phrase index from app content.
Supports all 12 OET professions. Used by vocabulary chat and Nika tutor RAG.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from app.services.healthcare_vocabulary import (
    VocabEntry,
    format_vocab_entry,
    lookup_healthcare_term,
    reload_healthcare_vocabulary,
)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PHRASES_PATH = DATA_DIR / "oet_phrases_index.json"
PROFESSION_PHRASES_DIR = DATA_DIR / "profession_phrases"

OET_PROFESSIONS = frozenset(
    {
        "medicine",
        "nursing",
        "pharmacy",
        "dentistry",
        "physiotherapy",
        "radiography",
        "occupational_therapy",
        "optometry",
        "podiatry",
        "veterinary_science",
        "speech_pathology",
        "dietetics",
    }
)

_phrase_index: list["HarvestedPhrase"] | None = None
_profession_packs: dict[str, list[ProfessionPhrase]] | None = None


@dataclass(frozen=True)
class ProfessionPhrase:
    term: str
    meaning: str
    example: str
    skills: tuple[str, ...]


@dataclass(frozen=True)
class HarvestedPhrase:
    term: str
    professions: tuple[str, ...]
    skills: tuple[str, ...]
    occurrences: int
    example: str


def _load_profession_packs() -> dict[str, list[ProfessionPhrase]]:
    global _profession_packs
    if _profession_packs is not None:
        return _profession_packs

    packs: dict[str, list[ProfessionPhrase]] = {}
    if PROFESSION_PHRASES_DIR.is_dir():
        for path in sorted(PROFESSION_PHRASES_DIR.glob("*.json")):
            try:
                raw = json.loads(path.read_text(encoding="utf-8"))
                prof = raw.get("profession", path.stem)
                phrases = [
                    ProfessionPhrase(
                        term=p["term"],
                        meaning=p.get("meaning", ""),
                        example=p.get("example", ""),
                        skills=tuple(p.get("skills", ["all"])),
                    )
                    for p in raw.get("phrases", [])
                    if p.get("term")
                ]
                packs[prof] = phrases
            except (json.JSONDecodeError, OSError):
                continue
    _profession_packs = packs
    return packs


def _infer_skill_from_path(path: str) -> str:
    lower = path.lower()
    if "/listening/" in lower:
        return "listening"
    if "/reading/" in lower:
        return "reading"
    if "/writing/" in lower:
        return "writing"
    if "/speaking/" in lower:
        return "speaking"
    if "/assessment/" in lower or "vocab" in lower:
        return "vocab"
    return "all"


def reload_nika_knowledge() -> None:
    """Clear in-memory caches after glossary or phrase index is rebuilt."""
    global _phrase_index, _profession_packs
    _phrase_index = None
    _profession_packs = None
    reload_healthcare_vocabulary()


def _load_phrase_index() -> list[HarvestedPhrase]:
    global _phrase_index
    if _phrase_index is not None:
        return _phrase_index

    if not PHRASES_PATH.is_file():
        _phrase_index = []
        return _phrase_index

    raw = json.loads(PHRASES_PATH.read_text(encoding="utf-8"))
    _phrase_index = [
        HarvestedPhrase(
            term=row["term"],
            professions=tuple(row.get("professions", ["all"])),
            skills=tuple(row.get("skills", ["all"])),
            occurrences=int(row.get("occurrences", 1)),
            example=row.get("example", ""),
        )
        for row in raw.get("phrases", [])
    ]
    return _phrase_index


def _profession_match(entry_professions: tuple[str, ...] | list[str], profession: str | None) -> bool:
    if not profession:
        return True
    if not entry_professions or "all" in entry_professions:
        return True
    return profession in entry_professions


def lookup_term(
    raw: str,
    *,
    profession: str | None = None,
) -> VocabEntry | None:
    """Glossary lookup with optional profession relevance boost (same entry, filtered display)."""
    return lookup_healthcare_term(raw)


def search_phrases(
    query: str,
    *,
    profession: str | None = None,
    skill: str | None = None,
    limit: int = 8,
) -> list[HarvestedPhrase]:
    """Search harvested content phrases by keyword overlap."""
    tokens = set(re.findall(r"[a-z0-9]+", (query or "").lower()))
    if not tokens:
        return []

    scored: list[tuple[float, HarvestedPhrase]] = []
    for phrase in _load_phrase_index():
        if profession and not _profession_match(phrase.professions, profession):
            continue
        if skill and skill != "all" and "all" not in phrase.skills and skill not in phrase.skills:
            continue
        hay = f"{phrase.term} {phrase.example}".lower()
        hits = sum(1 for t in tokens if t in hay)
        if hits == 0:
            continue
        score = hits / len(tokens) + min(phrase.occurrences, 10) * 0.02
        scored.append((score, phrase))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:limit]]


def knowledge_context_for_term(
    term: str,
    *,
    message: str = "",
    profession: str | None = None,
) -> str:
    """Build grounded context block for LLM vocabulary explanations."""
    parts: list[str] = []

    entry = lookup_healthcare_term(term)
    if entry:
        parts.append(format_vocab_entry(entry, profession=profession or "healthcare"))

    phrases = search_phrases(f"{term} {message}", profession=profession, limit=4)
    if phrases:
        parts.append("Phrases from OET Coach study material:")
        for p in phrases:
            profs = ", ".join(p.professions) if "all" not in p.professions else "all professions"
            line = f"- {p.term} ({profs})"
            if p.example:
                line += f" — e.g. “{p.example[:160]}”"
            parts.append(line)

    if profession:
        label = profession.replace("_", " ")
        parts.append(
            f"Learner profession: {label}. Prioritise vocabulary typical in {label} OET Writing and Speaking tasks."
        )
        pack = _load_profession_packs().get(profession, [])
        if pack:
            parts.append(f"Key {label} phrases in OET Coach:")
            for p in pack[:6]:
                line = f"- **{p.term}**"
                if p.example:
                    line += f" — {p.example[:140]}"
                parts.append(line)

    return "\n\n".join(parts)


def profession_vocabulary_summary(profession: str, *, limit: int = 12) -> list[VocabEntry]:
    """Top curated terms relevant to a profession (for study plans / coach tips)."""
    from app.services.healthcare_vocabulary import all_vocabulary_entries

    entries = all_vocabulary_entries()
    matched: list[VocabEntry] = []
    universal: list[VocabEntry] = []
    for e in entries:
        profs = getattr(e, "professions", ("all",))
        if _profession_match(profs, profession):
            matched.append(e)
        elif "all" in profs:
            universal.append(e)
    pool = matched if matched else universal
    return pool[:limit]


def knowledge_stats() -> dict:
    """Counts for admin / health checks."""
    from app.services.healthcare_vocabulary import all_vocabulary_entries

    phrases = _load_phrase_index()
    prof_counts: dict[str, int] = {p: 0 for p in OET_PROFESSIONS}
    for ph in phrases:
        for p in ph.professions:
            if p in prof_counts:
                prof_counts[p] += 1
    return {
        "glossary_terms": len(all_vocabulary_entries()),
        "harvested_phrases": len(phrases),
        "profession_packs": len(_load_profession_packs()),
        "professions": sorted(OET_PROFESSIONS),
        "phrases_per_profession": prof_counts,
        "auto_sync": True,
    }
