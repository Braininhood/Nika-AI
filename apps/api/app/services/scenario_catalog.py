"""Writing scenario catalog — synced from web content via scripts/export-writing-scenarios.mjs."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "writing_scenarios.json"

COUNTRY_ALIASES = {
    "UK": "UK",
    "GB": "UK",
    "AU": "AU",
    "AUS": "AU",
    "US": "US",
    "USA": "US",
    "IE": "IE",
    "IRL": "IE",
    "NZ": "NZ",
    "CA": "CA",
}


def normalize_country(code: str | None) -> str | None:
    if not code:
        return None
    return COUNTRY_ALIASES.get(code.strip().upper())


@lru_cache(maxsize=1)
def load_scenarios() -> list[dict]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def scenarios_for_user(profession: str | None, target_country: str | None) -> list[dict]:
    catalog = load_scenarios()
    if not profession:
        return sorted(catalog, key=lambda s: (s["difficulty"], s["title"]))

    for_profession = [s for s in catalog if s["profession"] == profession]
    if not for_profession:
        return sorted(catalog, key=lambda s: (s["difficulty"], s["title"]))

    country = normalize_country(target_country)
    if not country:
        return sorted(for_profession, key=lambda s: (s["difficulty"], s["title"]))

    localized = sorted([s for s in for_profession if s["countryCode"] == country], key=lambda s: (s["difficulty"], s["title"]))
    other = sorted([s for s in for_profession if s["countryCode"] != country], key=lambda s: (s["difficulty"], s["title"]))
    return localized + other


def pick_plan_scenario(
    profession: str | None,
    target_country: str | None,
    writing_gap: int | None = None,
) -> dict:
    scenarios = scenarios_for_user(profession, target_country)
    fallback = next((s for s in load_scenarios() if s["id"] == "w-pharm-001"), scenarios[0])
    if not scenarios:
        return fallback

    gap = writing_gap if writing_gap is not None else 1
    max_difficulty = 1 if gap >= 2 else 2 if gap == 1 else 3
    matched = [s for s in scenarios if s["difficulty"] <= max_difficulty]
    return matched[0] if matched else scenarios[0]
