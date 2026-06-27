"""Optional LLM polish for writing/speaking feedback — Gemini → Groq → keep rule-based."""

from __future__ import annotations

from app.services.llm import generate_chat_reply


async def enrich_writing_feedback(base: dict, payload: dict) -> dict:
    letter = (payload.get("letter_text") or "").strip()
    if len(letter) < 40:
        return base

    scores = base.get("criterion_scores") or {}
    weak = [k for k, v in scores.items() if v < 0.6]
    ctx = payload.get("scenario_context") if isinstance(payload.get("scenario_context"), dict) else {}

    system = (
        "You are an OET Writing coach. Analyse THIS specific letter against the case task. "
        "Reply with exactly two sections:\n"
        "GOOD: 2-3 bullet points on what the candidate did well (reference their actual wording).\n"
        "IMPROVE: 2-3 bullet points on what to fix (reference missing case facts if any).\n"
        "Do not invent clinical facts. Under 120 words total. No greetings."
    )
    context = (
        f"Profession: {payload.get('profession', 'healthcare')}\n"
        f"Scenario: {ctx.get('title', payload.get('scenario_id', 'unknown'))}\n"
        f"Task: {ctx.get('instruction', '')}\n"
        f"Must include from notes: {', '.join(ctx.get('must_include') or [])}\n"
        f"Should omit: {', '.join(ctx.get('should_omit') or [])}\n"
        f"Indicative grade: {base.get('grade_estimate')}\n"
        f"Weak criteria: {', '.join(weak) or 'none'}\n"
        f"Scores: {scores}\n"
        f"Letter:\n{letter[:2500]}"
    )
    reply, provider = await generate_chat_reply(
        system=system,
        user_message="Give specific good vs improve feedback for this OET letter draft.",
        context=context,
        temperature=0.35,
    )
    if provider != "grounded_rules":
        base = {**base, "feedback": reply, "feedback_provider": provider}
    return base


async def enrich_speaking_feedback(base: dict, payload: dict) -> dict:
    transcript = (payload.get("transcript") or "").strip()
    if len(transcript) < 30:
        return base

    system = (
        "You are an OET Speaking coach. Reply in 2–4 short bullet points. "
        "Focus on ICE, structure, and clinical communication. "
        "Under 100 words. No greetings."
    )
    context = (
        f"Profession: {payload.get('profession', 'healthcare')}\n"
        f"Grade hint: {base.get('grade_estimate')}\n"
        f"Weak tags: {', '.join(base.get('weak_tags') or [])}\n"
        f"Transcript excerpt:\n{transcript[:2000]}"
    )
    reply, provider = await generate_chat_reply(
        system=system,
        user_message="Give specific speaking improvement advice for this role-play.",
        context=context,
        temperature=0.3,
    )
    if provider != "grounded_rules":
        base = {**base, "feedback": reply, "feedback_provider": provider}
    return base
