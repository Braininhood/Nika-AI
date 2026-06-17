"""Tests for user skill map resolution."""

from app.services.user_skill_map import default_skill_map, resolve_skill_map


def test_default_skill_map_has_four_skills():
    snap = default_skill_map("user-1", "pharmacy")
    assert snap["profession"] == "pharmacy"
    assert set(snap["diagnostic"].keys()) == {"writing", "reading", "listening", "speaking"}


def test_resolve_prefers_payload():
    import asyncio

    payload = {
        "diagnostic": {
            "writing": {"gap": 2, "weakTags": ["writing:purpose"], "estBand": "C"},
            "reading": {"gap": 0, "weakTags": [], "estBand": "B"},
            "listening": {"gap": 0, "weakTags": [], "estBand": "B"},
            "speaking": {"gap": 1, "weakTags": [], "estBand": "C+"},
        }
    }
    resolved = asyncio.run(resolve_skill_map("user-1", payload_map=payload))
    assert resolved["diagnostic"]["writing"]["gap"] == 2


def run_all() -> None:
    test_default_skill_map_has_four_skills()
    print("All user skill map tests passed.")


if __name__ == "__main__":
    run_all()
    test_resolve_prefers_payload()
    print("All user skill map tests passed.")
