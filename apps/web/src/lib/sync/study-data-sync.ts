/**
 * Cross-device study data sync — pull from cloud on sign-in, push after activity.
 */

import { apiUrl } from "@/lib/api/base-url";
import { fetchApiJson } from "@/lib/api/client";
import { db } from "@/lib/db";
import type {
  AttemptRecord,
  Flashcard,
  LessonProgressRecord,
  MockAttemptRecord,
  ProgressEntry,
  ReadinessStateRecord,
  SpeakingRecording,
  VocabularyEntryRecord,
  WritingDraft,
} from "@/lib/db/types";

export interface StudyPullResponse {
  attempts: Array<{
    id: string;
    skill: string;
    part?: string | null;
    scenario_id?: string | null;
    score_raw: Record<string, unknown>;
    grade_estimate?: string | null;
    duration_seconds?: number | null;
    created_at: string;
    writing?: {
      case_notes_id?: string | null;
      letter_text?: string | null;
      ai_feedback?: Record<string, unknown> | null;
      criterion_scores?: Record<string, unknown> | null;
    };
    speaking?: {
      role_card_id?: string | null;
      transcript?: string | null;
      checklist_scores?: Record<string, unknown> | null;
      recording_url?: string | null;
    };
  }>;
  vocabulary: Array<{
    id: string;
    word: string;
    phrase?: string | null;
    context?: string | null;
    english_explanation: string;
    native_translation?: string | null;
    native_language: string;
    phonetic_hint?: string | null;
    tags: string[];
    source: string;
    added_at: string;
    last_reviewed_at?: string | null;
  }>;
  study_blob: StudyBlobPayload;
  study_blob_updated_at_ms?: number | null;
}

export interface StudyBlobPayload {
  writing_drafts?: WritingDraft[];
  lesson_progress?: LessonProgressRecord[];
  readiness?: ReadinessStateRecord | null;
  mock_attempts?: MockAttemptRecord[];
  flashcards?: Flashcard[];
  progress?: ProgressEntry[];
  speaking_recordings?: SpeakingRecording[];
  ai_feedback_cache?: Array<{ attemptId: string; feedback: Record<string, unknown>; cachedAt: number }>;
  updated_at_ms?: number;
}

function isoToMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : Date.now();
}

function mergeById<T extends { id: string }>(
  local: T[],
  remote: T[],
  getTime: (item: T) => number,
): T[] {
  const map = new Map<string, T>();
  for (const item of remote) map.set(item.id, item);
  for (const item of local) {
    const existing = map.get(item.id);
    if (!existing || getTime(item) >= getTime(existing)) {
      map.set(item.id, item);
    }
  }
  return [...map.values()];
}

