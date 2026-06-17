"""Resolve canonical URLs for Nika RAG source citations."""

from __future__ import annotations

CHUNK_URLS: dict[str, str] = {
    "reg-gphc": "https://www.pharmacyregulation.org/",
    "reg-gmc": "https://www.gmc-uk.org/",
    "reg-nmc": "https://www.nmc.org.uk/",
    "reg-hcpc": "https://www.hcpc-uk.org/",
    "reg-ahpra": "https://www.ahpra.gov.au/",
    "oet-sample-tests": "https://oet.com",
    "oet-overview": "https://oet.com/ready",
    "platform-import": "/listening/import",
    "platform-mock": "/mock",
    "platform-study-plan": "/dashboard",
    "platform-flashcards": "/reading/flashcards",
}

SOURCE_FIELD_URLS: dict[str, str] = {
    "oet.com": "https://oet.com",
    "pharmacyregulation.org": "https://www.pharmacyregulation.org/",
    "gmc-uk.org": "https://www.gmc-uk.org/",
    "nmc.org.uk": "https://www.nmc.org.uk/",
    "hcpc-uk.org": "https://www.hcpc-uk.org/",
    "ahpra.gov.au": "https://www.ahpra.gov.au/",
    "oet-coach-platform": "/materials",
    "oet-coach-docs": "https://oet.com/ready",
}


def resolve_source_url(*, chunk_id: str, source: str, category: str) -> str | None:
    if chunk_id in CHUNK_URLS:
        return CHUNK_URLS[chunk_id]
    if source in SOURCE_FIELD_URLS:
        return SOURCE_FIELD_URLS[source]
    if source and "." in source and " " not in source and not source.startswith("oet-coach"):
        host = source if source.startswith("http") else f"https://{source.lstrip('www.')}"
        return host if host.startswith("http") else f"https://{source}"
    if category == "profession":
        return "https://oet.com/ready"
    return None
