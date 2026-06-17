export type {
  QuizQuestion,
  ReadingBlock,
  ReadingCountryCode,
  ReadingPart,
  ReadingPassage,
  QuestionType,
} from "./types";
export { READING_COUNTRY_LABELS } from "./types";

export {
  ALL_READING_BLOCKS,
  PART_A_BLOCKS,
  PART_B_BLOCKS,
  PART_C_BLOCKS,
  blockRoute,
  blockSummary,
  blocksForPart,
  blocksForUser,
  blocksForUserPart,
  formatReadingTagLabel,
  getReadingBlock,
  normalizeReadingCountry,
  partFromWeakTag,
  pickPlanReadingBlock,
  primaryBlockForPart,
  professionsWithReadingBlocks,
  readingCountryLabel,
} from "./blocks/registry";

export { QUIZ_BANK, allQuizQuestions } from "./quiz-bank";

import { ALL_READING_BLOCKS } from "./blocks/registry";
import { QUIZ_BANK } from "./quiz-bank";
import type { QuizQuestion } from "./types";

export function fullQuizPool(): QuizQuestion[] {
  const embedded = ALL_READING_BLOCKS.flatMap((block) => block.questions);
  return [...embedded, ...QUIZ_BANK];
}

export function totalReadingQuestionCount(): number {
  return fullQuizPool().length;
}

export function readingBlockCount(): number {
  return ALL_READING_BLOCKS.length;
}
