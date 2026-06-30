"""Transactional email via Resend."""

from __future__ import annotations

import httpx
from fastapi import HTTPException

from app.core.config import settings


async def send_email(
    *,
    to: str,
    subject: str,
    html: str,
    from_address: str = "noreply",
    reply_to: str | None = None,
) -> str:
    if not settings.resend_api_key:
        raise HTTPException(status_code=503, detail="Email delivery is not configured")

    if from_address == "support":
        sender = settings.email_from_support
        reply = reply_to or settings.email_reply_to
    else:
        sender = settings.email_from_noreply
        reply = reply_to or settings.email_reply_to

    payload = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if reply:
        payload["reply_to"] = reply

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code >= 400:
        detail = "Could not send email"
        try:
            body = response.json()
            if isinstance(body, dict) and body.get("message"):
                detail = str(body["message"])[:200]
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    body = response.json()
    message_id = body.get("id") if isinstance(body, dict) else None
    return str(message_id) if message_id else "sent"
