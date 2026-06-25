"""Curated OET healthcare vocabulary — instant explanations for common abbreviations and phrases."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "healthcare_vocabulary.json"

_index: dict[str, "VocabEntry"] | None = None


@dataclass(frozen=True)
class VocabEntry:
    display: str
    full_name: str
    explanation: str
    oet_skills: list[str]
    example: str
    aliases: tuple[str, ...]
    professions: tuple[str, ...] = ("all",)


def reload_healthcare_vocabulary() -> None:
    global _index
    _index = None


def all_vocabulary_entries() -> list[VocabEntry]:
    return list({id(v): v for v in _load_index().values()}.values())


def _normalize_key(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip().replace("-", " "))


def _load_index() -> dict[str, VocabEntry]:
    global _index
    if _index is not None:
        return _index

    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    index: dict[str, VocabEntry] = {}
    for _key, row in raw.items():
        entry = VocabEntry(
            display=row["display"],
            full_name=row["full_name"],
            explanation=row["explanation"],
            oet_skills=list(row.get("oet_skills", [])),
            example=row.get("example", ""),
            aliases=tuple(row.get("aliases", [])),
            professions=tuple(row.get("professions", ["all"])),
        )
        index[_normalize_key(_key)] = entry
        for alias in entry.aliases:
            index[_normalize_key(alias)] = entry
        index[_normalize_key(entry.display)] = entry
    _index = index
    return _index


def lookup_healthcare_term(raw: str) -> VocabEntry | None:
    """Return a curated entry when the learner's term matches the glossary."""
    key = _normalize_key(raw)
    if not key:
        return None
    return _load_index().get(key)


def format_vocab_entry(entry: VocabEntry, *, profession: str = "healthcare") -> str:
    skills = ", ".join(s.title() for s in entry.oet_skills) or "Reading, Writing, Listening, Speaking"
    prof_note = ""
    if profession and profession != "healthcare" and "all" not in entry.professions:
        if profession in entry.professions:
            prof_note = f"\n**Your profession:** especially common in {profession.replace('_', ' ')} OET tasks."
    lines = [
        f"**{entry.display}** ({entry.full_name}) — OET healthcare vocabulary\n",
        entry.explanation,
        f"\n**OET skills:** {skills}",
    ]
    if prof_note:
        lines.append(prof_note)
    if entry.example:
        lines.append(f"\n**Example:** {entry.example}")
    return "\n".join(lines)
