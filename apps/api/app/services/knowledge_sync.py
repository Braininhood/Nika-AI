"""Auto-sync Nika knowledge on API startup — harvest, profession packs, glossary, RAG reload.

Runs automatically when the API starts (no manual scripts needed after deploy/restart).
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

API_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = API_DIR / "data"
PHRASES_PATH = DATA_DIR / "oet_phrases_index.json"
GLOSSARY_PATH = DATA_DIR / "healthcare_vocabulary.json"
PROFESSION_PHRASES_DIR = DATA_DIR / "profession_phrases"
SYNC_STATE_PATH = DATA_DIR / ".nika_knowledge_sync_state.json"

_ABBREV_RE = re.compile(
    r"\b("
    r"eGFR|GFR|HbA1c|BNP|CKD|AF|NSTEMI|STEMI|COPD|DM|HTN|INR|APT|APTT|"
    r"BP|HR|RR|SpO2|BMI|CRP|ESR|DVT|PE|VTE|UTI|FBC|U&E|LFT|TFT|"
    r"NPO|NBM|PRN|STAT|IV|IM|SC|PO|BD|TDS|QDS|OD|"
    r"MRI|CT|ECG|EKG|CXR|OCT|IOP|RNFL|OPG|"
    r"NSAID|ICE|FYI|MDT|NEWS2|METs|PVD|ADL|ADLs|SLT|ENT|ROM|"
    r"dysphagia|dyspnoea|oedema|hyperkalaemia|hypertension|colic|"
    r"referral|handover|palliative|contraindication|anticoagulant|"
    r"avulsion|keratitis|dysphonia|malnutrition"
    r")\b",
    re.I,
)

_PHRASE_RE = re.compile(
    r"\b("
    r"presenting complaint|nil by mouth|differential diagnosis|"
    r"vital signs|discharge summary|on admission|as discussed|"
    r"for your information|ideas, concerns, expectations|"
    r"pulmonary rehab|videofluoroscopy|angle closure|dry socket|"
    r"Charcot foot|contact lens keratitis|maxillofacial|"
    r"exercise programme|visual field|modified fluids"
    r")\b",
    re.I,
)

_PATH_PROFESSIONS: list[tuple[re.Pattern[str], list[str]]] = [
    (re.compile(r"pharmacy", re.I), ["pharmacy"]),
    (re.compile(r"nursing", re.I), ["nursing"]),
    (re.compile(r"medicine", re.I), ["medicine"]),
    (re.compile(r"dentist", re.I), ["dentistry"]),
    (re.compile(r"physio", re.I), ["physiotherapy"]),
    (re.compile(r"radiograph", re.I), ["radiography"]),
    (re.compile(r"occupational", re.I), ["occupational_therapy"]),
    (re.compile(r"optomet", re.I), ["optometry"]),
    (re.compile(r"podiat", re.I), ["podiatry"]),
    (re.compile(r"veterinar", re.I), ["veterinary_science"]),
    (re.compile(r"speech", re.I), ["speech_pathology"]),
    (re.compile(r"dietetic", re.I), ["dietetics"]),
    (
        re.compile(r"allied-health", re.I),
        [
            "dentistry",
            "physiotherapy",
            "occupational_therapy",
            "podiatry",
            "optometry",
            "dietetics",
            "radiography",
            "speech_pathology",
            "veterinary_science",
        ],
    ),
]

_SKILL_FROM_PATH = [
    (re.compile(r"/listening/", re.I), "listening"),
    (re.compile(r"/reading/", re.I), "reading"),
    (re.compile(r"/writing/", re.I), "writing"),
    (re.compile(r"/speaking/", re.I), "speaking"),
    (re.compile(r"/assessment/", re.I), "vocab"),
]


def resolve_repo_root() -> Path | None:
    """Find monorepo root containing apps/web/src/content."""
    here = Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "apps" / "web" / "src" / "content").is_dir():
            return parent
    return None


def resolve_content_dir() -> Path | None:
    root = resolve_repo_root()
    if root:
        return root / "apps" / "web" / "src" / "content"
    return None


def _professions_for_file(path: Path) -> list[str]:
    rel = path.as_posix()
    for pattern, profs in _PATH_PROFESSIONS:
        if pattern.search(rel):
            return profs
    return ["all"]


def _skill_for_file(path: Path) -> str:
    rel = path.as_posix()
    for pattern, skill in _SKILL_FROM_PATH:
        if pattern.search(rel):
            return skill
    return "all"


def _extract_strings_from_ts(text: str) -> list[str]:
    strings: list[str] = []
    for m in re.finditer(r'"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`', text):
        s = m.group(0)[1:-1]
        if len(s) > 8 and any(c.isalpha() for c in s):
            strings.append(s)
    return strings


def harvest_content_from_dir(content_dir: Path, repo_root: Path) -> dict[str, dict]:
    stats: dict[str, dict] = {}
    if not content_dir.is_dir():
        return stats

    for ts_file in sorted(content_dir.rglob("*.ts")):
        if "node_modules" in ts_file.parts:
            continue
        text = ts_file.read_text(encoding="utf-8", errors="ignore")
        profs = _professions_for_file(ts_file)
        skill = _skill_for_file(ts_file)
        try:
            rel = ts_file.relative_to(repo_root).as_posix()
        except ValueError:
            rel = ts_file.as_posix()

        for chunk in _extract_strings_from_ts(text):
            for pattern in (_ABBREV_RE, _PHRASE_RE):
                for match in pattern.finditer(chunk):
                    term = match.group(1)
                    key = term.lower()
                    if key not in stats:
                        display = term
                        if " " in term:
                            display = term.title()
                        stats[key] = {
                            "term": display,
                            "professions": set(),
                            "skills": set(),
                            "occurrences": 0,
                            "example": "",
                            "sources": set(),
                        }
                    row = stats[key]
                    row["occurrences"] += 1
                    row["professions"].update(profs)
                    row["skills"].add(skill)
                    row["sources"].add(rel)
                    if not row["example"] and len(chunk) < 220:
                        row["example"] = chunk.strip()
    return stats


def load_profession_packs() -> list[dict]:
    """Curated per-profession phrase packs (always merged into index)."""
    packs: list[dict] = []
    if not PROFESSION_PHRASES_DIR.is_dir():
        return packs
    for path in sorted(PROFESSION_PHRASES_DIR.glob("*.json")):
        try:
            packs.append(json.loads(path.read_text(encoding="utf-8")))
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Skipping profession pack %s: %s", path.name, exc)
    return packs


def _pack_phrases_to_stats(packs: list[dict]) -> dict[str, dict]:
    stats: dict[str, dict] = {}
    for pack in packs:
        profession = pack.get("profession", "all")
        for row in pack.get("phrases", []):
            term = row.get("term", "").strip()
            if not term:
                continue
            key = term.lower()
            if key not in stats:
                stats[key] = {
                    "term": term,
                    "professions": set(),
                    "skills": set(),
                    "occurrences": 0,
                    "example": "",
                    "sources": set(),
                }
            entry = stats[key]
            entry["occurrences"] += 10  # boost curated packs
            entry["professions"].add(profession)
            for sk in row.get("skills", ["all"]):
                entry["skills"].add(sk)
            entry["sources"].add(f"profession_phrases/{profession}.json")
            if row.get("example"):
                entry["example"] = row["example"]
    return stats


def _merge_stats(*dicts: dict[str, dict]) -> dict[str, dict]:
    merged: dict[str, dict] = {}
    for src in dicts:
        for key, row in src.items():
            if key not in merged:
                merged[key] = {
                    "term": row["term"],
                    "professions": set(row["professions"]),
                    "skills": set(row["skills"]),
                    "occurrences": row["occurrences"],
                    "example": row.get("example", ""),
                    "sources": set(row.get("sources", set())),
                }
            else:
                m = merged[key]
                m["occurrences"] += row["occurrences"]
                m["professions"].update(row["professions"])
                m["skills"].update(row["skills"])
                m["sources"].update(row.get("sources", set()))
                if not m["example"] and row.get("example"):
                    m["example"] = row["example"]
    return merged


def build_phrase_index(stats: dict[str, dict], *, source_label: str) -> dict:
    phrases = []
    for key in sorted(stats.keys(), key=lambda k: (-stats[k]["occurrences"], k)):
        row = stats[key]
        professions = sorted(row["professions"]) if row["professions"] else ["all"]
        skills = sorted(row["skills"]) if row["skills"] else ["all"]
        phrases.append(
            {
                "term": row["term"],
                "professions": professions,
                "skills": skills,
                "occurrences": row["occurrences"],
                "example": (row.get("example") or "")[:240],
                "sources": sorted(row["sources"])[:5],
            }
        )
    return {
        "version": 1,
        "generated_from": source_label,
        "phrase_count": len(phrases),
        "phrases": phrases,
    }


def merge_harvest_into_glossary(index: dict, min_occurrences: int = 3) -> int:
    """Add stub glossary entries for frequent harvested terms. Returns count added."""
    if not GLOSSARY_PATH.is_file():
        return 0
    glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
    existing = {k.lower() for k in glossary}
    for alias_row in glossary.values():
        for a in alias_row.get("aliases", []):
            existing.add(a.lower())
    added = 0
    for row in index["phrases"]:
        if row["occurrences"] < min_occurrences:
            continue
        key = re.sub(r"[^a-z0-9]+", "_", row["term"].lower()).strip("_")
        if not key or key in existing or row["term"].lower() in existing:
            continue
        display = row["term"]
        glossary[key] = {
            "display": display.upper() if len(display) <= 5 and display.isalpha() else display,
            "full_name": display,
            "explanation": (
                f"Common in OET {', '.join(row['skills'])} tasks for "
                f"{', '.join(row['professions'])}. Nika can explain this in full when you ask."
            ),
            "oet_skills": [s for s in row["skills"] if s != "all"] or ["reading", "writing"],
            "example": row.get("example", ""),
            "aliases": [display.lower()],
            "professions": row["professions"],
            "harvested": True,
        }
        existing.add(key)
        added += 1
    if added:
        GLOSSARY_PATH.write_text(json.dumps(glossary, indent=2, ensure_ascii=False), encoding="utf-8")
    return added


async def enrich_glossary_with_llm(missing_terms: list[str], limit: int = 10) -> int:
    from app.services.llm import generate_chat_reply

    if not GLOSSARY_PATH.is_file():
        return 0
    glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
    system = (
        "You are an OET healthcare English expert. Return ONLY valid JSON for one vocabulary entry."
    )
    enriched = 0
    for term in missing_terms[:limit]:
        key = re.sub(r"[^a-z0-9]+", "_", term.lower()).strip("_")
        if key in glossary or not key:
            continue
        prompt = (
            f'Create a JSON object for OET term "{term}" with keys: '
            'display, full_name, explanation (2-3 sentences for English learners), '
            'oet_skills (array: listening/reading/writing/speaking), example (one sentence), '
            'aliases (array), professions (array of OET profession codes or "all").'
        )
        reply, provider = await generate_chat_reply(
            system=system,
            user_message=prompt,
            context="OET healthcare vocabulary for all 12 professions.",
            temperature=0.2,
        )
        if not reply or provider == "grounded_rules":
            continue
        try:
            json_match = re.search(r"\{[\s\S]+\}", reply)
            if json_match:
                entry = json.loads(json_match.group(0))
                glossary[key] = entry
                enriched += 1
                logger.info("Nika enriched glossary term %s via %s", term, provider)
        except json.JSONDecodeError:
            continue
    if enriched:
        GLOSSARY_PATH.write_text(json.dumps(glossary, indent=2, ensure_ascii=False), encoding="utf-8")
    return enriched


def run_harvest_sync() -> dict:
    """Harvest content + profession packs → oet_phrases_index.json. Returns summary."""
    root = resolve_repo_root()
    content_dir = resolve_content_dir()
    harvested: dict[str, dict] = {}
    source = "profession_phrases_only"

    if content_dir and root:
        harvested = harvest_content_from_dir(content_dir, root)
        source = str(content_dir.relative_to(root)) if root else "apps/web/src/content"

    pack_stats = _pack_phrases_to_stats(load_profession_packs())
    merged = _merge_stats(harvested, pack_stats)
    index = build_phrase_index(merged, source_label=source)
    PHRASES_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")
    stubs = 0
    if settings.nika_merge_glossary_stubs:
        stubs = merge_harvest_into_glossary(index, min_occurrences=settings.nika_merge_min_occurrences)

    return {
        "phrases": index["phrase_count"],
        "content_harvested": len(harvested),
        "pack_phrases": len(pack_stats),
        "glossary_stubs_added": stubs,
        "content_dir": str(content_dir) if content_dir else None,
    }


async def run_full_knowledge_sync(*, enrich: bool | None = None) -> dict:
    """Full sync: harvest, glossary stubs, reload caches, optional LLM enrich, RAG reload."""
    from app.services.nika_knowledge import reload_nika_knowledge
    from app.services.rag import reload_rag_corpus

    summary = run_harvest_sync()
    reload_nika_knowledge()
    reload_rag_corpus()

    do_enrich = enrich if enrich is not None else settings.nika_auto_enrich
    if do_enrich and GLOSSARY_PATH.is_file():
        glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
        existing = {k.lower() for k in glossary}
        for alias_row in glossary.values():
            for a in alias_row.get("aliases", []):
                existing.add(a.lower())
        index = json.loads(PHRASES_PATH.read_text(encoding="utf-8"))
        missing = [
            row["term"]
            for row in sorted(index.get("phrases", []), key=lambda r: -r["occurrences"])
            if row["term"].lower() not in existing
        ]
        if missing:
            summary["glossary_enriched"] = await enrich_glossary_with_llm(
                missing, limit=settings.nika_enrich_limit
            )
            reload_nika_knowledge()

    SYNC_STATE_PATH.write_text(
        json.dumps({"last_sync": summary, "auto": True}, indent=2),
        encoding="utf-8",
    )
    logger.info("Nika knowledge sync complete: %s", summary)
    return summary


async def startup_knowledge_sync() -> None:
    """Called on API startup — fast sync first, enrich in background if enabled."""
    if not settings.nika_auto_sync:
        logger.info("Nika auto-sync disabled (NIKA_AUTO_SYNC=false)")
        return

    try:
        summary = await run_full_knowledge_sync(enrich=False)
        logger.info(
            "Nika knowledge ready: %s phrases, %s glossary stubs",
            summary.get("phrases"),
            summary.get("glossary_stubs_added"),
        )
    except Exception as exc:
        logger.exception("Nika knowledge sync failed on startup: %s", exc)
        return

    if settings.nika_auto_enrich:
        asyncio.create_task(_background_enrich())


async def _background_enrich() -> None:
    try:
        result = await run_full_knowledge_sync(enrich=True)
        logger.info("Nika background enrich done: %s", result.get("glossary_enriched", 0))
    except Exception as exc:
        logger.warning("Nika background enrich skipped: %s", exc)
