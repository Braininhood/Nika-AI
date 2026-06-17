import type { OetProfession } from "@/lib/domain/types";

import type {
  QuestionType,
  QuizQuestion,
  ReadingBlock,
  ReadingCountryCode,
  ReadingPart,
} from "../types";

type ProfessionScope = "all" | OetProfession;
type CountryScope = ReadingCountryCode | "ALL";

interface BlockBase {
  id: string;
  part: ReadingPart;
  title: string;
  paragraphs: string[];
  durationMinutes: number;
  profession?: ProfessionScope;
  countryCode?: CountryScope;
  difficulty?: 1 | 2 | 3;
  tags?: string[];
  localeContext?: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type?: QuestionType;
  difficulty?: 1 | 2 | 3;
  tags?: string[];
}

export function readingBlock(
  base: BlockBase,
  questions: QuestionBase[],
): ReadingBlock {
  const part = base.part;
  const profession = base.profession ?? "all";
  const countryCode = base.countryCode ?? "ALL";
  const partTag = `reading:part-${part.toLowerCase()}`;

  return {
    id: base.id,
    part,
    title: base.title,
    paragraphs: base.paragraphs,
    durationMinutes: base.durationMinutes,
    profession,
    countryCode,
    difficulty: base.difficulty ?? 2,
    tags: base.tags ?? [partTag],
    localeContext: base.localeContext,
    questions: questions.map((q) => ({
      id: q.id,
      skill: "reading" as const,
      part,
      profession,
      countryCode,
      type: q.type ?? "mcq",
      difficulty: q.difficulty ?? 2,
      tags: q.tags ?? base.tags ?? [partTag],
      passageId: base.id,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
  };
}

export function matchingQuestions(
  blockId: string,
  items: { id: string; prompt: string; answer: "Text A" | "Text B" | "Text C" | "Text D"; explanation: string; difficulty?: 1 | 2 | 3 }[],
  tags: string[],
  profession: ProfessionScope = "all",
  countryCode: CountryScope = "ALL",
): QuizQuestion[] {
  const opts = ["Text A", "Text B", "Text C", "Text D"];
  return items.map((item) => ({
    id: item.id,
    skill: "reading" as const,
    part: "A" as const,
    profession,
    countryCode,
    type: "matching" as const,
    difficulty: item.difficulty ?? 2,
    tags,
    passageId: blockId,
    prompt: item.prompt,
    options: opts,
    correctAnswer: item.answer,
    explanation: item.explanation,
  }));
}
