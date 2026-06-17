import Dexie, { type EntityTable } from "dexie";

import { createClient } from "@/lib/supabase/client";

import type {
  AiFeedbackCache,
  AttemptRecord,
  DiagnosticSessionRecord,
  Flashcard,
  LessonProgressRecord,
  LocalUser,
  MediaBlob,
  MockAttemptRecord,
  OfflinePack,
  OutboxEntry,
  PersonalCourseRecord,
  ProgressEntry,
  ReadinessStateRecord,
  SkillMapRecord,
  SpeakingRecording,
  UserImport,
  UserImportPack,
  GeneratedAssessmentRecord,
  VocabularyEntryRecord,
  NikaChatMessageRecord,
  WritingDraft,
} from "./types";

export class OetCoachDB extends Dexie {
  users!: EntityTable<LocalUser, "id">;
  progress!: EntityTable<ProgressEntry, "id">;
  attempts!: EntityTable<AttemptRecord, "id">;
  writingDrafts!: EntityTable<WritingDraft, "id">;
  speakingRecordings!: EntityTable<SpeakingRecording, "id">;
  flashcards!: EntityTable<Flashcard, "id">;
  offlinePacks!: EntityTable<OfflinePack, "id">;
  userImports!: EntityTable<UserImport, "id">;
  mediaBlobs!: EntityTable<MediaBlob, "id">;
  userImportPacks!: EntityTable<UserImportPack, "id">;
  syncOutbox!: EntityTable<OutboxEntry, "id">;
  aiFeedbackCache!: EntityTable<AiFeedbackCache, "attemptId">;
  skillMaps!: EntityTable<SkillMapRecord, "userId">;
  diagnosticSessions!: EntityTable<DiagnosticSessionRecord, "userId">;
  lessonProgress!: EntityTable<LessonProgressRecord, "lessonId">;
  readinessState!: EntityTable<ReadinessStateRecord, "userId">;
  mockAttempts!: EntityTable<MockAttemptRecord, "id">;
  personalCourses!: EntityTable<PersonalCourseRecord, "userId">;
  vocabularyEntries!: EntityTable<VocabularyEntryRecord, "id">;
  generatedAssessments!: EntityTable<GeneratedAssessmentRecord, "id">;
  nikaChatMessages!: EntityTable<NikaChatMessageRecord, "id">;

  constructor() {
    super("oet-coach-v1");

    this.version(1).stores({
      users: "id, isGuest, updatedAt",
      progress: "id, skill, createdAt",
      attempts: "id, skill, createdAt, synced",
      writingDrafts: "id, scenarioId, updatedAt",
      speakingRecordings: "id, roleCardId, createdAt",
      flashcards: "id, nextReviewAt",
      offlinePacks: "id, downloadedAt",
      userImports: "id, type, importedAt",
      syncOutbox: "id, type, createdAt, retries",
      aiFeedbackCache: "attemptId, cachedAt",
    });

    this.version(2).stores({
      skillMaps: "userId, computedAt",
    });

    this.version(3).stores({
      diagnosticSessions: "userId, updatedAt",
      lessonProgress: "lessonId, userId, completed",
    });

    this.version(4).stores({
      mediaBlobs: "id, opfsPath, createdAt",
      userImportPacks: "id, profession, createdAt, expiresAt",
    });

    this.version(5).stores({
      readinessState: "userId, state, updatedAt",
      mockAttempts: "id, userId, status, startedAt, completedAt",
      personalCourses: "userId, version, generatedAt",
    });

    this.version(6).stores({
      vocabularyEntries: "id, word, nativeLanguage, addedAt",
      generatedAssessments: "id, skill, createdAt",
    });

    this.version(7).stores({
      nikaChatMessages: "id, userId, createdAt, [userId+createdAt]",
    });
  }
}

export const db = new OetCoachDB();

export async function getActiveUser(): Promise<LocalUser | undefined> {
  const supabase = createClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const existing = await db.users.get(data.session.user.id);
      if (existing && existing.isGuest !== true) return existing;
      return {
        id: data.session.user.id,
        email: data.session.user.email,
        isGuest: false,
        updatedAt: Date.now(),
      };
    }
  }

  return db.users.filter((u) => u.isGuest !== true).first();
}
