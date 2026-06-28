"""Auto-sync rag_corpus.json → Postgres rag_chunks on API startup (with in-memory fallback)."""

from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path

from app.core.config import settings
from app.services.embeddings import embed_text
from app.services.rag import CORPUS_PATH, reload_rag_corpus

logger = logging.getLogger(__name__)

SYNC_STATE_PATH = CORPUS_PATH.parent / ".rag_sync_state.json"


def _corpus_fingerprint() -> str:
    if not CORPUS_PATH.is_file():
        return ""
    raw = CORPUS_PATH.read_bytes()
    return hashlib.sha256(raw).hexdigest()


def _load_sync_state() -> dict:
    if not SYNC_STATE_PATH.is_file():
        return {}
    try:
        return json.loads(SYNC_STATE_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _save_sync_state(state: dict) -> None:
    SYNC_STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _load_corpus_rows() -> list[dict]:
    if not CORPUS_PATH.is_file():
        return []
    return json.loads(CORPUS_PATH.read_text(encoding="utf-8"))


async def _postgres_reachable(database_url: str, *, timeout_sec: float = 2.0) -> bool:
    """Quick probe — avoid noisy sync errors when Docker/Supabase Postgres is not running."""
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ImportError:
        return False

    engine = create_async_engine(
        database_url,
        connect_args={"timeout": timeout_sec} if "asyncpg" in database_url else {},
    )
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
    finally:
        await engine.dispose()


async def _pg_chunk_count(database_url: str) -> int:
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ImportError:
        return 0

    engine = create_async_engine(database_url)
    try:
        async with engine.connect() as conn:
            row = await conn.execute(text("SELECT COUNT(*) AS n FROM rag_chunks"))
            return int(row.scalar() or 0)
    except Exception:
        return 0
    finally:
        await engine.dispose()


async def upsert_rag_chunks_to_pg(rows: list[dict], database_url: str) -> int:
    """Upsert corpus rows into rag_chunks (384-dim embeddings)."""
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ImportError:
        return 0

    engine = create_async_engine(database_url)
    upserted = 0
    async with engine.begin() as conn:
        for row in rows:
            text_for_embed = f"{row.get('title', '')}. {row.get('content', '')}"
            emb = row.get("embedding")
            if not emb:
                emb = await embed_text(text_for_embed)
            vec = "[" + ",".join(f"{v:.6f}" for v in emb) + "]"
            await conn.execute(
                text(
                    """
                    INSERT INTO rag_chunks (
                      id, title, content, skill, profession, source, category, tags, embedding, updated_at
                    )
                    VALUES (
                      :id, :title, :content, :skill, :profession, :source, :category, :tags::jsonb,
                      :embedding::vector, NOW()
                    )
                    ON CONFLICT (id) DO UPDATE SET
                      title = EXCLUDED.title,
                      content = EXCLUDED.content,
                      skill = EXCLUDED.skill,
                      profession = EXCLUDED.profession,
                      source = EXCLUDED.source,
                      category = EXCLUDED.category,
                      tags = EXCLUDED.tags,
                      embedding = EXCLUDED.embedding,
                      updated_at = NOW()
                    """
                ),
                {
                    "id": row["id"],
                    "title": row.get("title", ""),
                    "content": row.get("content", ""),
                    "skill": row.get("skill", "all"),
                    "profession": row.get("profession", "all"),
                    "source": row.get("source", "oet-coach"),
                    "category": row.get("category", "general"),
                    "tags": json.dumps(row.get("tags", [])),
                    "embedding": vec,
                },
            )
            upserted += 1
    await engine.dispose()
    return upserted


async def startup_rag_sync() -> dict:
    """Sync rag_corpus.json to Postgres when DATABASE_URL is set. Always reloads in-memory corpus."""
    reload_rag_corpus()
    summary: dict = {"corpus_rows": 0, "pg_upserted": 0, "skipped": False, "reason": ""}

    rows = _load_corpus_rows()
    summary["corpus_rows"] = len(rows)
    if not rows:
        summary["reason"] = "no_corpus_file"
        return summary

    if not settings.rag_auto_sync:
        summary["skipped"] = True
        summary["reason"] = "rag_auto_sync_disabled"
        return summary

    db_url = settings.database_url.strip()
    if not db_url:
        summary["skipped"] = True
        summary["reason"] = "no_database_url"
        logger.debug("RAG pg sync skipped — DATABASE_URL not set; in-memory rag_corpus.json only")
        return summary

    if not await _postgres_reachable(db_url):
        summary["skipped"] = True
        summary["reason"] = "postgres_unavailable"
        logger.info(
            "RAG pg sync skipped — cannot connect to DATABASE_URL (in-memory rag_corpus.json is active). "
            "For Postgres: start Docker (docker compose up -d), set Supabase DATABASE_URL on production, "
            "or set RAG_AUTO_SYNC=false in .env."
        )
        return summary

    fingerprint = _corpus_fingerprint()
    state = _load_sync_state()
    pg_count = await _pg_chunk_count(db_url)

    if state.get("fingerprint") == fingerprint and pg_count >= len(rows):
        summary["skipped"] = True
        summary["reason"] = "already_synced"
        summary["pg_count"] = pg_count
        logger.info("RAG corpus unchanged — %s chunks in pg", pg_count)
        return summary

    try:
        upserted = await upsert_rag_chunks_to_pg(rows, db_url)
        summary["pg_upserted"] = upserted
        summary["pg_count"] = upserted
        _save_sync_state({"fingerprint": fingerprint, "rows": upserted})
        logger.info("RAG sync: upserted %s chunks to rag_chunks", upserted)
    except Exception as exc:
        summary["skipped"] = True
        summary["reason"] = f"pg_error:{exc.__class__.__name__}"
        logger.warning("RAG pg sync failed — using in-memory rag_corpus.json only: %s", exc)

    return summary


def rag_sync_stats() -> dict:
    state = _load_sync_state()
    rows = _load_corpus_rows()
    return {
        "corpus_rows": len(rows),
        "last_fingerprint": (state.get("fingerprint") or "")[:12],
        "pg_rows_last_sync": state.get("rows", 0),
        "auto_sync": settings.rag_auto_sync,
    }
