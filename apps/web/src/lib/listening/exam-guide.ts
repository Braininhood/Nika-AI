import type { ListeningPart } from "@/content/listening/types";

/** Sourced from docs/01-OET-RESEARCH/02-listening-deep-dive.md */
export const OET_LISTENING_OVERVIEW = {
  totalMinutes: 40,
  totalQuestions: 42,
  parts: {
    A: { questions: 24, label: "Consultation extracts — note completion" },
    B: { questions: 6, label: "Short workplace extracts — one MCQ each" },
    C: { questions: 12, label: "Presentation / interview — MCQ sets" },
  },
} as const;

export interface ListeningStudyTip {
  part: ListeningPart | "all";
  title: string;
  body: string;
  tags?: string[];
}

export const LISTENING_STUDY_TIPS: ListeningStudyTip[] = [
  {
    part: "A",
    title: "Abbreviate like a clinician",
    body: "Use standard abbreviations while listening: hx, Rx, BP, PRN. You can expand spelling in answers but write quickly in notes.",
    tags: ["listening:part-a", "listening:part-a-detail"],
  },
  {
    part: "A",
    title: "Spelling counts",
    body: "Drug names and conditions must be spelled correctly for credit. When unsure, listen for letter-by-letter spelling from the speaker.",
    tags: ["listening:spelling"],
  },
  {
    part: "B",
    title: "One clip, one purpose",
    body: "Each Part B extract has a single MCQ about gist, next action, or speaker purpose. Listen for the main point before reading options.",
    tags: ["listening:part-b", "listening:part-b-gist"],
  },
  {
    part: "C",
    title: "Question order follows audio",
    body: "Part C questions follow the sequence of the recording. Note signpost phrases: however, in contrast, the main concern is…",
    tags: ["listening:part-c", "listening:part-c-inference"],
  },
  {
    part: "all",
    title: "Accent rotation",
    body: "OET uses UK, US, Australian, Irish, New Zealand, and Canadian English. Rotate practice clips — do not train on only one accent.",
    tags: ["listening:accent-diversity"],
  },
  {
    part: "A",
    title: "Numbers and drug names under accent",
    body: "When the patient accent differs from yours, listen twice for doses, dates, and spellings. Credit is for clinical content, not accent imitation.",
    tags: ["listening:accent-diversity", "listening:spelling"],
  },
  {
    part: "B",
    title: "Gist across accents",
    body: "Part B tests purpose and next action. Focus on key verbs and outcomes — speaker accent should not change your answer strategy.",
    tags: ["listening:accent-diversity", "listening:part-b-gist"],
  },
];

export function tipsForPart(part: ListeningPart, weakTags: string[] = []): ListeningStudyTip[] {
  const tagged = LISTENING_STUDY_TIPS.filter(
    (tip) =>
      tip.part === part &&
      (!tip.tags?.length || tip.tags.some((t) => weakTags.some((w) => w.includes(t) || t.includes(w)))),
  );
  const general = LISTENING_STUDY_TIPS.filter((tip) => tip.part === part && !tip.tags?.length);
  const fallback = LISTENING_STUDY_TIPS.filter((tip) => tip.part === part);
  return [...tagged, ...general, ...fallback].slice(0, 2);
}

export function partAExamTip(): string {
  return "Part A: complete consultation notes while listening. In exam mode audio plays once — no pause.";
}

export function partBExamStyleTip(): string {
  return "Part B: one short extract per screen, one MCQ — matches the computer-delivered test.";
}
