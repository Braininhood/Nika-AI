"""Vocabulary — translate, explain, lookup via DeepL + optional LLM."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.quota_deps import require_ai_quota
from app.core.security import AuthUser, get_current_user
from app.services.deepl import translate_text
from app.services.llm import generate_chat_reply
from app.services.quota import QuotaStatus

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    target_lang: str = Field(..., min_length=2, max_length=10)
    source_lang: str = "EN"


class ExplainRequest(BaseModel):
    word: str = Field(..., min_length=1, max_length=120)
    context: str | None = Field(None, max_length=500)
    profession: str | None = None


EXPLAIN_SYSTEM = """You are Nika, OET vocabulary coach. Explain English healthcare/OET terms clearly in 2-3 sentences.
Include: plain meaning, typical OET context (reading/listening/writing/speaking), one example phrase.
Never give clinical advice for real patients. English only in explanation."""


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
    context = payload.context or ""
    prof = (payload.profession or "healthcare").replace("_", " ")
    prompt = f"Explain the word/phrase '{payload.word}' for an OET {prof} candidate."
    if context:
        prompt += f"\nContext sentence: {context}"

    explanation, provider = await generate_chat_reply(
        system=EXPLAIN_SYSTEM,
        user_message=prompt,
        context=f"OET healthcare English vocabulary. Word: {payload.word}",
        temperature=0.3,
    )

    return {
        "user_id": user.id,
        "word": payload.word,
        "explanation": explanation,
        "provider": provider,
    }
