/** Sourced from docs/01-OET-RESEARCH/04-writing-deep-dive.md — exam-faithful reference. */
export const OET_WRITING_OVERVIEW = {
  readingMinutes: 5,
  writingMinutes: 40,
  totalMinutes: 45,
  wordMin: 150,
  wordMax: 220,
  criteriaCount: 6,
  criteria: [
    "Purpose",
    "Content",
    "Conciseness & Clarity",
    "Genre & Style",
    "Organisation & Layout",
    "Language",
  ] as const,
} as const;

export function writingExamSummary(): string {
  return `${OET_WRITING_OVERVIEW.readingMinutes} min read case notes · ${OET_WRITING_OVERVIEW.writingMinutes} min write · ${OET_WRITING_OVERVIEW.wordMin}–${OET_WRITING_OVERVIEW.wordMax} words`;
}
