"""Live speaking interlocutor — rule-based + optional LLM (Gemini/Groq). Free tier: rules always work."""

from __future__ import annotations

import re

from app.services.llm import generate_chat_reply


def _last_user(messages: list[dict]) -> str:
    for m in reversed(messages):
        if m.get("role") == "user":
            return (m.get("text") or "").lower()
    return ""


def _user_turns(messages: list[dict]) -> int:
    return sum(1 for m in messages if m.get("role") == "user")


def rule_based_interlocutor(payload: dict) -> str:
    messages = payload.get("messages") or []
    concerns: list[str] = payload.get("patient_concerns") or []
    knowledge = (payload.get("patient_knowledge") or "").strip()
    user_text = _last_user(messages)
    turn = _user_turns(messages)

    if not user_text.strip():
        return "Sorry — could you say that again?"

    if turn == 1 and re.search(r"\b(concern|worr|afraid|feel)\b", user_text):
        return concerns[0] if concerns else "I'm mostly worried about what happens next."

    if re.search(r"\b(what do you know|understand|explain|tell me about)\b", user_text):
        return knowledge or "I don't know much yet — that's why I'm here."

    if re.search(r"\b(concern|worr|afraid|anxious)\b", user_text):
        idx = min(turn - 1, len(concerns) - 1) if concerns else 0
        return concerns[idx] if concerns else "I'm not sure what to expect."

    if re.search(r"\b(expect|hope|plan|what will|help you)\b", user_text):
        return "I'd like to know what I should do at home and when to come back if things get worse."

    if re.search(r"\b(recommend|advise|should|important|refer)\b", user_text) and not re.search(
        r"\b(does that make sense|any questions)\b", user_text
    ):
        return "Okay… could you explain that in simpler terms? I want to make sure I understand."

    if re.search(r"\b(does that make sense|tell me back|any questions)\b", user_text):
        return "Yes — I'll do that. Thank you for explaining."

    fallbacks = [
        "I see. Can you tell me more about that?",
        "Is there anything I need to watch out for?",
        "What should I do if it doesn't improve?",
        "Thank you — that helps.",
    ]
    return fallbacks[(turn - 1) % len(fallbacks)]


async def next_interlocutor_line(payload: dict) -> dict:
    base = rule_based_interlocutor(payload)
    messages = payload.get("messages") or []
    if len(messages) < 2:
        return {"line": base, "source": "rule"}

    interlocutor = payload.get("interlocutor_role") or "Patient"
    details = (payload.get("patient_details") or "")[:400]
    concerns = ", ".join((payload.get("patient_concerns") or [])[:3])

    history = "\n".join(
        f"{'Professional' if m.get('role') == 'user' else interlocutor}: {m.get('text', '')[:200]}"
        for m in messages[-6:]
    )

    system = (
        f"You are the {interlocutor} in an OET Speaking role-play. "
        "Reply in 1–3 short spoken sentences as a real patient or carer would. "
        "Stay in character. Use plain English. Do not give medical advice. "
        "Do not break character or mention OET."
    )
    context = f"Scenario: {details}\nConcerns: {concerns}\n\nConversation:\n{history}"
    reply, provider = await generate_chat_reply(
        system=system,
        user_message="Reply as the patient/carer to the healthcare professional's last turn.",
        context=context,
        temperature=0.5,
    )

    if provider != "grounded_rules" and reply.strip():
        line = reply.strip().split("\n")[0].strip('"')
        if len(line) > 10:
            return {"line": line[:400], "source": "llm"}

    return {"line": base, "source": "rule"}
