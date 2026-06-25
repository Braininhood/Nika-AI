#!/usr/bin/env python3
"""Ingest OET Coach docs into pgvector for Nika RAG.

Usage (from repo root):
  python scripts/ingest_rag.py
  python scripts/ingest_rag.py --paths docs/04-AI-TUTOR docs/01-OET-RESEARCH

Note: OET vocabulary / healthcare phrases sync automatically on API startup
(see docs/04-AI-TUTOR/09-nika-knowledge-brain.md). ingest_rag is for doc embeddings only.

Optional manual harvest (dev/CI):
  python scripts/harvest_oet_vocabulary.py
"""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_DIR = ROOT / "apps" / "api"
sys.path.insert(0, str(API_DIR))

from app.services.embeddings import embed_text  # noqa: E402

DEFAULT_PATHS = [
    ROOT / "docs" / "04-AI-TUTOR",
    ROOT / "docs" / "01-OET-RESEARCH",
]
CORPUS_PATH = API_DIR / "app" / "data" / "rag_corpus.json"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80


def _split_markdown(text: str) -> list[str]:
    sections: list[str] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.startswith("#") and current:
            sections.append("\n".join(current).strip())
            current = [line]
        else:
            current.append(line)
    if current:
        sections.append("\n".join(current).strip())
    return [s for s in sections if len(s) > 40]


def _chunk_text(text: str) -> list[str]:
    words = text.split()
    if len(words) <= CHUNK_SIZE:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = max(0, end - CHUNK_OVERLAP)
    return chunks


def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]


def load_markdown_chunks(paths: list[Path]) -> list[dict]:
    rows: list[dict] = []
    for base in paths:
        if not base.is_dir():
            continue
        for md in sorted(base.rglob("*.md")):
            if "official-pdf" in md.name.lower():
                continue
            text = md.read_text(encoding="utf-8", errors="ignore")
            for section in _split_markdown(text):
                title_match = re.search(r"^#+\s+(.+)", section, re.M)
                title = title_match.group(1).strip() if title_match else md.stem
                for i, chunk in enumerate(_chunk_text(section)):
                    rows.append(
                        {
                            "id": f"doc-{_slug(md.stem)}-{i}",
                            "title": title,
                            "content": chunk,
                            "skill": "all",
                            "profession": "all",
                            "source": f"docs/{md.relative_to(ROOT).as_posix()}",
                            "category": "oet",
                            "tags": ["ingested", md.parent.name],
                        }
                    )
    return rows


async def embed_corpus(rows: list[dict]) -> list[dict]:
    out: list[dict] = []
    for row in rows:
        text = f"{row['title']}. {row['content']}"
        embedding = await embed_text(text)
        out.append({**row, "embedding": embedding})
    return out


async def write_pgvector(rows: list[dict], database_url: str) -> int:
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
    except ImportError:
        print("SQLAlchemy not available — skipping pgvector write")
        return 0

    engine = create_async_engine(database_url)
    ddl = """
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      skill TEXT DEFAULT 'all',
      profession TEXT DEFAULT 'all',
      source TEXT,
      category TEXT,
      tags JSONB DEFAULT '[]',
      embedding vector(384)
    );
    """
    inserted = 0
    async with engine.begin() as conn:
        for stmt in ddl.strip().split(";"):
            s = stmt.strip()
            if s:
                await conn.execute(text(s))
        await conn.execute(text("DELETE FROM rag_chunks"))
        for row in rows:
            emb = row.get("embedding") or await embed_text(f"{row['title']}. {row['content']}")
            vec = "[" + ",".join(f"{v:.6f}" for v in emb) + "]"
            await conn.execute(
                text(
                    """
                    INSERT INTO rag_chunks (id, title, content, skill, profession, source, category, tags, embedding)
                    VALUES (:id, :title, :content, :skill, :profession, :source, :category, :tags::jsonb, :embedding::vector)
                    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
                    """
                ),
                {
                    "id": row["id"],
                    "title": row["title"],
                    "content": row["content"],
                    "skill": row.get("skill", "all"),
                    "profession": row.get("profession", "all"),
                    "source": row.get("source", ""),
                    "category": row.get("category", ""),
                    "tags": json.dumps(row.get("tags", [])),
                    "embedding": vec,
                },
            )
            inserted += 1
    await engine.dispose()
    return inserted


async def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest RAG corpus for Nika tutor")
    parser.add_argument("--paths", nargs="*", type=Path, default=DEFAULT_PATHS)
    parser.add_argument("--no-docs", action="store_true", help="Skip markdown docs")
    parser.add_argument("--database-url", default=None)
    args = parser.parse_args()

    base_corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
    doc_rows = [] if args.no_docs else load_markdown_chunks(args.paths)

    # Deduplicate by id
    seen: set[str] = set()
    merged: list[dict] = []
    for row in base_corpus + doc_rows:
        if row["id"] in seen:
            continue
        seen.add(row["id"])
        merged.append(row)

    print(f"Corpus: {len(base_corpus)} base + {len(doc_rows)} doc chunks = {len(merged)} total")

    embedded = await embed_corpus(merged)
    out_path = API_DIR / "app" / "data" / "rag_corpus_embedded.json"
    slim = [{k: v for k, v in r.items() if k != "embedding"} for r in embedded]
    out_path.write_text(json.dumps(slim, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}")

    db_url = args.database_url
    if not db_url:
        try:
            from app.core.config import settings

            db_url = settings.database_url
        except Exception:
            db_url = None

    if db_url:
        try:
            count = await write_pgvector(embedded, db_url)
            print(f"pgvector: {count} rows in rag_chunks")
        except Exception as exc:
            print(f"pgvector skipped ({exc.__class__.__name__}) — in-memory corpus still updated")
    else:
        print("No DATABASE_URL — in-memory corpus only (rag_corpus.json)")

    print("Done. Restart API to reload corpus.")


if __name__ == "__main__":
    asyncio.run(main())
