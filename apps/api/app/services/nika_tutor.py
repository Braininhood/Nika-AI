"""Nika tutor — grounded RAG chat with personalization and strict topic scope."""

from __future__ import annotations

from app.services.llm import generate_chat_reply
from app.services.nika_guard import REFUSAL_MESSAGE, TopicVerdict, classify_question
from app.services.generate_assessment import generate_assessment, is_assessment_request
from app.services.practice_tasks import build_practice_tasks, is_practice_task_request
from app.services.vocabulary_chat import handle_vocabulary_chat, is_vocabulary_request
from app.services.quota import QuotaStatus, check_and_increment_quota, peek_quota
from app.services.rag import format_context, retrieve_chunks
from app.services.source_urls import resolve_source_url
from app.services.study_advice import study_context_for_message

NIKA_SYSTEM = """You are Nika, the OET Coach AI study companion — warm, professional, concise.

SCOPE (strict):
- OET exam format, timing, criteria, and preparation for Listening, Reading, Writing, Speaking
- Official healthcare regulator registration (GPhC, GMC, NMC, AHPRA, etc.) — cite official sources only
- How to use OET Coach (imports, mocks, study plan, flashcards)
- Personalized study advice based on the learner's skill map and progress

NEVER:
- Answer personal life, relationship, entertainment, or general knowledge questions
- Give clinical advice, diagnoses, or prescriptions for real patients
- Invent OET rules or regulator requirements not in CONTEXT
- Speak about topics outside OET preparation and healthcare registration

STYLE:
- Clear English, 2–4 short paragraphs max
- Reference the learner's weak areas when USER PROGRESS is provided
- End with one concrete next step (lesson, practice, or official link)
- If CONTEXT lacks the answer, say you don't know and point to oet.com/ready
- Give short UI steps only (e.g. "Study → Listening → Import → choose files → Import")
- Never mention internal technology (Supabase, OPFS, databases, RAG, layers, storage backends)
- Never paste long knowledge-base summaries — summarise in plain study advice"""


def _format_user_progress(skill_map: dict | None) -> str:
    if not skill_map:
        return "No skill map provided — give general OET guidance."

    lines = []
    priority = skill_map.get("priority") or []
    if priority:
        lines.append(f"Priority skill: {priority[0]}")

    diagnostic = skill_map.get("diagnostic") or {}
    for skill, diag in diagnostic.items():
        if not isinstance(diag, dict):
            continue
        gap = diag.get("gap", 0)
        if gap <= 0:
            continue
        tags = diag.get("weakTags") or []
        tag_text = ", ".join(tags[:3]) if tags else "foundation"
        lines.append(f"{skill}: gap {gap}, weak areas: {tag_text}")

    grades = skill_map.get("targetGrades")
    if grades:
        lines.append(
            f"Target grades — L {grades.get('listening')} · R {grades.get('reading')} · "
            f"W {grades.get('writing')} · S {grades.get('speaking')}"
        )

    return "\n".join(lines) if lines else "Skill map present but no major gaps flagged."


def _personalized_opener(skill_map: dict | None, category: str | None) -> str | None:
    if not skill_map or category != "personal_study":
        return None
    priority = (skill_map.get("priority") or ["writing"])[0]
    diag = (skill_map.get("diagnostic") or {}).get(priority, {})
    tags = diag.get("weakTags") or []
    if tags:
        tag = tags[0].split(":", 1)[-1].replace("-", " ")
        return f"Looking at your progress, {priority} — especially {tag} — is your main focus right now."
    return None


