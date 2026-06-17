"""Content pickers with rotation — bundled + DB merged catalog."""

from __future__ import annotations

from app.services.scenario_catalog import pick_plan_scenario, scenarios_for_user

READING_FALLBACKS = [
    {"id": "r-part-b-001", "title": "Workplace policy extract", "durationMinutes": 20, "part": "B"},
    {"id": "r-part-a-001", "title": "Ward handover notices", "durationMinutes": 15, "part": "A"},
    {"id": "r-part-c-001", "title": "Extended workplace text", "durationMinutes": 20, "part": "C"},
]

LISTENING_FALLBACKS = [
    {"id": "l-part-b-001", "title": "Clinical handover extract", "durationMinutes": 12, "part": "B"},
    {"id": "l-part-a-001", "title": "Consultation notes", "durationMinutes": 12, "part": "A"},
    {"id": "l-part-c-001", "title": "Presentation excerpt", "durationMinutes": 12, "part": "C"},
]

SPEAKING_FALLBACKS = [
    {
        "id": "s-pharm-001",
        "setting": "Community pharmacy",
        "cardText": {"overview": "Counsel a patient on a new medication"},
        "prepMinutes": 3,
        "durationMinutes": 5,
    },
]


def _pick_rotated(pool: list[dict], attempted_ids: list[str], key: str = "id") -> dict:
    if not pool:
        raise ValueError("empty pool")
    attempt_set = set(attempted_ids)
    for item in pool:
        if item[key] not in attempt_set:
            return item
    idx = len(attempted_ids) % len(pool)
    return pool[idx]


def _item_id(row: dict) -> str:
    payload = row.get("payload") or row
    return str(payload.get("id") or row.get("externalId") or "")


def _catalog_to_pool(skill: str, catalog: dict) -> list[dict]:
    """Normalize merged_catalog output into picker-ready dicts."""
    out: list[dict] = []
    seen: set[str] = set()

    for row in catalog.get("bundled") or []:
        payload = row.get("payload") or row
        eid = _item_id(row)
        if not eid or eid in seen:
            continue
        seen.add(eid)
        if skill == "writing":
            out.append({**payload, "id": payload.get("id") or eid})
        elif skill in ("reading", "listening"):
            out.append(
                {
                    "id": eid,
                    "title": row.get("title") or payload.get("title", eid),
                    "part": payload.get("part", "B"),
                    "durationMinutes": payload.get(
                        "durationMinutes", 20 if skill == "reading" else 12
                    ),
                }
            )
        elif skill == "speaking":
            out.append({**payload, "id": payload.get("id") or eid})

    for row in catalog.get("custom") or []:
        payload = row.get("payload") or {}
        item_type = row.get("itemType", "")
        eid = _item_id(row)
        if not eid or eid in seen:
            continue
        if skill == "writing" and item_type in ("scenario", "writing_scenario"):
            seen.add(eid)
            out.append({**payload, "id": payload.get("id") or eid})
        elif skill in ("reading", "listening") and item_type in ("block", "quiz_question"):
            seen.add(eid)
            out.append(
                {
                    "id": eid,
                    "title": row.get("title") or payload.get("title", eid),
                    "part": payload.get("part", "B"),
                    "durationMinutes": payload.get(
                        "durationMinutes", 20 if skill == "reading" else 12
                    ),
                }
            )
        elif skill == "speaking" and item_type == "role_card":
            seen.add(eid)
            out.append({**payload, "id": payload.get("id") or eid})

    return out


async def load_picker_pools() -> dict[str, list[dict]]:
    """Load merged catalog pools for all skills (best-effort if DB unavailable)."""
    from app.services.content_store import SKILLS, merged_catalog

    pools: dict[str, list[dict]] = {}
    for skill in SKILLS:
        try:
            catalog = await merged_catalog(skill)
            pool = _catalog_to_pool(skill, catalog)
            pools[skill] = pool if pool else _fallback_pool(skill)
        except Exception:
            pools[skill] = _fallback_pool(skill)
    return pools


def _fallback_pool(skill: str) -> list[dict]:
    if skill == "reading":
        return list(READING_FALLBACKS)
    if skill == "listening":
        return list(LISTENING_FALLBACKS)
    if skill == "speaking":
        return list(SPEAKING_FALLBACKS)
    return scenarios_for_user(None, None) or []


def pick_writing_scenario(
    profession: str | None,
    target_country: str | None,
    gap: int,
    recent_ids: list[str],
    *,
    pool: list[dict] | None = None,
) -> dict:
    scenarios = pool or scenarios_for_user(profession, target_country)
    max_diff = 1 if gap >= 2 else 2 if gap == 1 else 3
    matched = [s for s in scenarios if s.get("difficulty", s.get("meta", {}).get("difficulty", 2)) <= max_diff]
    if not matched:
        matched = scenarios
    if not matched:
        return pick_plan_scenario(profession, target_country, gap)
    return _pick_rotated(matched, recent_ids)


def pick_reading_block(
    profession: str | None,
    target_country: str | None,
    gap: int,
    part: str,
    recent_ids: list[str],
    *,
    pool: list[dict] | None = None,
) -> dict:
    base = pool or READING_FALLBACKS
    filtered = [b for b in base if b.get("part") == part] or base
    return _pick_rotated(filtered, recent_ids)


def pick_listening_block(
    profession: str | None,
    target_country: str | None,
    gap: int,
    part: str,
    recent_ids: list[str],
    *,
    pool: list[dict] | None = None,
) -> dict:
    base = pool or LISTENING_FALLBACKS
    filtered = [b for b in base if b.get("part") == part] or base
    return _pick_rotated(filtered, recent_ids)


def pick_role_card(
    profession: str | None,
    target_country: str | None,
    gap: int,
    recent_ids: list[str],
    *,
    pool: list[dict] | None = None,
) -> dict:
    base = pool or SPEAKING_FALLBACKS
    return _pick_rotated(base, recent_ids)
