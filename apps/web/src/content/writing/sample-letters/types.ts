export interface CriterionScore {
  criterion: string;
  grade: "A" | "B" | "C";
  comment: string;
}

export interface AnnotatedParagraph {
  label: string;
  text: string;
  sourceNoteIds: string[];
  notes: string[];
}

export interface GradedSampleLetter {
  id: string;
  scenarioId: string;
  profession: string;
  title: string;
  letterType: string;
  estimatedOverall: "B" | "A" | "C";
  wordCount: number;
  paragraphs: AnnotatedParagraph[];
  criterionScores: CriterionScore[];
  assessorSummary: string;
}

export const OET_CRITERIA = [
  "Purpose",
  "Content",
  "Conciseness & Clarity",
  "Genre & Style",
  "Organisation & Layout",
  "Language",
] as const;
