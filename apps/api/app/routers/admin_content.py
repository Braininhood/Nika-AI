"""Admin content management + ML retrain."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.security import AuthUser, require_admin
from app.services.bundled_static import bundled_for_skill
from app.services.content_generator import (
    generate_quiz_questions,
    generate_speaking_card,
    generate_writing_scenario,
)
from app.services.content_store import (
    SKILLS,
    bundled_writing_scenarios,
    create_content_item,
    delete_content_item,
    get_content_item,
    list_content_items,
    merged_catalog,
    set_static_item_active,
    update_content_item,
)
from app.services.readiness_model import retrain_from_database

router = APIRouter()


class ContentItemCreate(BaseModel):
    skill: str
    itemType: str
    title: str | None = None
    payload: dict = Field(default_factory=dict)
    externalId: str | None = None
    isActive: bool = True


class ContentItemUpdate(BaseModel):
    title: str | None = None
    payload: dict | None = None
    isActive: bool | None = None
    itemType: str | None = None


class GenerateContentBody(BaseModel):
    skill: str
    itemType: str = "quiz_question"
    profession: str | None = None
    country: str | None = None
    count: int = 5
    difficulty: int = 2
    weakTags: list[str] = Field(default_factory=list)


class StaticToggleBody(BaseModel):
    skill: str
    externalId: str
    isActive: bool


@router.get("/content")
async def admin_list_content(
    skill: str | None = Query(None),
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    if skill and skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")
    db_items = await list_content_items(skill)
    if skill:
        bundled = bundled_for_skill(skill)
    else:
        bundled = []
        for s in SKILLS:
            bundled.extend(bundled_for_skill(s))
    return {"bundled": bundled, "items": db_items}


@router.get("/content/merged/{skill}")
async def admin_merged_preview(
    skill: str,
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    if skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")
    return await merged_catalog(skill)


@router.post("/content")
async def admin_create_content(
    body: ContentItemCreate,
    admin: AuthUser = Depends(require_admin),
) -> dict:
    if body.skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")
    item = await create_content_item(
        skill=body.skill,
        item_type=body.itemType,
        title=body.title,
        payload=body.payload,
        external_id=body.externalId,
        source="admin",
        created_by=admin.id,
        is_active=body.isActive,
    )
    return {"item": item}


@router.patch("/content/{item_id}")
async def admin_update_content(
    item_id: str,
    body: ContentItemUpdate,
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    patch = body.model_dump(exclude_none=True)
    item = await update_content_item(item_id, patch)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return {"item": item}


@router.delete("/content/{item_id}")
async def admin_delete_content(
    item_id: str,
    _admin: AuthUser = Depends(require_admin),
) -> dict:
    await delete_content_item(item_id)
    return {"ok": True}


@router.post("/content/toggle-static")
async def admin_toggle_static(
    body: StaticToggleBody,
    admin: AuthUser = Depends(require_admin),
) -> dict:
    if body.skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")
    item = await set_static_item_active(
        body.skill,
        body.externalId,
        is_active=body.isActive,
        created_by=admin.id,
    )
    return {"item": item}


@router.post("/content/generate")
async def admin_generate_content(
    body: GenerateContentBody,
    admin: AuthUser = Depends(require_admin),
) -> dict:
    if body.skill not in SKILLS:
        raise HTTPException(status_code=400, detail="Invalid skill")

    created: list[dict] = []

    if body.itemType == "quiz_question" or body.skill in ("reading", "listening"):
        questions = await generate_quiz_questions(
            skill=body.skill,
            profession=body.profession,
            country=body.country,
            count=body.count,
            weak_tags=body.weakTags,
        )
        for q in questions:
            item = await create_content_item(
                skill=body.skill,
                item_type="quiz_question",
                title=q.get("prompt", "")[:120],
                payload=q,
                external_id=q.get("id"),
                source="generated",
                created_by=admin.id,
            )
            created.append(item)
    elif body.skill == "writing":
        scenario = await generate_writing_scenario(
            profession=body.profession,
            country=body.country,
            difficulty=body.difficulty,
        )
        item = await create_content_item(
            skill="writing",
            item_type="scenario",
            title=scenario.get("meta", {}).get("title", scenario.get("id")),
            payload=scenario,
            external_id=scenario.get("id"),
            source="generated",
            created_by=admin.id,
        )
        created.append(item)
    elif body.skill == "speaking":
        card = await generate_speaking_card(
            profession=body.profession,
            country=body.country,
            difficulty=body.difficulty,
        )
        item = await create_content_item(
            skill="speaking",
            item_type="role_card",
            title=card.get("cardText", {}).get("overview", card.get("id"))[:120],
            payload=card,
            external_id=card.get("id"),
            source="generated",
            created_by=admin.id,
        )
        created.append(item)
    else:
        raise HTTPException(status_code=400, detail="Unsupported generate type")

    return {"items": created, "count": len(created)}


@router.post("/ml/retrain")
async def admin_retrain_ml(_admin: AuthUser = Depends(require_admin)) -> dict:
    result = await retrain_from_database()
    return result
