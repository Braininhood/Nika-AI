"""Vocabulary — translate, explain, lookup via DeepL + Nika knowledge brain."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.quota_deps import require_ai_quota
from app.core.security import AuthUser, get_current_user
from app.routers.profile import _load_profile_row
from app.services.deepl import translate_text
from app.services.daily_tip import get_curated_daily_tip
from app.services.daily_tip_generator import get_daily_tip
from app.services.healthcare_vocabulary import format_vocab_entry, lookup_healthcare_term
from app.services.llm import generate_chat_reply
from app.services.nika_knowledge import knowledge_context_for_term, knowledge_stats
from app.services.quota import QuotaStatus
from app.services.vocabulary_chat import EXPLAIN_SYSTEM

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    target_lang: str = Field(..., min_length=2, max_length=10)
    source_lang: str = "EN"


class ExplainRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=120)
    context: str | None = Field(None, max_length=500)
    profession: str | None = None


@router.get("/today-tip")
async def vocabulary_today_tip(
    user: AuthUser = Depends(get_current_user),
) -> dict:
    """One curated OET tip per profession per day — vocabulary, speaking, writing."""
    profile_row = await _load_profile_row(user.id)
    profession = profile_row.get("profession") if profile_row else None
    tip = await get_daily_tip(profession)
    return {"user_id": user.id, **tip}


@router.get("/knowledge/stats")
async def vocabulary_knowledge_stats(
    user: AuthUser = Depends(get_current_user),
) -> dict:
    """Glossary + harvested phrase counts — all 12 OET professions."""
    return {"user_id": user.id, **knowledge_stats()}


@router.post("/translate")
async def vocabulary_translate(
    payload: TranslateRequest,
    user: AuthUser = Depends(get_current_user),
) -> dict:
    result = await translate_text(
        payload.text,
        target_lang=payload.target_lang,
        source_lang=payload.source_lang,
    )
    return {"user_id": user.id, "original": payload.text, **result}


@router.post("/explain")
async def vocabulary_explain(
    payload: ExplainRequest,
    user: AuthUser = Depends(get_current_user),
    _quota: QuotaStatus = Depends(require_ai_quota),
) -> dict:
    prof = (payload.profession or "healthcare").replace("_", " ")
    known = lookup_healthcare_term(payload.word)
    knowledge_ctx = knowledge_context_for_term(
        payload.word,
        message=payload.context or "",
        profession=payload.profession,
    )

    if known:
        explanation = format_vocab_entry(known, profession=prof)
        provider = "glossary+harvest"
    else:
        prompt = f"Explain the word/phrase '{payload.word}' for an OET {prof} candidate."
        if payload.context:
            prompt += f"\nLearner's full message or context: {payload.context}"

        explanation, provider = await generate_chat_reply(
            system=EXPLAIN_SYSTEM,
            user_message=prompt,
            context=knowledge_ctx or f"OET healthcare English vocabulary. Word: {payload.word}",
            temperature=0.3,
        )

    return {
        "user_id": user.id,
        "word": payload.word,
        "explanation": explanation,
        "provider": provider,
    }
