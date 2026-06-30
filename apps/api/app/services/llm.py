"""LLM provider abstraction — Ollama (local/free) first, then Gemini, Groq, grounded rules."""

from __future__ import annotations

import httpx

from app.core.config import settings
from app.services.ollama_status import is_ollama_ready

# Tried in order when Gemini returns 429 or model unavailable
GEMINI_MODEL_FALLBACKS = (
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash",
)


async def generate_chat_reply(
    *,
    system: str,
    user_message: str,
    context: str,
    temperature: float = 0.4,
) -> tuple[str, str]:
    """Return (reply_text, provider_name). Prefer free local Ollama when ready."""
    if await is_ollama_ready():
        reply = await _ollama_chat(system, user_message, context, temperature)
        if reply:
            return reply, f"ollama:{settings.ollama_model}"

    if settings.gemini_api_key:
        reply, model = await _gemini_chat_with_fallback(
            system, user_message, context, temperature
        )
        if reply:
            return reply, f"gemini:{model}"

    if settings.groq_api_key:
        reply = await _groq_chat(system, user_message, context, temperature)
        if reply:
            return reply, "groq"

    return _grounded_template_reply(user_message, context), "grounded_rules"


async def generate_cloud_chat_reply(
    *,
    system: str,
    user_message: str,
    context: str,
    temperature: float = 0.4,
) -> tuple[str, str]:
    """Gemini → Groq only (no Ollama). Use for scheduled / shared content in production."""
    if settings.gemini_api_key:
        reply, model = await _gemini_chat_with_fallback(
            system, user_message, context, temperature
        )
        if reply:
            return reply, f"gemini:{model}"

    if settings.groq_api_key:
        reply = await _groq_chat(system, user_message, context, temperature)
        if reply:
            return reply, "groq"

    return _grounded_template_reply(user_message, context), "grounded_rules"


async def _gemini_chat_with_fallback(
    system: str,
    user_message: str,
    context: str,
    temperature: float,
) -> tuple[str | None, str | None]:
    models = [settings.chat_model, *GEMINI_MODEL_FALLBACKS]
    seen: set[str] = set()
    for model in models:
        if model in seen:
            continue
        seen.add(model)
        reply, retryable = await _gemini_chat(
            system, user_message, context, temperature, model
        )
        if reply:
            return reply, model
        if not retryable:
            break
    return None, None


async def _gemini_chat(
    system: str,
    user_message: str,
    context: str,
    temperature: float,
    model: str,
) -> tuple[str | None, bool]:
    """Return (reply, should_try_next_model)."""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    headers = {"x-goog-api-key": settings.gemini_api_key, "Content-Type": "application/json"}
    prompt = (
        f"{system}\n\n"
        f"CONTEXT (ground answers here only):\n{context}\n\n"
        f"USER QUESTION:\n{user_message}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 1024},
    }
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, headers=headers, json=payload)
            if res.status_code == 429:
                return None, True
            if res.status_code == 404:
                return None, True
            res.raise_for_status()
            data = res.json()
            parts = data["candidates"][0]["content"]["parts"]
            return parts[0].get("text", "").strip(), False
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (429, 404):
            return None, True
        return None, False
    except Exception:
        return None, False


async def _ollama_chat(
    system: str,
    user_message: str,
    context: str,
    temperature: float,
) -> str | None:
    url = f"{settings.ollama_base_url.rstrip('/')}/v1/chat/completions"
    messages = [
        {"role": "system", "content": f"{system}\n\nCONTEXT:\n{context}"},
        {"role": "user", "content": user_message},
    ]
    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "temperature": temperature,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


async def _groq_chat(
    system: str,
    user_message: str,
    context: str,
    temperature: float,
) -> str | None:
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    messages = [
        {"role": "system", "content": f"{system}\n\nCONTEXT:\n{context}"},
        {"role": "user", "content": user_message},
    ]
    payload = {
        "model": settings.groq_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1024,
    }
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            res.raise_for_status()
            return res.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


def _grounded_template_reply(user_message: str, context: str) -> str:
    """Rule-based synthesis when no LLM key — still grounded in retrieved chunks."""
    lines = [ln.strip() for ln in context.split("\n") if ln.strip()]
    if not lines:
        return (
            "I don't have enough OET context to answer that confidently. "
            "Check the official guides at oet.com/ready or ask about a specific "
            "OET skill (Listening, Reading, Writing, Speaking)."
        )

    intro = "Based on OET Coach knowledge and official preparation guidance:"
    body = "\n".join(f"• {ln[:280]}" for ln in lines[:4])
    lower = user_message.lower()
    if "today" in lower or "study" in lower or "plan" in lower:
        intro = "Here's what I'd focus on from your study context:"
    elif any(r in lower for r in ("gphc", "gmc", "nmc", "regulator", "registration")):
        intro = "From official regulator and OET registration guidance:"

    return f"{intro}\n\n{body}\n\nFor full detail, see the linked official sources in Materials."
