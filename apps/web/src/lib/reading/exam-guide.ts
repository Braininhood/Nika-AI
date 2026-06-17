import type { ReadingPart } from "@/content/reading/types";

/** Sourced from docs/01-OET-RESEARCH/03-reading-deep-dive.md — exam-faithful reference. */
export const OET_READING_OVERVIEW = {
  totalMinutes: 60,
  totalQuestions: 42,
  parts: {
    A: { questions: 20, minutes: 15, locked: true, label: "Expeditious reading" },
    B: { questions: 6, minutes: null, label: "Short workplace extracts" },
    C: { questions: 16, minutes: null, label: "Longer professional texts" },
  },
  partBcSharedMinutes: 45,
  partCSuggestedSplit: { text1Minutes: 20, text2Minutes: 25 },
} as const;

export interface ReadingStudyTip {
  part: ReadingPart | "all";
  title: string;
  body: string;
  /** Weak-tag triggers */
  tags?: string[];
}

export const READING_STUDY_TIPS: ReadingStudyTip[] = [
  {
    part: "A",
    title: "Question-first scanning",
    body: "Read the question, then scan all four texts for keywords and synonyms. Do not read every word of every text first — OET Part A rewards speed.",
    tags: ["reading:part-a", "reading:part-a-speed", "reading:scan"],
  },
  {
    part: "A",
    title: "15-minute hard stop",
    body: "In the real exam Part A locks after exactly 15 minutes. Practice with the timer running — if stuck, mark your best guess and move on.",
    tags: ["reading:part-a-speed"],
  },
  {
    part: "B",
    title: "One text, one purpose",
    body: "Each Part B extract has one MCQ about gist, purpose, or next action. Ask: “What is this email or notice mainly doing?” before reading options.",
    tags: ["reading:part-b", "reading:part-b-gist", "reading:skim"],
  },
  {
    part: "B",
    title: "Reject true-but-irrelevant options",
    body: "A statement can be true in the text but not answer the question asked. Match the question stem, not just a familiar phrase.",
    tags: ["reading:part-b-gist"],
  },
  {
    part: "C",
    title: "Question order follows the text",
    body: "Part C questions follow the order of information in the passage. Locate the section first, then eliminate distractors.",
    tags: ["reading:part-c", "reading:part-c-inference"],
  },
  {
    part: "C",
    title: "Attitude and implication language",
    body: "Watch for hedging: “modest but encouraging”, “not without drawbacks”, “remains to be seen” — these signal the writer’s cautious or limited stance.",
    tags: ["reading:inference", "reading:part-c-inference"],
  },
  {
    part: "all",
    title: "Manage the 45-minute block",
    body: "After Part A, you share 45 minutes for Parts B and C. Many candidates allow ~15–20 min for Part B and ~25–30 min for Part C — adjust in exam mode.",
  },
];

export const READING_COMMON_MISTAKES = [
  {
    mistake: "Spending too long on Part A",
    fix: "Use exam mode with auto-lock at 15 minutes. Train micro-drills (5 questions, 5 minutes).",
  },
  {
    mistake: "Reading Part C like a novel",
    fix: "Jump to the question, scan for paraphrases, then read that paragraph in detail.",
  },
  {
    mistake: "Choosing a true but irrelevant option",
    fix: "Underline the question word (purpose, attitude, main point) before selecting.",
  },
  {
    mistake: "Ignoring writer attitude questions",
    fix: "Add Part C inference drills and flashcards from wrong answers.",
  },
];

export function tipsForPart(part: ReadingPart, weakTags: string[] = []): ReadingStudyTip[] {
  const partTips = READING_STUDY_TIPS.filter((t) => t.part === part || t.part === "all");
  if (!weakTags.length) return partTips.slice(0, 3);

  const tagged = READING_STUDY_TIPS.filter(
    (t) => t.tags?.some((tag) => weakTags.some((w) => w.includes(tag) || tag.includes(w))),
  );
  return [...new Set([...tagged, ...partTips])].slice(0, 4);
}

export function timerWarningMessage(mode: "part_a" | "part_bc", remainingSeconds: number): string | null {
  if (mode === "part_a") {
    if (remainingSeconds === 5 * 60) return "5 minutes left — finish current matches.";
    if (remainingSeconds === 2 * 60) return "2 minutes left — guess and move on if stuck.";
    if (remainingSeconds === 60) return "1 minute — Part A will lock soon.";
  }
  if (mode === "part_bc") {
    if (remainingSeconds === 25 * 60) return "~20 min elapsed — consider moving to Part C soon.";
    if (remainingSeconds === 10 * 60) return "10 minutes left in the B+C block.";
  }
  return null;
}

export function partBExamStyleTip(): string {
  return "Computer-delivered OET shows one short text per screen with one question. Use exam-style view below to mimic test conditions.";
}
