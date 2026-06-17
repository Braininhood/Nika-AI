"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.rate_limit import RateLimitMiddleware
from app.services.ollama_status import get_ollama_status
from app.routers import admin, admin_content, ai, auth, content, course, diagnostic, mock_exam, plan, profile, progress, readiness, vocabulary

_docs = None if settings.is_production else "/docs"
_openapi = None if settings.is_production else "/openapi.json"

app = FastAPI(
    title="OET Coach API",
    version="0.1.0",
    description="Backend for OET Coach — AI, sync, and progress.",
    docs_url=_docs,
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=_openapi,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key", "Accept"],
)
app.add_middleware(RateLimitMiddleware)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(diagnostic.router, prefix="/api/v1/diagnostic", tags=["diagnostic"])
app.include_router(plan.router, prefix="/api/v1/plan", tags=["plan"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["progress"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(readiness.router, prefix="/api/v1/readiness", tags=["readiness"])
app.include_router(mock_exam.router, prefix="/api/v1/mock", tags=["mock"])
app.include_router(course.router, prefix="/api/v1/course", tags=["course"])
app.include_router(vocabulary.router, prefix="/api/v1/vocabulary", tags=["vocabulary"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(admin_content.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(content.router, prefix="/api/v1/content", tags=["content"])


@app.exception_handler(Exception)
async def generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    if settings.is_production:
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/health")
async def health(request: Request) -> dict:
    client_host = request.client.host if request.client else ""
    local_only = client_host in ("127.0.0.1", "::1", "localhost")

    if settings.is_production and not local_only:
        return {"status": "ok"}

    ollama = await get_ollama_status()
    return {
        "status": "ok",
        "service": "nika-ai-api",
        "environment": settings.environment,
        "llm": {
            "gemini_configured": bool(settings.gemini_api_key),
            "groq_configured": bool(settings.groq_api_key),
            "ollama": ollama,
        },
        "deepl_configured": bool(settings.deepl_api_key),
    }