export async function mergeRemoteStudyData(
  userId: string,
  remote: StudyPullResponse,
): Promise<void> {
  for (const row of remote.attempts) {
    const createdAt = isoToMs(row.created_at);
    const local = await db.attempts.get(row.id);
    if (local && local.createdAt >= createdAt) continue;

    const record: AttemptRecord = {
      id: row.id,
      skill: row.skill,
      part: row.part ?? undefined,
      scenarioId: row.scenario_id ?? undefined,
      scoreRaw: {
        ...(row.score_raw ?? {}),
        ...(row.speaking?.transcript
          ? { transcript: row.speaking.transcript }
          : {}),
      },
      createdAt,
      synced: true,
    };
    await db.attempts.put(record);

    if (row.writing?.letter_text && row.scenario_id) {
      const draftId = `sync-${row.scenario_id}`;
      const localDraft = await db.writingDrafts.get(draftId);
      if (!localDraft || createdAt >= localDraft.updatedAt) {
        await db.writingDrafts.put({
          id: draftId,
          scenarioId: row.scenario_id,
          letterText: row.writing.letter_text,
          updatedAt: createdAt,
        });
      }
    }

    if (row.writing?.ai_feedback) {
      const localFb = await db.aiFeedbackCache.get(row.id);
      if (!localFb || createdAt >= localFb.cachedAt) {
        await db.aiFeedbackCache.put({
          attemptId: row.id,
          feedback: row.writing.ai_feedback as Record<string, unknown>,
          cachedAt: createdAt,
        });
      }
    }

    if (row.speaking && (row.speaking.transcript || row.speaking.checklist_scores)) {
      const localFb = await db.aiFeedbackCache.get(row.id);
      if (!localFb || createdAt >= localFb.cachedAt) {
        await db.aiFeedbackCache.put({
          attemptId: row.id,
          feedback: {
            transcript: row.speaking.transcript,
            checklist_scores: row.speaking.checklist_scores,
          },
          cachedAt: createdAt,
        });
      }
    }
  }

  for (const row of remote.vocabulary) {
    const addedAt = isoToMs(row.added_at);
    const local = await db.vocabularyEntries.get(row.id);
    if (local && local.addedAt >= addedAt) continue;

    const record: VocabularyEntryRecord = {
      id: row.id,
      word: row.word,
      phrase: row.phrase ?? undefined,
      context: row.context ?? undefined,
      englishExplanation: row.english_explanation,
      nativeTranslation: row.native_translation ?? undefined,
      nativeLanguage: row.native_language,
      phoneticHint: row.phonetic_hint ?? undefined,
      tags: Array.isArray(row.tags) ? row.tags : [],
      source: row.source as VocabularyEntryRecord["source"],
      addedAt,
      lastReviewedAt: row.last_reviewed_at ? isoToMs(row.last_reviewed_at) : undefined,
    };
    await db.vocabularyEntries.put(record);
  }

  const blob = remote.study_blob ?? {};
  const localBlobTime = (await db.readinessState.get(userId))?.updatedAt ?? 0;
  const remoteBlobTime = remote.study_blob_updated_at_ms ?? blob.updated_at_ms ?? 0;

  if (remoteBlobTime >= localBlobTime) {
    if (blob.writing_drafts?.length) {
      for (const draft of blob.writing_drafts) {
        const local = await db.writingDrafts.get(draft.id);
        if (!local || draft.updatedAt >= local.updatedAt) {
          await db.writingDrafts.put(draft);
        }
      }
    }

    if (blob.lesson_progress?.length) {
      for (const lp of blob.lesson_progress) {
        if (lp.userId === userId) await db.lessonProgress.put(lp);
      }
    }

    if (blob.readiness && blob.readiness.userId === userId) {
      await db.readinessState.put(blob.readiness);
    }

    if (blob.mock_attempts?.length) {
      for (const mock of blob.mock_attempts) {
        if (mock.userId === userId) await db.mockAttempts.put(mock);
      }
    }

    if (blob.flashcards?.length) {
      const local = await db.flashcards.toArray();
      const merged = mergeById(local, blob.flashcards, (f) => f.nextReviewAt);
      await db.flashcards.bulkPut(merged);
    }

    if (blob.progress?.length) {
      for (const p of blob.progress) {
        const local = await db.progress.get(p.id);
        if (!local || p.createdAt >= local.createdAt) {
          await db.progress.put(p);
        }
      }
    }

    if (blob.speaking_recordings?.length) {
      for (const rec of blob.speaking_recordings) {
        const local = await db.speakingRecordings.get(rec.id);
        if (!local || rec.createdAt >= local.createdAt) {
          await db.speakingRecordings.put(rec);
        }
      }
    }

    if (blob.ai_feedback_cache?.length) {
      for (const cache of blob.ai_feedback_cache) {
        const local = await db.aiFeedbackCache.get(cache.attemptId);
        if (!local || cache.cachedAt >= local.cachedAt) {
          await db.aiFeedbackCache.put(cache);
        }
      }
    }
  }
}

