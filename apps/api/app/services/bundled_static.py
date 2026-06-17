"""Static content manifests for admin toggle + merged catalog (mirrors web bundles)."""

from __future__ import annotations

from app.services.scenario_catalog import load_scenarios

READING_STATIC = [
    {"externalId": "r-part-a-001", "title": "Ward handover notices", "part": "A"},
    {"externalId": "r-part-b-001", "title": "Workplace policy extract", "part": "B"},
    {"externalId": "r-part-c-001", "title": "Extended workplace text", "part": "C"},
    {"externalId": "r-med-part-a", "title": "Medical ward notices", "part": "A"},
    {"externalId": "r-nurs-part-a", "title": "Nursing shift handover", "part": "A"},
]

LISTENING_STATIC = [
    {"externalId": "l-part-a-001", "title": "Consultation notes", "part": "A"},
    {"externalId": "l-part-b-001", "title": "Clinical handover extract", "part": "B"},
    {"externalId": "l-part-c-001", "title": "Presentation excerpt", "part": "C"},
]

SPEAKING_STATIC = [
    {"externalId": "s-pharm-001", "title": "Community pharmacy counselling", "setting": "Pharmacy"},
    {"externalId": "s-nurs-001", "title": "Ward patient concern", "setting": "Hospital ward"},
    {"externalId": "s-med-001", "title": "Clinic follow-up", "setting": "Outpatient clinic"},
]


def bundled_static(skill: str) -> list[dict]:
    if skill == "writing":
        return [
            {
                "externalId": s["id"],
                "skill": "writing",
                "itemType": "scenario",
                "title": s.get("title", s["id"]),
                "payload": s,
                "isActive": True,
                "source": "bundled",
                "bundled": True,
            }
            for s in load_scenarios()
        ]
    if skill == "reading":
        return [
            {
                "externalId": b["externalId"],
                "skill": "reading",
                "itemType": "block",
                "title": b["title"],
                "payload": b,
                "isActive": True,
                "source": "bundled",
                "bundled": True,
            }
            for b in READING_STATIC
        ]
    if skill == "listening":
        return [
            {
                "externalId": b["externalId"],
                "skill": "listening",
                "itemType": "block",
                "title": b["title"],
                "payload": b,
                "isActive": True,
                "source": "bundled",
                "bundled": True,
            }
            for b in LISTENING_STATIC
        ]
    if skill == "speaking":
        return [
            {
                "externalId": b["externalId"],
                "skill": "speaking",
                "itemType": "role_card",
                "title": b["title"],
                "payload": b,
                "isActive": True,
                "source": "bundled",
                "bundled": True,
            }
            for b in SPEAKING_STATIC
        ]
    return []


# Alias used by admin_content router and content_store.
bundled_for_skill = bundled_static
