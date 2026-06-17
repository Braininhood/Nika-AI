import type { OetGrade, OetSkill } from "@/lib/domain/types";

/** Readiness state machine — see 08-adaptive-readiness-loop.md */
export type ReadinessState =
  | "studying"
  | "mock_eligible"
  | "mock_pass_pending"
  | "exam_ready";

export interface ReadinessGate {
  id: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface ReadinessStatus {
  state: ReadinessState;
  consecutiveMockPasses: number;
  gates: ReadinessGate[];
  allGatesMet: boolean;
  nikaMessage: string;
  failedSkillsFromLastMock: OetSkill[];
  rediagnosticDue: boolean;
  daysSinceDiagnostic: number | null;
  /** sklearn GradientBoosting on API — exam-ready probability (bootstrap model). */
  mlPrediction?: MlReadinessPrediction;
}

export interface MlReadinessPrediction {
  probability: number;
  model: string;
}

export type CourseModuleStatus = "active" | "maintenance" | "completed" | "locked";

export interface CourseModule {
  id: string;
  skill: OetSkill;
  title: string;
  focusTags: string[];
  status: CourseModuleStatus;
  sequence: number;
  items: CourseModuleItem[];
  rationale: string;
}

export interface CourseModuleItem {
  type: "lesson" | "guided" | "practice" | "drill" | "exam" | "review";
  title: string;
  route: string;
  durationMinutes: number;
}

export interface PersonalCourse {
  userId: string;
  version: number;
  modules: CourseModule[];
  generatedAt: string;
  examUrgencyWeeks: number | null;
  summary: string;
}

export type MockSessionStatus = "in_progress" | "completed" | "abandoned";

export interface MockSkillResult {
  skill: OetSkill;
  estBand: OetGrade;
  passed: boolean;
  attemptId?: string;
  accuracy?: number;
}

export interface MockAttemptRecord {
  id: string;
  userId: string;
  type: "full";
  status: MockSessionStatus;
  skillResults: Partial<Record<OetSkill, MockSkillResult>>;
  passed: boolean;
  failedSkills: OetSkill[];
  startedAt: number;
  completedAt?: number;
}

export interface SkillAttemptStats {
  sessionsBySkill: Record<OetSkill, number>;
  recentBands: Record<OetSkill, OetGrade[]>;
  tagFailCounts: Record<string, number>;
  totalAttempts: number;
  lastAttemptAt: number | null;
}
