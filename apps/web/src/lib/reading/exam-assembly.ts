import {
  blocksForUserPart,
  getReadingBlock,
  type ReadingBlock,
} from "@/content/reading";
import type { QuizQuestion } from "@/content/reading/types";
import { OET_READING_OVERVIEW } from "@/lib/reading/exam-guide";
import { createSelectionSeed, shuffleWithSeed } from "@/lib/quiz/shuffle-seed";

/** One Part B workplace extract — real exam: 6 texts × 1 MCQ each. */
export interface PartBExtract {
  key: string;
  index: number;
  sourceBlockId: string;
  title: string;
  localeContext?: string;
  countryCode: ReadingBlock["countryCode"];
  paragraph: string;
  question: QuizQuestion;
}

export interface ReadingExamBCSet {
  partBExtracts: PartBExtract[];
  partCBlocks: ReadingBlock[];
  allQuestions: QuizQuestion[];
  partBQuestionCount: number;
  partCQuestionCount: number;
}

export const OET_PART_B_EXTRACT_COUNT: number = OET_READING_OVERVIEW.parts.B.questions;
export const OET_PART_C_TEXT_COUNT = 2;

function normalizeBlock(block: ReadingBlock): ReadingBlock {
  return {
    ...block,
    paragraphs: block.paragraphs ?? [],
    questions: block.questions ?? [],
  };
}

/** Pick one MCQ per block — mimics six separate Part B extracts. */
export function selectPartBExamQuestions(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  count: number = OET_PART_B_EXTRACT_COUNT,
): QuizQuestion[] {
  const blocks = blocksForUserPart("B", profession, targetCountry).filter(
    (b) => (b.questions?.length ?? 0) > 0,
  );
  if (!blocks.length) return [];

  const shuffled = shuffleWithSeed(blocks, seed);
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));
  const questions: QuizQuestion[] = [];

  for (const block of picked) {
    const q = block.questions[0];
    if (!q) continue;
    questions.push({ ...q, passageId: block.id, part: "B" });
  }

  return questions;
}

/** All questions from two Part C passages — real exam uses two longer texts. */
export function selectPartCExamQuestions(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
): QuizQuestion[] {
  const blocks = blocksForUserPart("C", profession, targetCountry).filter(
    (b) => (b.questions?.length ?? 0) > 0,
  );
  if (!blocks.length) return [];

  const shuffled = shuffleWithSeed(blocks, seed);
  const picked = shuffled.slice(0, Math.min(OET_PART_C_TEXT_COUNT, shuffled.length));
  return picked.flatMap((block) =>
    block.questions.map((q) => ({ ...q, passageId: block.id, part: "C" as const })),
  );
}

/** Four matching questions from a single Part A block (Text A–D). */
export function selectPartAExamQuestions(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
): QuizQuestion[] {
  const blocks = blocksForUserPart("A", profession, targetCountry).filter(
    (b) => (b.questions?.length ?? 0) > 0,
  );
  if (!blocks.length) return [];

  const block = shuffleWithSeed(blocks, seed)[0]!;
  return block.questions
    .filter((q) => q.type === "matching" || q.options?.includes("Text A"))
    .slice(0, 4)
    .map((q) => ({ ...q, passageId: block.id, part: "A" as const }));
}

export function assembleReadingExamBC(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
): ReadingExamBCSet {
  const partBQuestions = selectPartBExamQuestions(profession, targetCountry, seed);
  const partCQuestions = selectPartCExamQuestions(profession, targetCountry, seed + 7);

  const partBExtracts: PartBExtract[] = partBQuestions.map((question, index) => {
    const block = normalizeBlock(getReadingBlock(question.passageId!)!);
    const paragraph = block.paragraphs[0] ?? block.paragraphs.join("\n\n");
    return {
      key: `${block.id}-${question.id}`,
      index: index + 1,
      sourceBlockId: block.id,
      title: block.title,
      localeContext: block.localeContext,
      countryCode: block.countryCode,
      paragraph,
      question,
    };
  });

  const partCBlockIds = [...new Set(partCQuestions.map((q) => q.passageId).filter(Boolean))];
  const partCBlocks = partCBlockIds
    .map((id) => (id ? normalizeBlock(getReadingBlock(id)!) : undefined))
    .filter((b): b is ReadingBlock => Boolean(b));

  return {
    partBExtracts,
    partCBlocks,
    allQuestions: [...partBQuestions, ...partCQuestions],
    partBQuestionCount: partBQuestions.length,
    partCQuestionCount: partCQuestions.length,
  };
}
