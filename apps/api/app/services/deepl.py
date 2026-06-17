"""DeepL translation — vocabulary native-language support."""

from __future__ import annotations

import httpx

from app.core.config import settings

DEEPL_FREE_URL = "https://api-free.deepl.com/v2/translate"
DEEPL_PRO_URL = "https://api.deepl.com/v2/translate"


def _deepl_base_url() -> str:
    key = settings.deepl_api_key
    if key.endswith(":fx"):
        return DEEPL_FREE_URL
    return DEEPL_PRO_URL


async def translate_text(
    text: str,
    *,
    target_lang: str,
    source_lang: str = "EN",
) -> dict:
    """Translate text to target language. Returns DeepL response fields."""
    if not settings.deepl_api_key:
        return {
            "text": text,
            "detected_source_language": source_lang,
            "provider": "none",
            "error": "DEEPL_API_KEY not configured",
        }

    target = target_lang.upper().split("-")[0]
    source = source_lang.upper().split("-")[0]

    payload = {
        "text": [text.strip()],
        "target_lang": target,
    }
    if source and source != "AUTO":
        payload["source_lang"] = source

    headers = {"Authorization": f"DeepL-Auth-Key {settings.deepl_api_key}"}

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            res = await client.post(_deepl_base_url(), data=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            translations = data.get("translations") or []
            if not translations:
                return {"text": text, "provider": "deepl", "error": "empty_response"}
            first = translations[0]
            return {
                "text": first.get("text", text),
                "detected_source_language": first.get("detected_source_language", source),
                "provider": "deepl",
            }
    except Exception as exc:
        return {"text": text, "provider": "deepl", "error": str(exc)}
