#!/usr/bin/env python3
"""Copy API healthcare glossary into web quiz pool. Prefer: pnpm sync:glossary (Node, runs on prebuild)."""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE_SCRIPT = ROOT / "apps" / "web" / "scripts" / "sync-glossary-quiz.mjs"


def main() -> None:
    if NODE_SCRIPT.is_file():
        subprocess.run(["node", str(NODE_SCRIPT)], cwd=ROOT / "apps" / "web", check=True)
        return

    src = ROOT / "apps" / "api" / "app" / "data" / "healthcare_vocabulary.json"
    dest = ROOT / "apps" / "web" / "src" / "content" / "assessment" / "data" / "healthcare_vocabulary.json"
    if not src.is_file():
        raise SystemExit(f"Missing source glossary: {src}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    data = json.loads(dest.read_text(encoding="utf-8"))
    print(f"Synced {len(data)} glossary entries to {dest.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
