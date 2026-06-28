import { fullQuizPool } from "@/content/reading";
import type { QuizQuestion } from "@/content/reading/types";
import type { OetSkill } from "@/lib/domain/types";

import {
  LISTENING_QUIZ_BANK,
  SPEAKING_QUIZ_BANK,
  WRITING_QUIZ_BANK,
} from "./skill-banks";
import { VOCAB_BANK } from "./vocab-bank";
import { fullVocabQuizPool } from "./glossary-quiz-pool";

export type AssessmentSkill = OetSkill | "vocab" | "mixed";

export { ALL_SKILL_PHRASES, phrasesForSkill } from "./skill-vocab-phrases";
export { fullVocabQuizPool, glossaryQuizCount } from "./glossary-quiz-pool";
export { VOCAB_BANK, VOCAB_PHRASES } from "./vocab-bank";
export type { VocabPhrase } from "./vocab-bank";

/** All quiz questions across skills for clever assessments and Nika generation. */
export function fullAssessmentPool(): QuizQuestion[] {
  const reading = fullQuizPool();
  const seen = new Set<string>();
  const merged: QuizQuestion[] = [];

  for (const q of [
    ...reading,
    ...LISTENING_QUIZ_BANK,
    ...WRITING_QUIZ_BANK,
    ...SPEAKING_QUIZ_BANK,
    ...fullVocabQuizPool(),
  ]) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    merged.push(q);
  }
  return merged;
}

export function poolForSkill(skill: AssessmentSkill): QuizQuestion[] {
  if (skill === "mixed") return fullAssessmentPool();
  if (skill === "vocab") return fullVocabQuizPool();
  if (skill === "reading") return fullQuizPool();
  if (skill === "listening") return LISTENING_QUIZ_BANK;
  if (skill === "writing") return WRITING_QUIZ_BANK;
  if (skill === "speaking") return SPEAKING_QUIZ_BANK;
  return fullAssessmentPool();
}

export const CLEVER_SKILL_LABELS: Record<AssessmentSkill, string> = {
  reading: "Reading quick quiz",
  listening: "Listening quick quiz",
  writing: "Writing criteria quiz",
  speaking: "Speaking communication quiz",
  vocab: "Vocabulary quiz",
  mixed: "All skills mixed quiz",
};

export const CLEVER_SKILL_ROUTES: Record<Exclude<AssessmentSkill, "mixed">, string> = {
  reading: "/study/clever/reading",
  listening: "/study/clever/listening",
  writing: "/study/clever/writing",
  speaking: "/study/clever/speaking",
  vocab: "/study/clever/vocab",
};
