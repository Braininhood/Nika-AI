"""Server-side diagnostic answer validation — never trust client `correct` flags."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "diagnostic_answer_keys.json"


@lru_cache(maxsize=1)
def _load_keys() -> dict[str, dict]:
    with _DATA_PATH.open(encoding="utf-8") as fh:
        return json.load(fh)


def score_diagnostic_answer(
    *,
    item_id: str,
    selected_index: int | None = None,
) -> dict:
    """Return normalized answer record with server-computed correctness."""
    keys = _load_keys()
    meta = keys.get(item_id)
    if not meta:
        raise HTTPException(status_code=400, detail="Unknown diagnostic item")

    if selected_index is None:
        raise HTTPException(status_code=400, detail="selected_index is required")

    correct_index = int(meta["correctIndex"])
    if selected_index < 0 or selected_index > 10:
        raise HTTPException(status_code=400, detail="Invalid answer index")

    correct = selected_index == correct_index
    skill = meta["skill"]
    tier = int(meta.get("tier", 2))
    tag = meta.get("tag") or f"{skill}:foundation"

    return {
        "skill": skill,
        "itemId": item_id,
        "correct": correct,
        "tier": tier,
        "tag": tag,
        "selectedIndex": selected_index,
    }
