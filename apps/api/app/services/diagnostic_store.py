"""Server-side diagnostic session storage."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.supabase_rest import supabase_rest


async def start_session(user_id: str) -> str:
    session_id = str(uuid4())
    await supabase_rest(
        "POST",
        "diagnostic_sessions",
        json={
            "id": session_id,
            "user_id": user_id,
            "answers": [],
            "status": "in_progress",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return session_id


async def append_answer(session_id: str, user_id: str, answer: dict) -> dict:
    rows = await supabase_rest(
        "GET",
        "diagnostic_sessions",
        params={"id": f"eq.{session_id}", "user_id": f"eq.{user_id}", "select": "*"},
    )
    if not rows:
        return {"accepted": False, "error": "Session not found"}
    row = rows[0]
    answers = list(row.get("answers") or [])
    answers.append(answer)
    await supabase_rest(
        "PATCH",
        "diagnostic_sessions",
        json={
            "answers": answers,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        params={"id": f"eq.{session_id}"},
    )
    return {"accepted": True, "answerCount": len(answers)}


async def load_session(session_id: str, user_id: str) -> dict | None:
    rows = await supabase_rest(
        "GET",
        "diagnostic_sessions",
        params={"id": f"eq.{session_id}", "user_id": f"eq.{user_id}", "select": "*"},
    )
    if not rows:
        return None
    return rows[0]


async def complete_session(session_id: str, user_id: str) -> dict | None:
    session = await load_session(session_id, user_id)
    if not session:
        return None
    await supabase_rest(
        "PATCH",
        "diagnostic_sessions",
        json={
            "status": "completed",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        params={"id": f"eq.{session_id}"},
    )
    return session
