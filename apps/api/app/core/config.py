"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _resolve_env_files() -> tuple[str | Path, ...] | None:
    """Find .env for local monorepo root or Docker /app — skip if missing."""
    here = Path(__file__).resolve()
    found: list[Path] = []

    for depth in (4, 3, 2):
        try:
            candidate = here.parents[depth] / ".env"
            if candidate.is_file():
                found.append(candidate)
                break
        except IndexError:
            continue

    local = Path(".env")
    if local.is_file() and local not in found:
        found.append(local)

    return tuple(found) if found else None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_resolve_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    database_url: str = ""  # optional — Supabase direct Postgres or local Docker; empty = in-memory RAG only
    redis_url: str = "redis://localhost:6379/0"

    gemini_api_key: str = ""
    groq_api_key: str = ""
    deepl_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"
    ollama_enabled: bool = True
    embedding_provider: str = "local"  # local | gemini
    embedding_model: str = "text-embedding-004"
    chat_model: str = "gemini-2.0-flash"
    groq_model: str = "llama-3.3-70b-versatile"
    ai_daily_quota: int = 15
    environment: str = "development"  # development | production
    nika_auto_sync: bool = True  # harvest + reload knowledge on API startup
    rag_auto_sync: bool = True  # rag_corpus.json → rag_chunks on API startup when DATABASE_URL set
    nika_auto_enrich: bool = True  # background LLM glossary enrich when API keys available
    nika_enrich_limit: int = 8  # max new terms per startup enrich cycle
    nika_merge_glossary_stubs: bool = False  # stub entries; prefer --enrich / auto-enrich
    nika_merge_min_occurrences: int = 8  # if stubs enabled, only very frequent terms
    api_rate_limit_per_minute: int = 120
    data_retention_days: int = 365

    admin_emails: str = ""  # deprecated — use Supabase app_metadata.role
    content_packs_public_url: str = ""
    content_packs_bucket: str = "content-packs"

    @property
    def admin_email_list(self) -> list[str]:
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]

    @property
    def content_packs_public_url_resolved(self) -> str:
        if self.content_packs_public_url:
            return self.content_packs_public_url.rstrip("/")
        if self.supabase_url:
            return (
                f"{self.supabase_url.rstrip('/')}/storage/v1/object/public/"
                f"{self.content_packs_bucket}"
            )
        return ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() == "production"


settings = Settings()
