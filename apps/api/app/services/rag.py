"""RAG chunk store — in-memory corpus with optional pgvector persistence."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from app.services.embeddings import cosine_similarity, embed_text

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CORPUS_PATH = DATA_DIR / "rag_corpus.json"

_chunks: list["RagChunk"] | None = None


@dataclass
class RagChunk:
    id: str
    title: str
    content: str
    skill: str
    profession: str
    source: str
    category: str
    tags: list[str]
    embedding: list[float] | None = None


def _load_corpus_file() -> list[dict]:
    if not CORPUS_PATH.is_file():
        return []
    return json.loads(CORPUS_PATH.read_text(encoding="utf-8"))


async def ensure_corpus_loaded() -> list[RagChunk]:
    global _chunks
    if _chunks is not None:
        return _chunks

    raw = _load_corpus_file()
    loaded: list[RagChunk] = []
    for row in raw:
        text = f"{row.get('title', '')}. {row.get('content', '')}"
        loaded.append(
            RagChunk(
                id=row["id"],
                title=row.get("title", ""),
                content=row.get("content", ""),
                skill=row.get("skill", "all"),
                profession=row.get("profession", "all"),
                source=row.get("source", "oet-coach"),
                category=row.get("category", "general"),
                tags=row.get("tags", []),
                embedding=await embed_text(text),
            )
        )
    _chunks = loaded
    return _chunks


def _keyword_score(query: str, chunk: RagChunk) -> float:
    tokens = set(re.findall(r"[a-z0-9]+", query.lower()))
    hay = f"{chunk.title} {chunk.content} {' '.join(chunk.tags)}".lower()
    if not tokens:
        return 0.0
    hits = sum(1 for t in tokens if t in hay)
    return hits / len(tokens)


@dataclass
class RetrievedChunk:
    id: str
    title: str
    excerpt: str
    source: str
    category: str
    score: float


async def retrieve_chunks(
    query: str,
    *,
    profession: str | None = None,
    skill: str | None = None,
    limit: int = 6,
) -> list[RetrievedChunk]:
    pg_results = await _retrieve_from_pgvector(
        query, profession=profession, skill=skill, limit=limit
    )
    if pg_results:
        return pg_results

    return await _retrieve_from_memory(
        query, profession=profession, skill=skill, limit=limit
    )


async def _retrieve_from_memory(
    query: str,
    *,
    profession: str | None = None,
    skill: str | None = None,
    limit: int = 6,
) -> list[RetrievedChunk]:
    corpus = await ensure_corpus_loaded()
    if not corpus:
        return []

    query_emb = await embed_text(query)
    scored: list[tuple[float, RagChunk]] = []

    for chunk in corpus:
        if profession and chunk.profession not in ("all", profession):
            continue
        if skill and chunk.skill not in ("all", skill):
            continue

        vec_score = cosine_similarity(query_emb, chunk.embedding or [])
        kw_score = _keyword_score(query, chunk)
        score = vec_score * 0.7 + kw_score * 0.3
        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    results: list[RetrievedChunk] = []
    for score, chunk in scored[:limit]:
        if score < 0.05:
            continue
        excerpt = chunk.content[:320] + ("…" if len(chunk.content) > 320 else "")
        results.append(
            RetrievedChunk(
                id=chunk.id,
                title=chunk.title,
                excerpt=excerpt,
                source=chunk.source,
                category=chunk.category,
                score=round(score, 4),
            )
        )
    return results


async def _retrieve_from_pgvector(
    query: str,
    *,
    profession: str | None = None,
    skill: str | None = None,
    limit: int = 6,
) -> list[RetrievedChunk]:
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine

        from app.core.config import settings
    except ImportError:
        return []

    if not settings.database_url:
        return []

    query_emb = await embed_text(query)
    vec = "[" + ",".join(f"{v:.6f}" for v in query_emb) + "]"

    filters = ["TRUE"]
    params: dict = {"vec": vec, "limit": limit}
    if profession:
        filters.append("(profession = :profession OR profession = 'all')")
        params["profession"] = profession
    if skill:
        filters.append("(skill = :skill OR skill = 'all')")
        params["skill"] = skill

    sql = f"""
        SELECT id, title, content, source, category,
               1 - (embedding <=> :vec::vector) AS score
        FROM rag_chunks
        WHERE {' AND '.join(filters)}
        ORDER BY embedding <=> :vec::vector
        LIMIT :limit
    """

    engine = create_async_engine(settings.database_url)
    try:
        async with engine.connect() as conn:
            rows = (await conn.execute(text(sql), params)).mappings().all()
    except Exception:
        await engine.dispose()
        return []
    await engine.dispose()

    if not rows:
        return []

    results: list[RetrievedChunk] = []
    for row in rows:
        content = row["content"] or ""
        excerpt = content[:320] + ("…" if len(content) > 320 else "")
        results.append(
            RetrievedChunk(
                id=row["id"],
                title=row["title"] or row["id"],
                excerpt=excerpt,
                source=row["source"] or "pgvector",
                category=row["category"] or "ingested",
                score=round(float(row["score"] or 0), 4),
            )
        )
    return results


def format_context(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return ""
    parts = []
    for c in chunks:
        parts.append(f"[{c.source}] {c.title}: {c.excerpt}")
    return "\n\n".join(parts)
