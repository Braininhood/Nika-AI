import type { TargetGrades } from "@/lib/domain/types";

export type OutboxType =
  | "AI_WRITING"
  | "AI_SPEAKING"
  | "PROGRESS_SYNC"
  | "ATTEMPT_SYNC";

export interface OutboxEntry {
  id: string;
  type: OutboxType;
  payload: unknown;
  createdAt: number;
  retries: number;
  lastError?: string;
}

export interface LocalUser {
  id: string;
  email?: string;
  profession?: string;
  targetCountry?: string;
  targetRegulator?: string;
  targetGrades?: TargetGrades;
  onboardingComplete?: boolean;
  examDate?: string;
  studyGoal?: "training" | "exam_prep";
  nativeLanguage?: string;
  isGuest: boolean;
  updatedAt: number;
}

export interface SkillMapRecord {
  userId: string;
  snapshot: Record<string, unknown>;
  computedAt: number;
}

export interface DiagnosticSessionRecord {
  userId: string;
  sessionId: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

export interface LessonProgressRecord {
  lessonId: string;
  userId: string;
  score: number;
  completed: boolean;
  completedAt: number;
}

export interface ProgressEntry {
  id: string;
  skill: string;
  score: number;
  tags: string[];
  createdAt: number;
}

export interface AttemptRecord {
  id: string;
  skill: string;
  part?: string;
  scenarioId?: string;
  scoreRaw: Record<string, unknown>;
  createdAt: number;
  synced: boolean;
}

export interface WritingDraft {
  id: string;
  scenarioId: string;
  letterText: string;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  nextReviewAt: number;
  interval: number;
  ease: number;
  /** SM-2 consecutive successful reviews */
  repetitions: number;
}

export interface OfflinePack {
  id: string;
  version: string;
  sizeBytes: number;
  downloadedAt: number;
  manifestPath?: string;
  complete?: boolean;
}

export interface UserImport {
  id: string;
  name: string;
  type: "pdf" | "mp3";
  sizeBytes: number;
  importedAt: number;
}

export interface MediaBlob {
  id: string;
  mimeType: string;
  sizeBytes: number;
  opfsPath: string;
  createdAt: number;
}

export interface UserImportPack {
  id: string;
  name: string;
  profession: string;
  createdAt: number;
  expiresAt: number;
  consent: boolean;
  files: {
    pdfId?: string;
    audioIds: string[];
    keyPdfId?: string;
  };
  parsed: {
    passages?: { id: string; title: string; text: string }[];
    listeningParts?: {
      part: "A" | "B" | "C";
      title: string;
      audioId: string;
      transcript?: string;
    }[];
    answerKey?: Record<string, string>;
  };
}

export interface AiFeedbackCache {
  attemptId: string;
  feedback: Record<string, unknown>;
  cachedAt: number;
}

export interface SpeakingRecording {
  id: string;
  roleCardId: string;
  blobKey: string;
  durationSeconds: number;
  createdAt: number;
}

export type ReadinessState =
  | "studying"
  | "mock_eligible"
  | "mock_pass_pending"
  | "exam_ready";

export interface ReadinessStateRecord {
  userId: string;
  state: ReadinessState;
  consecutiveMockPasses: number;
  allGatesMet?: boolean;
  lastMockAt?: number;
  lastMockPassed?: boolean;
  failedSkillsFromLastMock?: string[];
  courseVersion?: number;
  updatedAt: number;
}

export interface MockSkillResultRecord {
  skill: string;
  estBand: string;
  passed: boolean;
  attemptId?: string;
  accuracy?: number;
}

export interface MockAttemptRecord {
  id: string;
  userId: string;
  type: "full";
  status: "in_progress" | "completed" | "abandoned";
  skillResults: Record<string, MockSkillResultRecord>;
  passed: boolean;
  failedSkills: string[];
  startedAt: number;
  completedAt?: number;
}

export interface PersonalCourseRecord {
  userId: string;
  version: number;
  snapshot: Record<string, unknown>;
  generatedAt: number;
}

export interface VocabularyEntryRecord {
  id: string;
  word: string;
  phrase?: string;
  context?: string;
  englishExplanation: string;
  nativeTranslation?: string;
  nativeLanguage: string;
  phoneticHint?: string;
  tags: string[];
  source: "manual" | "reading" | "quiz" | "nika";
  addedAt: number;
  lastReviewedAt?: number;
}

export interface GeneratedAssessmentRecord {
  id: string;
  title: string;
  skill: string;
  questions: Record<string, unknown>[];
  createdAt: number;
  completedAt?: number;
}

export interface NikaChatMessageRecord {
  id: string;
  userId: string;
  role: "user" | "nika";
  text: string;
  refused?: boolean;
  sources?: { id: string; title: string; source?: string; category?: string; url?: string }[];
  tasks?: { skill: string; title: string; route: string; durationMinutes: number }[];
  provider?: string;
  createdAt: number;
}
