"""Admin user groups — manual and dynamic (profession / country) audiences."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException

from app.core.supabase_rest import supabase_rest
from app.schemas.admin_groups import (
    GroupMembersUpdate,
    UserGroupCreate,
    UserGroupDetail,
    UserGroupMemberItem,
    UserGroupSummary,
    UserGroupUpdate,
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _get_group_row(group_id: str) -> dict[str, Any]:
    rows = await supabase_rest(
        "GET",
        "user_groups",
        params={"id": f"eq.{group_id}", "select": "*"},
    )
    if not isinstance(rows, list) or not rows:
        raise HTTPException(status_code=404, detail="Group not found")
    row = rows[0]
    if not isinstance(row, dict):
        raise HTTPException(status_code=404, detail="Group not found")
    return row


async def _dynamic_member_ids(kind: str, filter_value: str | None) -> list[str]:
    if not filter_value:
        return []
    params: dict[str, str] = {"select": "id"}
    if kind == "profession":
        params["profession"] = f"eq.{filter_value}"
    elif kind == "country":
        params["target_country"] = f"ilike.%{filter_value}%"
    else:
        return []
    rows = await supabase_rest("GET", "profiles", params=params)
    if not isinstance(rows, list):
        return []
    return [str(r["id"]) for r in rows if isinstance(r, dict) and r.get("id")]


async def _member_count_for_row(row: dict[str, Any]) -> int:
    kind = str(row.get("kind") or "manual")
    if kind == "manual":
        group_id = str(row["id"])
        members = await supabase_rest(
            "GET",
            "user_group_members",
            params={"group_id": f"eq.{group_id}", "select": "user_id"},
        )
        return len(members) if isinstance(members, list) else 0
    return len(await _dynamic_member_ids(kind, row.get("filter_value")))


def _summary_from_row(row: dict[str, Any], member_count: int) -> UserGroupSummary:
    return UserGroupSummary(
        id=str(row["id"]),
        name=str(row.get("name") or ""),
        description=row.get("description"),
        kind=str(row.get("kind") or "manual"),  # type: ignore[arg-type]
        filter_value=row.get("filter_value"),
        member_count=member_count,
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


async def list_groups() -> list[UserGroupSummary]:
    rows = await supabase_rest(
        "GET",
        "user_groups",
        params={"select": "*", "order": "name.asc"},
    )
    if not isinstance(rows, list):
        return []

    summaries: list[UserGroupSummary] = []
    for row in rows:
        if not isinstance(row, dict) or not row.get("id"):
            continue
        count = await _member_count_for_row(row)
        summaries.append(_summary_from_row(row, count))
    return summaries


async def create_group(body: UserGroupCreate) -> UserGroupSummary:
    if body.kind != "manual" and not body.filter_value:
        raise HTTPException(status_code=400, detail="filter_value is required for dynamic groups")

    rows = await supabase_rest(
        "POST",
        "user_groups",
        json={
            "name": body.name.strip(),
            "description": body.description,
            "kind": body.kind,
            "filter_value": body.filter_value,
        },
    )
    row = rows[0] if isinstance(rows, list) and rows else rows
    if not isinstance(row, dict):
        raise HTTPException(status_code=502, detail="Could not create group")
    count = await _member_count_for_row(row)
    return _summary_from_row(row, count)


async def _load_members_for_ids(user_ids: list[str]) -> list[UserGroupMemberItem]:
    if not user_ids:
        return []
    profiles_map: dict[str, dict[str, Any]] = {}
    profile_rows = await supabase_rest(
        "GET",
        "profiles",
        params={"id": f"in.({','.join(user_ids[:500])})", "select": "id,email,profession"},
    )
    if isinstance(profile_rows, list):
        profiles_map = {str(p["id"]): p for p in profile_rows if isinstance(p, dict) and p.get("id")}

    return [
        UserGroupMemberItem(
            id=uid,
            email=profiles_map.get(uid, {}).get("email"),
            profession=profiles_map.get(uid, {}).get("profession"),
            added_at=None,
        )
        for uid in user_ids[:500]
    ]


async def get_group(group_id: str) -> UserGroupDetail:
    row = await _get_group_row(group_id)
    kind = str(row.get("kind") or "manual")

    members: list[UserGroupMemberItem] = []
    if kind == "manual":
        member_rows = await supabase_rest(
            "GET",
            "user_group_members",
            params={
                "group_id": f"eq.{group_id}",
                "select": "user_id,added_at",
                "order": "added_at.desc",
            },
        )
        if isinstance(member_rows, list) and member_rows:
            user_ids = [str(m["user_id"]) for m in member_rows if isinstance(m, dict) and m.get("user_id")]
            profiles_map: dict[str, dict[str, Any]] = {}
            if user_ids:
                profile_rows = await supabase_rest(
                    "GET",
                    "profiles",
                    params={"id": f"in.({','.join(user_ids)})", "select": "id,email,profession"},
                )
                if isinstance(profile_rows, list):
                    profiles_map = {
                        str(p["id"]): p for p in profile_rows if isinstance(p, dict) and p.get("id")
                    }
            for member in member_rows:
                if not isinstance(member, dict):
                    continue
                uid = str(member.get("user_id") or "")
                profile = profiles_map.get(uid, {})
                members.append(
                    UserGroupMemberItem(
                        id=uid,
                        email=profile.get("email"),
                        profession=profile.get("profession"),
                        added_at=member.get("added_at"),
                    )
                )
    else:
        user_ids = await _dynamic_member_ids(kind, row.get("filter_value"))
        members = await _load_members_for_ids(user_ids)

    summary = _summary_from_row(row, len(members))
    return UserGroupDetail(**summary.model_dump(), members=members)


async def update_group(group_id: str, body: UserGroupUpdate) -> UserGroupSummary:
    patch: dict[str, Any] = {"updated_at": _now_iso()}
    if body.name is not None:
        patch["name"] = body.name.strip()
    if body.description is not None:
        patch["description"] = body.description
    if body.kind is not None:
        patch["kind"] = body.kind
    if body.filter_value is not None:
        patch["filter_value"] = body.filter_value

    await supabase_rest(
        "PATCH",
        "user_groups",
        params={"id": f"eq.{group_id}"},
        json=patch,
    )
    row = await _get_group_row(group_id)
    return _summary_from_row(row, await _member_count_for_row(row))


async def delete_group(group_id: str) -> None:
    await supabase_rest(
        "DELETE",
        "user_groups",
        params={"id": f"eq.{group_id}"},
        prefer="return=minimal",
    )


async def add_group_members(group_id: str, body: GroupMembersUpdate) -> UserGroupDetail:
    row = await _get_group_row(group_id)
    if str(row.get("kind") or "manual") != "manual":
        raise HTTPException(status_code=400, detail="Only manual groups support adding members")
    payload = [{"group_id": group_id, "user_id": uid} for uid in body.user_ids]
    await supabase_rest(
        "POST",
        "user_group_members",
        json=payload,
        prefer="resolution=ignore-duplicates,return=minimal",
    )
    await supabase_rest(
        "PATCH",
        "user_groups",
        params={"id": f"eq.{group_id}"},
        json={"updated_at": _now_iso()},
        prefer="return=minimal",
    )
    return await get_group(group_id)


async def remove_group_member(group_id: str, user_id: str) -> UserGroupDetail:
    row = await _get_group_row(group_id)
    if str(row.get("kind") or "manual") != "manual":
        raise HTTPException(status_code=400, detail="Only manual groups support removing members")
    await supabase_rest(
        "DELETE",
        "user_group_members",
        params={"group_id": f"eq.{group_id}", "user_id": f"eq.{user_id}"},
        prefer="return=minimal",
    )
    await supabase_rest(
        "PATCH",
        "user_groups",
        params={"id": f"eq.{group_id}"},
        json={"updated_at": _now_iso()},
        prefer="return=minimal",
    )
    return await get_group(group_id)


async def resolve_group_user_ids(group_id: str) -> list[str]:
    row = await _get_group_row(group_id)
    kind = str(row.get("kind") or "manual")
    if kind == "manual":
        rows = await supabase_rest(
            "GET",
            "user_group_members",
            params={"group_id": f"eq.{group_id}", "select": "user_id"},
        )
        if not isinstance(rows, list):
            return []
        return [str(r["user_id"]) for r in rows if isinstance(r, dict) and r.get("user_id")]
    return await _dynamic_member_ids(kind, row.get("filter_value"))
