import type { OetProfession } from "@/lib/domain/types";

export type ReadingPart = "A" | "B" | "C";

export type ReadingCountryCode = "UK" | "AU" | "US" | "IE" | "NZ" | "CA";

export type QuestionType =
  | "mcq"
  | "gap_fill"
  | "matching"
  | "ordering"
  | "true_false"
  | "short_answer";

export interface ReadingBlock {
  id: string;
  part: ReadingPart;
  title: string;
  paragraphs: string[];
  durationMinutes: number;
  /** Primary profession audience; "all" = any profession */
  profession: "all" | OetProfession;
  /** Locale flavour — ALL = universal workplace English */
  countryCode: ReadingCountryCode | "ALL";
  difficulty: 1 | 2 | 3;
  tags: string[];
  /** Shown in UI — e.g. "NHS trust · United Kingdom" */
  localeContext?: string;
  questions: QuizQuestion[];
}

/** @deprecated Use ReadingBlock */
export type ReadingPassage = Omit<ReadingBlock, "questions">;

export interface QuizQuestion {
  id: string;
  skill: "listening" | "reading" | "writing" | "speaking" | "vocab" | "criteria";
  part?: ReadingPart;
  profession: "all" | OetProfession;
  countryCode?: ReadingCountryCode | "ALL";
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  tags: string[];
  passageId?: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  criteriaLink?: string;
}

export const READING_COUNTRY_LABELS: Record<ReadingCountryCode, string> = {
  UK: "United Kingdom",
  AU: "Australia",
  US: "United States",
  IE: "Ireland",
  NZ: "New Zealand",
  CA: "Canada",
};
