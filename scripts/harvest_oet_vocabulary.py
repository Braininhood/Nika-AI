#!/usr/bin/env python3
"""Harvest OET healthcare phrases — CLI wrapper around knowledge_sync.

On production EC2 (systemd, no Docker), sync runs automatically on API startup.
See docs/04-AI-TUTOR/09-nika-knowledge-brain.md

Usage (from repo root):
  python scripts/harvest_oet_vocabulary.py
  python scripts/harvest_oet_vocabulary.py --enrich
  python scripts/harvest_oet_vocabulary.py --merge-glossary
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_DIR = ROOT / "apps" / "api"
sys.path.insert(0, str(API_DIR))

from app.services.knowledge_sync import (  # noqa: E402
    enrich_glossary_with_llm,
    merge_harvest_into_glossary,
    run_full_knowledge_sync,
    run_harvest_sync,
)


async def main() -> None:
    parser = argparse.ArgumentParser(description="Harvest OET vocabulary from app content")
    parser.add_argument("--enrich", action="store_true", help="Use LLM to enrich top missing terms")
    parser.add_argument("--merge-glossary", action="store_true", help="Add stub glossary entries for frequent terms")
    parser.add_argument("--enrich-limit", type=int, default=10)
    args = parser.parse_args()

    if args.enrich:
        summary = await run_full_knowledge_sync(enrich=True)
        print(f"Full sync: {summary}")
        return

    summary = run_harvest_sync()
    print(f"Harvest: {summary}")

    if args.merge_glossary:
        import json

        from app.services.knowledge_sync import PHRASES_PATH

        index = json.loads(PHRASES_PATH.read_text(encoding="utf-8"))
        stubs = merge_harvest_into_glossary(index)
        print(f"Glossary stubs added: {stubs}")

    print("Done. (API auto-syncs on restart — manual run optional.)")


if __name__ == "__main__":
    asyncio.run(main())