async def answer_nika_chat(
    *,
    user_id: str,
    message: str,
    profession: str | None = None,
    regulator: str | None = None,
    country: str | None = None,
    skill_map: dict | None = None,
    skill_focus: str | None = None,
    native_language: str | None = None,
    exclude_ids: list[str] | None = None,
    skip_quota: bool = False,
) -> dict:
    if skip_quota:
        quota: QuotaStatus = await peek_quota(user_id)
    else:
        quota = await check_and_increment_quota(user_id)
        if not quota.allowed:
            return {
                "reply": (
                    f"You've used today's AI tutor quota ({quota.limit} messages). "
                    "Try again tomorrow, or browse Materials for official OET guides."
                ),
                "refused": True,
                "reason": "quota_exceeded",
                "sources": [],
                "provider": "quota",
                "quota": quota.__dict__,
            }

    # Vocabulary explain / translate — before strict guard ("what does X mean" has no "OET" keyword)
    if is_vocabulary_request(message):
        vocab = await handle_vocabulary_chat(
            message=message,
            profession=profession,
            native_language=native_language,
        )
        if vocab:
            vocab["quota"] = quota.__dict__
            return vocab

    # Nika-generated assessment — before guard (quiz requests often lack OET keywords)
    if is_assessment_request(message):
        assessment = await generate_assessment(
            message,
            profession=profession,
            skill_map=skill_map,
            exclude_ids=exclude_ids or [],
        )
        return {
            "reply": assessment["reply"],
            "refused": False,
            "reason": "assessment_generated",
            "category": "assessment",
            "tasks": [
                {
                    "skill": assessment["skill"],
                    "title": assessment["title"],
                    "route": assessment["route"],
                    "durationMinutes": max(5, len(assessment["questions"]) * 2),
                }
            ],
            "assessment": {
                "id": assessment["id"],
                "title": assessment["title"],
                "skill": assessment["skill"],
                "questions": assessment["questions"],
            },
            "sources": [{"id": "assessment-pool", "title": "Nika assessment", "source": "oet-coach"}],
            "provider": assessment["provider"],
            "quota": quota.__dict__,
        }

    guard = classify_question(message)
    if guard.verdict == TopicVerdict.REFUSED:
        return {
            "reply": REFUSAL_MESSAGE,
            "refused": True,
            "reason": guard.reason,
            "sources": [],
            "provider": "guard",
            "quota": quota.__dict__,
        }

    # Rule-based practice tasks — no LLM (uses profession catalog + skill map)
    if is_practice_task_request(message) or guard.category == "practice_tasks":
        practice = build_practice_tasks(
            message,
            profession=profession,
            country=country,
            skill_map=skill_map,
        )
        return {
            "reply": practice["reply"],
            "refused": False,
            "reason": "practice_tasks",
            "category": "practice_tasks",
            "tasks": practice["tasks"],
            "sources": [{"id": "content-catalog", "title": "OET Coach practice", "source": "oet-coach"}],
            "provider": practice["provider"],
            "quota": quota.__dict__,
        }

    # Enrich query for regulator-specific retrieval
    search_query = message
    if regulator:
        search_query = f"{message} {regulator} registration OET"
    elif profession:
        search_query = f"{message} {profession} OET"

    chunks = await retrieve_chunks(
        search_query,
        profession=profession,
        skill=skill_focus,
        limit=6,
    )
    context = format_context(chunks)
    progress = _format_user_progress(skill_map)
    plan_context = study_context_for_message(
        message,
        skill_map,
        profession=profession,
        country=country,
    )
    full_context = f"USER PROGRESS:\n{progress}\n\nKNOWLEDGE:\n{context}"
    if plan_context:
        full_context += f"\n\n{plan_context}"
    if regulator:
        full_context += f"\n\nTARGET REGULATOR: {regulator}"
    if country:
        full_context += f"\nDESTINATION: {country}"

    reply, provider = await generate_chat_reply(
        system=NIKA_SYSTEM,
        user_message=message,
        context=full_context,
        temperature=0.4,
    )

    opener = _personalized_opener(skill_map, guard.category)
    if opener and opener not in reply:
        reply = f"{opener}\n\n{reply}"

    sources = [
        {
            "id": c.id,
            "title": c.title,
            "source": c.source,
            "category": c.category,
            "url": resolve_source_url(chunk_id=c.id, source=c.source, category=c.category),
        }
        for c in chunks
    ]

    return {
        "reply": reply,
        "refused": False,
        "reason": guard.reason,
        "category": guard.category,
        "sources": sources,
        "provider": provider,
        "quota": quota.__dict__,
    }