async function buildStudyBlob(userId: string): Promise<StudyBlobPayload> {
  const [
    writingDrafts,
    lessonProgress,
    readiness,
    mockAttempts,
    flashcards,
    progress,
    speakingRecordings,
    aiFeedbackCache,
  ] = await Promise.all([
    db.writingDrafts.toArray(),
    db.lessonProgress.where("userId").equals(userId).toArray(),
    db.readinessState.get(userId),
    db.mockAttempts.where("userId").equals(userId).toArray(),
    db.flashcards.toArray(),
    db.progress.toArray(),
    db.speakingRecordings.toArray(),
    db.aiFeedbackCache.toArray(),
  ]);

  return {
    writing_drafts: writingDrafts,
    lesson_progress: lessonProgress,
    readiness: readiness ?? null,
    mock_attempts: mockAttempts,
    flashcards,
    progress,
    speaking_recordings: speakingRecordings,
    ai_feedback_cache: aiFeedbackCache.map((c) => ({
      attemptId: c.attemptId,
      feedback: c.feedback,
      cachedAt: c.cachedAt,
    })),
    updated_at_ms: Date.now(),
  };
}

async function buildSyncPayload(userId: string) {
  const [unsyncedAttempts, vocabulary, studyBlob] = await Promise.all([
    db.attempts.filter((a) => !a.synced).toArray(),
    db.vocabularyEntries.toArray(),
    buildStudyBlob(userId),
  ]);

  const allAttempts = await db.attempts.orderBy("createdAt").reverse().limit(200).toArray();
  const attemptMap = new Map<string, AttemptRecord>();
  for (const a of allAttempts) attemptMap.set(a.id, a);
  for (const a of unsyncedAttempts) attemptMap.set(a.id, a);

  const attemptPayload = await Promise.all(
    [...attemptMap.values()].map(async (a) => {
      const item: Record<string, unknown> = {
        id: a.id,
        skill: a.skill,
        part: a.part,
        scenario_id: a.scenarioId,
        score_raw: a.scoreRaw,
        created_at_ms: a.createdAt,
      };

      if (a.skill === "writing") {
        const draft = a.scenarioId
          ? await db.writingDrafts.where("scenarioId").equals(a.scenarioId).first()
          : undefined;
        const feedback = await db.aiFeedbackCache.get(a.id);
        const scoreRaw = a.scoreRaw as { letterText?: string; criterionScores?: unknown };
        item.writing = {
          case_notes_id: a.scenarioId,
          letter_text: scoreRaw.letterText ?? draft?.letterText,
          ai_feedback: feedback?.feedback,
          criterion_scores: scoreRaw.criterionScores,
        };
      }

      if (a.skill === "speaking") {
        const scoreRaw = a.scoreRaw as { transcript?: string };
        item.speaking = {
          role_card_id: a.scenarioId,
          transcript: scoreRaw.transcript,
          checklist_scores: a.scoreRaw,
          recording_url: null,
        };
      }

      return item;
    }),
  );

  const vocabularyPayload = vocabulary.map((v) => ({
    id: v.id,
    word: v.word,
    phrase: v.phrase,
    context: v.context,
    english_explanation: v.englishExplanation,
    native_translation: v.nativeTranslation,
    native_language: v.nativeLanguage,
    phonetic_hint: v.phoneticHint,
    tags: v.tags,
    source: v.source,
    added_at_ms: v.addedAt,
    last_reviewed_at_ms: v.lastReviewedAt,
  }));

  return {
    attempts: attemptPayload,
    vocabulary: vocabularyPayload,
    study_blob: studyBlob,
    study_blob_updated_at_ms: studyBlob.updated_at_ms,
  };
}

let syncInFlight: Promise<void> | null = null;

export async function syncStudyDataWithCloud(
  userId: string,
  accessToken: string,
): Promise<void> {
  if (!navigator.onLine) return;
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    try {
      const remote = await fetchApiJson<StudyPullResponse>(
        "/api/v1/progress/pull",
        accessToken,
      );
      await mergeRemoteStudyData(userId, remote);
    } catch {
      // Pull failed — still try push
    }

    try {
      const payload = await buildSyncPayload(userId);
      const res = await fetch(apiUrl("/api/v1/progress/sync"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;

      const unsynced = await db.attempts.filter((a) => !a.synced).toArray();
      for (const a of unsynced) {
        await db.attempts.update(a.id, { synced: true });
      }
    } catch {
      // Retry on next sign-in
    }
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleStudyDataSync(userId?: string, accessToken?: string): void {
  if (!userId || !accessToken || !navigator.onLine) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void syncStudyDataWithCloud(userId, accessToken);
  }, 8000);
}
