"""Cross-device study data — attempts, vocabulary, local study blob."""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.supabase_rest import supabase_rest
from app.schemas.study_sync import (
    AttemptSyncItem,
    StudyPullResponse,
    StudySyncRequest,
    StudySyncResponse,
    VocabularySyncItem,
)


def _ms_to_iso(ms: int) -> str:
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).isoformat()


async def pull_study_data(user_id: str) -> StudyPullResponse:
    attempts_raw = await supabase_rest(
        "GET",
        "attempts",
        params={
            "user_id": f"eq.{user_id}",
            "select": "id,skill,part,scenario_id,score_raw,grade_estimate,duration_seconds,created_at",
            "order": "created_at.desc",
            "limit": "500",
        },
    )
    attempts = list(attempts_raw) if isinstance(attempts_raw, list) else []

    attempt_ids = [str(a["id"]) for a in attempts if a.get("id")]
    writing_by_attempt: dict[str, dict] = {}
    speaking_by_attempt: dict[str, dict] = {}

    if attempt_ids:
        ids_csv = ",".join(attempt_ids)
        writing_rows = await supabase_rest(
            "GET",
            "writing_attempts",
            params={"attempt_id": f"in.({ids_csv})", "select": "*"},
        )
        if isinstance(writing_rows, list):
            for row in writing_rows:
                aid = row.get("attempt_id")
                if aid:
                    writing_by_attempt[str(aid)] = row

        speaking_rows = await supabase_rest(
            "GET",
            "speaking_attempts",
            params={"attempt_id": f"in.({ids_csv})", "select": "*"},
        )
        if isinstance(speaking_rows, list):
            for row in speaking_rows:
                aid = row.get("attempt_id")
                if aid:
                    speaking_by_attempt[str(aid)] = row

    for attempt in attempts:
        aid = str(attempt.get("id", ""))
        if aid in writing_by_attempt:
            w = writing_by_attempt[aid]
            attempt["writing"] = {
                "case_notes_id": w.get("case_notes_id"),
                "letter_text": w.get("letter_text"),
                "ai_feedback": w.get("ai_feedback"),
                "criterion_scores": w.get("criterion_scores"),
            }
        if aid in speaking_by_attempt:
            s = speaking_by_attempt[aid]
            attempt["speaking"] = {
                "role_card_id": s.get("role_card_id"),
                "transcript": s.get("transcript"),
                "checklist_scores": s.get("checklist_scores"),
                "recording_url": s.get("recording_url"),
            }
    vocabulary = await supabase_rest(
        "GET",
        "vocabulary_entries",
        params={
            "user_id": f"eq.{user_id}",
            "select": "*",
            "order": "added_at.desc",
            "limit": "2000",
        },
    )
    blob_rows = await supabase_rest(
        "GET",
        "user_study_blobs",
        params={"user_id": f"eq.{user_id}", "select": "payload,updated_at"},
    )

    blob_row = blob_rows[0] if isinstance(blob_rows, list) and blob_rows else {}
    updated_at = blob_row.get("updated_at") if isinstance(blob_row, dict) else None
    blob_ms = None
    if updated_at:
        try:
            blob_ms = int(datetime.fromisoformat(str(updated_at).replace("Z", "+00:00")).timestamp() * 1000)
        except ValueError:
            blob_ms = None

    return StudyPullResponse(
        attempts=list(attempts) if isinstance(attempts, list) else [],
        vocabulary=list(vocabulary) if isinstance(vocabulary, list) else [],
        study_blob=(blob_row.get("payload") or {}) if isinstance(blob_row, dict) else {},
        study_blob_updated_at_ms=blob_ms,
    )


async def _upsert_attempt(user_id: str, item: AttemptSyncItem) -> None:
    created_at = _ms_to_iso(item.created_at_ms)
    row = {
        "id": item.id,
        "user_id": user_id,
        "skill": item.skill,
        "part": item.part,
        "scenario_id": item.scenario_id,
        "score_raw": item.score_raw,
        "grade_estimate": item.grade_estimate,
        "duration_seconds": item.duration_seconds,
        "created_at": created_at,
    }
    await supabase_rest(
        "POST",
        "attempts",
        json=row,
        prefer="resolution=merge-duplicates",
    )

    if item.writing:
        w = item.writing
        await supabase_rest(
            "POST",
            "writing_attempts",
            json={
                "attempt_id": item.id,
                "case_notes_id": w.get("case_notes_id"),
                "letter_text": w.get("letter_text"),
                "ai_feedback": w.get("ai_feedback"),
                "criterion_scores": w.get("criterion_scores"),
            },
            prefer="resolution=merge-duplicates",
        )

    if item.speaking:
        s = item.speaking
        await supabase_rest(
            "POST",
            "speaking_attempts",
            json={
                "attempt_id": item.id,
                "role_card_id": s.get("role_card_id"),
                "transcript": s.get("transcript"),
                "checklist_scores": s.get("checklist_scores"),
                "recording_url": s.get("recording_url"),
            },
            prefer="resolution=merge-duplicates",
        )


async def _upsert_vocabulary(user_id: str, item: VocabularySyncItem) -> None:
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id": item.id,
        "user_id": user_id,
        "word": item.word,
        "phrase": item.phrase,
        "context": item.context,
        "english_explanation": item.english_explanation,
        "native_translation": item.native_translation,
        "native_language": item.native_language,
        "phonetic_hint": item.phonetic_hint,
        "tags": item.tags,
        "source": item.source,
        "added_at": _ms_to_iso(item.added_at_ms),
        "last_reviewed_at": _ms_to_iso(item.last_reviewed_at_ms) if item.last_reviewed_at_ms else None,
        "updated_at": now,
    }
    await supabase_rest(
        "POST",
        "vocabulary_entries",
        json=row,
        prefer="resolution=merge-duplicates",
    )


async def apply_study_sync(user_id: str, body: StudySyncRequest) -> StudySyncResponse:
    attempts_n = 0
    for item in body.attempts:
        await _upsert_attempt(user_id, item)
        attempts_n += 1

    vocab_n = 0
    for item in body.vocabulary:
        await _upsert_vocabulary(user_id, item)
        vocab_n += 1

    blob_saved = False
    if body.study_blob:
        updated_at = (
            _ms_to_iso(body.study_blob_updated_at_ms)
            if body.study_blob_updated_at_ms
            else datetime.now(timezone.utc).isoformat()
        )
        await supabase_rest(
            "POST",
            "user_study_blobs",
            json={
                "user_id": user_id,
                "payload": body.study_blob,
                "updated_at": updated_at,
            },
            prefer="resolution=merge-duplicates",
        )
        blob_saved = True

    return StudySyncResponse(
        status="synced",
        attempts_upserted=attempts_n,
        vocabulary_upserted=vocab_n,
        study_blob_saved=blob_saved,
    )
