import {
  blocksForUserPart,
  getReadingBlock,
  type ReadingBlock,
} from "@/content/reading";
import type { QuizQuestion } from "@/content/reading/types";
import {
  OET_READING,
  PART_A_QUESTIONS_PER_BLOCK,
} from "@/lib/exam/oet-counts";
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

export interface ReadingExamASet {
  /** Each block = one Text A–D set with up to 4 matching questions. */
  sections: Array<{ block: ReadingBlock; questions: QuizQuestion[] }>;
  allQuestions: QuizQuestion[];
}

export interface ReadingExamBCSet {
  partBExtracts: PartBExtract[];
  partCBlocks: ReadingBlock[];
  allQuestions: QuizQuestion[];
  partBQuestionCount: number;
  partCQuestionCount: number;
}

export const OET_PART_B_EXTRACT_COUNT: number = OET_READING.partB;
export const OET_PART_C_TEXT_COUNT = OET_READING.partCTexts;
export const OET_PART_A_QUESTION_COUNT: number = OET_READING.partA;
export const OET_PART_C_QUESTION_COUNT: number = OET_READING.partC;

function normalizeBlock(block: ReadingBlock): ReadingBlock {
  return {
    ...block,
    paragraphs: block.paragraphs ?? [],
    questions: block.questions ?? [],
  };
}

function partAQuestionsFromBlock(block: ReadingBlock): QuizQuestion[] {
  return block.questions
    .filter((q) => q.type === "matching" || q.options?.includes("Text A"))
    .map((q) => ({ ...q, passageId: block.id, part: "A" as const }));
}

/** Up to 20 matching questions from multiple Part A blocks (5 × 4). */
export function selectPartAExamQuestions(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  targetCount: number = OET_PART_A_QUESTION_COUNT,
): QuizQuestion[] {
  return assembleReadingExamA(profession, targetCountry, seed, targetCount).allQuestions;
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

/** MCQs from two+ Part C passages until target (real exam: 16 on two texts). */
export function selectPartCExamQuestions(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  targetCount: number = OET_PART_C_QUESTION_COUNT,
): QuizQuestion[] {
  const blocks = shuffleWithSeed(
    blocksForUserPart("C", profession, targetCountry).filter(
      (b) => (b.questions?.length ?? 0) > 0,
    ),
    seed,
  );
  if (!blocks.length) return [];

  const questions: QuizQuestion[] = [];
  let blockIndex = 0;

  while (questions.length < targetCount && blocks.length > 0) {
    const block = blocks[blockIndex % blocks.length]!;
    const q = block.questions.find(
      (item) => !questions.some((picked) => picked.id === item.id),
    );
    if (q) {
      questions.push({ ...q, passageId: block.id, part: "C" as const });
    }
    blockIndex += 1;
    if (blockIndex > blocks.length * 20) break;
  }

  return questions.slice(0, targetCount);
}

export function assembleReadingExamA(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  targetCount: number = OET_PART_A_QUESTION_COUNT,
): ReadingExamASet {
  const blocks = shuffleWithSeed(
    blocksForUserPart("A", profession, targetCountry).filter(
      (b) => partAQuestionsFromBlock(b).length > 0,
    ),
    seed,
  );

  const sections: ReadingExamASet["sections"] = [];
  const allQuestions: QuizQuestion[] = [];

  for (const raw of blocks) {
    if (allQuestions.length >= targetCount) break;
    const block = normalizeBlock(raw);
    const pool = partAQuestionsFromBlock(block);
    const needed = targetCount - allQuestions.length;
    const slice = pool.slice(0, Math.min(PART_A_QUESTIONS_PER_BLOCK, needed));
    if (!slice.length) continue;
    sections.push({ block, questions: slice });
    allQuestions.push(...slice);
  }

  return { sections, allQuestions };
}

export function assembleReadingExamBC(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
): ReadingExamBCSet {
  const partBQuestions = selectPartBExamQuestions(profession, targetCountry, seed);
  const partCQuestions = selectPartCExamQuestions(
    profession,
    targetCountry,
    seed + 7,
    OET_PART_C_QUESTION_COUNT,
  );

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
    .filter((b): b is ReadingBlock => Boolean(b))
    .map((block) => ({
      ...block,
      questions: partCQuestions.filter((q) => q.passageId === block.id),
    }));

  return {
    partBExtracts,
    partCBlocks,
    allQuestions: [...partBQuestions, ...partCQuestions],
    partBQuestionCount: partBQuestions.length,
    partCQuestionCount: partCQuestions.length,
  };
}
