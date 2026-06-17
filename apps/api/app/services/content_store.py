"""Admin content CRUD — Postgres via Supabase REST."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.supabase_rest import supabase_rest
from app.services.bundled_static import bundled_static

SKILLS = ("writing", "reading", "listening", "speaking")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row_to_item(row: dict) -> dict:
    return {
        "id": row["id"],
        "externalId": row["external_id"],
        "skill": row["skill"],
        "itemType": row["item_type"],
        "title": row.get("title"),
        "payload": row.get("payload") or {},
        "isActive": row.get("is_active", True),
        "source": row.get("source", "admin"),
        "createdBy": row.get("created_by"),
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


async def list_content_items(
    skill: str | None = None,
    *,
    include_inactive: bool = True,
) -> list[dict]:
    params: dict = {"select": "*", "order": "updated_at.desc"}
    if skill:
        params["skill"] = f"eq.{skill}"
    if not include_inactive:
        params["is_active"] = "eq.true"
    rows = await supabase_rest("GET", "content_items", params=params)
    if not isinstance(rows, list):
        return []
    return [_row_to_item(r) for r in rows]


async def get_content_item(item_id: str) -> dict | None:
    rows = await supabase_rest(
        "GET",
        "content_items",
        params={"id": f"eq.{item_id}", "select": "*"},
    )
    if not rows:
        return None
    return _row_to_item(rows[0])


async def create_content_item(
    *,
    skill: str,
    item_type: str,
    title: str | None,
    payload: dict,
    external_id: str | None,
    source: str,
    created_by: str,
    is_active: bool = True,
) -> dict:
    ext = external_id or f"{skill[:1]}-admin-{uuid4().hex[:10]}"
    body = {
        "external_id": ext,
        "skill": skill,
        "item_type": item_type,
        "title": title,
        "payload": payload,
        "is_active": is_active,
        "source": source,
        "created_by": created_by,
        "updated_at": _now_iso(),
    }
    rows = await supabase_rest("POST", "content_items", json=body)
    if isinstance(rows, list) and rows:
        return _row_to_item(rows[0])
    found = await get_content_item_by_external(skill, ext)
    if found:
        return found
    return {
        "externalId": ext,
        "skill": skill,
        "itemType": item_type,
        "title": title,
        "payload": payload,
        "isActive": is_active,
        "source": source,
    }


async def get_content_item_by_external(skill: str, external_id: str) -> dict | None:
    rows = await supabase_rest(
        "GET",
        "content_items",
        params={
            "skill": f"eq.{skill}",
            "external_id": f"eq.{external_id}",
            "select": "*",
        },
    )
    if not rows:
        return None
    return _row_to_item(rows[0])


async def update_content_item(item_id: str, patch: dict) -> dict | None:
    body: dict = {"updated_at": _now_iso()}
    field_map = {
        "title": "title",
        "payload": "payload",
        "isActive": "is_active",
        "itemType": "item_type",
    }
    for api_key, db_key in field_map.items():
        if api_key in patch:
            body[db_key] = patch[api_key]
    rows = await supabase_rest(
        "PATCH",
        "content_items",
        json=body,
        params={"id": f"eq.{item_id}"},
    )
    if isinstance(rows, list) and rows:
        return _row_to_item(rows[0])
    return await get_content_item(item_id)


async def delete_content_item(item_id: str) -> bool:
    await supabase_rest(
        "DELETE",
        "content_items",
        params={"id": f"eq.{item_id}"},
        prefer="return=minimal",
    )
    return True


async def set_static_item_active(
    skill: str,
    external_id: str,
    *,
    is_active: bool,
    created_by: str,
) -> dict:
    """Toggle bundled static content — upsert static_override row."""
    existing = await get_content_item_by_external(skill, external_id)
    if existing:
        updated = await update_content_item(existing["id"], {"isActive": is_active})
        return updated or existing
    return await create_content_item(
        skill=skill,
        item_type="static_toggle",
        title=external_id,
        payload={"staticId": external_id},
        external_id=external_id,
        source="static_override",
        created_by=created_by,
        is_active=is_active,
    )


def bundled_writing_scenarios() -> list[dict]:
    return bundled_static("writing")


def bundled_for_skill(skill: str) -> list[dict]:
    return bundled_static(skill)


async def merged_catalog(skill: str) -> dict:
    """Bundled static + DB items with active flags for learners."""
    db_items = await list_content_items(skill, include_inactive=True)
    disabled: set[str] = set()
    custom: list[dict] = []
    overrides: dict[str, dict] = {}

    for row in db_items:
        ext = row["externalId"]
        if row["source"] == "static_override" and row["itemType"] == "static_toggle":
            if not row["isActive"]:
                disabled.add(ext)
            continue
        if not row["isActive"]:
            continue
        if row["source"] in ("admin", "generated"):
            custom.append(row)
        elif row["payload"]:
            overrides[ext] = row["payload"]

    bundled: list[dict] = bundled_for_skill(skill)
    if skill == "writing":
        resolved: list[dict] = []
        for s in bundled:
            eid = s["externalId"]
            if eid in disabled:
                continue
            if eid in overrides:
                resolved.append({**s, "payload": overrides[eid], "source": "override"})
            else:
                resolved.append(s)
        bundled = resolved
    else:
        bundled = [s for s in bundled if s["externalId"] not in disabled]

    custom_active = [c for c in custom if c.get("isActive", True)]

    return {
        "skill": skill,
        "bundled": bundled,
        "custom": custom_active,
        "disabledIds": sorted(disabled),
    }
