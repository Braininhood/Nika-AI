"""Text embeddings — Gemini when configured, else deterministic local vectors."""

from __future__ import annotations

import hashlib
import math
import re

import httpx

from app.core.config import settings

_TOKEN_RE = re.compile(r"[a-z0-9]+")
_DIM = 384


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def embed_text_local(text: str, *, dim: int = _DIM) -> list[float]:
    """Deterministic bag-of-hashes embedding — no ML deps, good for dev/offline."""
    vec = [0.0] * dim
    tokens = _tokenize(text)
    if not tokens:
        return vec
    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        for i in range(0, min(len(digest), dim), 2):
            idx = (digest[i] * 256 + digest[i + 1]) % dim
            vec[idx] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


async def embed_text_gemini(text: str) -> list[float] | None:
    if not settings.gemini_api_key:
        return None
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.embedding_model}:embedContent?key={settings.gemini_api_key}"
    )
    payload = {
        "model": f"models/{settings.embedding_model}",
        "content": {"parts": [{"text": text[:8000]}]},
    }
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            values = res.json()["embedding"]["values"]
            return [float(v) for v in values]
    except Exception:
        return None


async def embed_text(text: str) -> list[float]:
    if settings.embedding_provider == "gemini":
        gemini = await embed_text_gemini(text)
        if gemini:
            return gemini
    return embed_text_local(text)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b) or not a:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(y * y for y in b)) or 1.0
    return dot / (na * nb)
