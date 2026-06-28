import type { AssessmentSkill } from "@/content/assessment";
import { OET_LISTENING_OVERVIEW } from "@/lib/listening/exam-guide";
import { OET_READING_OVERVIEW } from "@/lib/reading/exam-guide";
import { OET_SPEAKING_OVERVIEW } from "@/lib/speaking/exam-guide";
import { OET_WRITING_OVERVIEW } from "@/lib/writing/exam-guide";

/** Official OET question counts — single source for exam-mode assembly. */
export const OET_READING = {
  partA: OET_READING_OVERVIEW.parts.A.questions,
  partB: OET_READING_OVERVIEW.parts.B.questions,
  partC: OET_READING_OVERVIEW.parts.C.questions,
  partAMinutes: OET_READING_OVERVIEW.parts.A.minutes,
  partBcMinutes: OET_READING_OVERVIEW.partBcSharedMinutes,
  partCTexts: 2,
  totalQuestions: OET_READING_OVERVIEW.totalQuestions,
  totalMinutes: OET_READING_OVERVIEW.totalMinutes,
} as const;

export const OET_LISTENING = {
  partA: OET_LISTENING_OVERVIEW.parts.A.questions,
  partB: OET_LISTENING_OVERVIEW.parts.B.questions,
  partC: OET_LISTENING_OVERVIEW.parts.C.questions,
  totalMinutes: OET_LISTENING_OVERVIEW.totalMinutes,
  totalQuestions: OET_LISTENING_OVERVIEW.totalQuestions,
} as const;

export const OET_WRITING = {
  readingMinutes: OET_WRITING_OVERVIEW.readingMinutes,
  writingMinutes: OET_WRITING_OVERVIEW.writingMinutes,
  totalMinutes: OET_WRITING_OVERVIEW.totalMinutes,
  wordMin: OET_WRITING_OVERVIEW.wordMin,
  wordMax: OET_WRITING_OVERVIEW.wordMax,
  criteriaCount: OET_WRITING_OVERVIEW.criteriaCount,
} as const;

export const OET_SPEAKING = {
  rolePlays: OET_SPEAKING_OVERVIEW.rolePlays,
  prepMinutesEach: OET_SPEAKING_OVERVIEW.prepMinutesEach,
  durationMinutesEach: OET_SPEAKING_OVERVIEW.durationMinutesEach,
  totalAssessedMinutes: OET_SPEAKING_OVERVIEW.totalAssessedMinutes,
} as const;

/** Part A blocks hold 4 matching items (Text A–D); need several sets for 20 / 24. */
export const PART_A_QUESTIONS_PER_BLOCK = 4;

/** Clever/adaptive quiz limits — R/L use full exam assembly when undefined. */
export function cleverQuizQuestionLimit(skill: AssessmentSkill): number | undefined {
  switch (skill) {
    case "reading":
    case "listening":
      return undefined;
    case "writing":
    case "speaking":
      return 12;
    case "vocab":
      return 15;
    case "mixed":
      return 6;
    default:
      return 5;
  }
}

export function cleverQuizHint(skill: AssessmentSkill): string {
  switch (skill) {
    case "reading":
      return "Exam-faithful Part A (20) / B (6) / C (16) — one part per session";
    case "listening":
      return "Exam-faithful Part A (24) / B (6) / C (12) — one part per session";
    case "writing":
      return "12 criteria & letter-language questions (Purpose, Genre, Organisation…)";
    case "speaking":
      return "12 clinical communication questions (ICE, structure, empathy…)";
    case "vocab":
      return "15 healthcare words & phrases for R/L/W/S";
    case "mixed":
      return "One question from each skill area";
    default:
      return "Mixed questions from your weak areas";
  }
}
