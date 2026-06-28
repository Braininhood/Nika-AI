import {
  blocksForUserPart,
  getListeningBlock,
  type ListeningBlock,
} from "@/content/listening";
import type { QuizQuestion } from "@/content/reading/types";
import { OET_LISTENING, PART_A_QUESTIONS_PER_BLOCK } from "@/lib/exam/oet-counts";
import { createSelectionSeed, shuffleWithSeed } from "@/lib/quiz/shuffle-seed";

export interface ListeningPartBExtract {
  key: string;
  index: number;
  block: ListeningBlock;
  question: QuizQuestion;
}

export interface ListeningExamASet {
  sections: Array<{ block: ListeningBlock; questions: QuizQuestion[] }>;
  allQuestions: QuizQuestion[];
}

export interface ListeningExamBCSet {
  partBExtracts: ListeningPartBExtract[];
  partCBlocks: ListeningBlock[];
  allQuestions: QuizQuestion[];
}

export function assembleListeningExamA(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  targetCount: number = OET_LISTENING.partA,
): ListeningExamASet {
  const blocks = shuffleWithSeed(
    blocksForUserPart("A").filter((b) => (b.questions?.length ?? 0) > 0),
    seed,
  );

  const sections: ListeningExamASet["sections"] = [];
  const allQuestions: QuizQuestion[] = [];

  for (const block of blocks) {
    if (allQuestions.length >= targetCount) break;
    const needed = targetCount - allQuestions.length;
    const slice = block.questions
      .slice(0, Math.min(PART_A_QUESTIONS_PER_BLOCK, needed))
      .map((q) => ({ ...q, part: "A" as const }));
    if (!slice.length) continue;
    sections.push({ block, questions: slice });
    allQuestions.push(...slice);
  }

  return { sections, allQuestions };
}

export function assembleListeningExamBC(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
): ListeningExamBCSet {
  const bBlocks = shuffleWithSeed(
    blocksForUserPart("B").filter((b) => (b.questions?.length ?? 0) > 0),
    seed,
  ).slice(0, OET_LISTENING.partB);

  const partBExtracts: ListeningPartBExtract[] = bBlocks.map((block, index) => ({
    key: `${block.id}-${block.questions[0]!.id}`,
    index: index + 1,
    block,
    question: { ...block.questions[0]!, part: "B" as const },
  }));

  const cBlocks = shuffleWithSeed(
    blocksForUserPart("C").filter((b) => (b.questions?.length ?? 0) > 0),
    seed + 11,
  );

  const partCQuestions: QuizQuestion[] = [];
  let idx = 0;
  while (partCQuestions.length < OET_LISTENING.partC && cBlocks.length > 0) {
    const block = cBlocks[idx % cBlocks.length]!;
    const q = block.questions.find((item) => !partCQuestions.some((p) => p.id === item.id));
    if (q) partCQuestions.push({ ...q, part: "C" as const });
    idx += 1;
    if (idx > cBlocks.length * 24) break;
  }

  const partCBlockIds = [
    ...new Set(
      partCQuestions
        .map((q) => cBlocks.find((b) => b.questions.some((bq) => bq.id === q.id))?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const partCBlocks = partCBlockIds.map((id) => {
    const block = getListeningBlock(id)!;
    return {
      ...block,
      questions: partCQuestions.filter((q) => block.questions.some((bq) => bq.id === q.id)),
    };
  });

  return {
    partBExtracts,
    partCBlocks,
    allQuestions: [
      ...partBExtracts.map((e) => e.question),
      ...partCQuestions,
    ],
  };
}
