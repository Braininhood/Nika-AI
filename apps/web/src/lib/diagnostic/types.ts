import type { OetSkill } from "@/lib/domain/types";

export type DiagnosticStep =
  | "intro"
  | "listening"
  | "reading"
  | "writing"
  | "speaking"
  | "self-report"
  | "results";

export interface DiagnosticItem {
  id: string;
  skill: OetSkill;
  tier: 1 | 2 | 3;
  tag: string;
  /** Text shown after listening — question to answer. */
  prompt: string;
  /** Spoken clip for listening items (played via TTS). */
  listenScript?: string;
  /** Short excerpt for reading items (Part B/C style gist). */
  passage?: string;
  options: string[];
  correctIndex: number;
}

export interface BlockAnswer {
  itemId: string;
  skill: OetSkill;
  tier: number;
  tag: string;
  correct: boolean;
  selectedIndex: number;
}

export interface SkillBlockState {
  tier: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  answers: BlockAnswer[];
}

export interface DiagnosticSessionState {
  sessionId: string;
  userId: string;
  step: DiagnosticStep;
  blocks: Partial<Record<OetSkill, SkillBlockState>>;
  selfReport: Partial<Record<OetSkill, number>>;
  status: "in_progress" | "completed";
  updatedAt: number;
}
