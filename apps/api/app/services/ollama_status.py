"""Ollama install/runtime detection — no Docker."""

from __future__ import annotations

import shutil
import subprocess

import httpx

from app.core.config import settings


async def ollama_http_ok(base_url: str | None = None) -> bool:
    url = (base_url or settings.ollama_base_url or "").rstrip("/")
    if not url:
        return False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(f"{url}/api/tags")
            return res.status_code == 200
    except Exception:
        return False


def ollama_cli_installed() -> bool:
    return shutil.which("ollama") is not None


def ollama_model_present(model: str | None = None) -> bool:
    target = (model or settings.ollama_model or "").strip()
    if not target or not ollama_cli_installed():
        return False
    try:
        proc = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
        )
        if proc.returncode != 0:
            return False
        base = target.split(":")[0]
        return any(base in line for line in proc.stdout.splitlines())
    except Exception:
        return False


async def get_ollama_status() -> dict:
    """Status for /health and setup scripts."""
    cli = ollama_cli_installed()
    running = await ollama_http_ok()
    model = settings.ollama_model
    has_model = ollama_model_present(model) if cli else False
    ready = running and has_model

    install_hint = "pnpm setup:ollama"
    if not cli:
        note = f"Ollama CLI not found — run `{install_hint}` (Windows/Linux/macOS, no Docker)."
    elif not running:
        note = "Ollama installed but server not running — open Ollama app (Windows/macOS) or run `ollama serve`."
    elif not has_model:
        note = f"Pull model: `ollama pull {model}` or `{install_hint}`."
    else:
        note = "Ready — used when Gemini/Groq unavailable."

    return {
        "enabled": settings.ollama_enabled,
        "base_url": settings.ollama_base_url,
        "model": model,
        "cli_installed": cli,
        "server_running": running,
        "model_pulled": has_model,
        "ready": ready and settings.ollama_enabled,
        "note": note,
    }


async def is_ollama_ready() -> bool:
    if not settings.ollama_enabled:
        return False
    status = await get_ollama_status()
    return bool(status["ready"])
