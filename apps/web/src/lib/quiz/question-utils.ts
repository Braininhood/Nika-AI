import type { QuizQuestion } from "@/content/reading/types";

/** Ordering where the user must rank all options (correctAnswer is string[]). */
export function isSequenceOrdering(question: QuizQuestion): boolean {
  return question.type === "ordering" && Array.isArray(question.correctAnswer);
}

export function isQuestionAnswered(
  question: QuizQuestion,
  value: string | string[] | undefined,
): boolean {
  if (value === undefined) return false;

  if (isSequenceOrdering(question)) {
    const n = question.options?.length ?? 0;
    return Array.isArray(value) && value.length === n && value.every((v) => v.trim() !== "");
  }

  if (Array.isArray(value)) {
    return value.length > 0 && value.every((v) => v.trim() !== "");
  }

  return String(value).trim() !== "";
}

export function allQuestionsAnswered(
  questions: QuizQuestion[],
  responses: Record<string, string | string[]>,
): boolean {
  return questions.length > 0 && questions.every((q) => isQuestionAnswered(q, responses[q.id]));
}

/** Split listening quick-quiz prompts into context (script/handover) + question line. */
export function splitListeningPrompt(
  prompt: string,
  skill: QuizQuestion["skill"],
): { context: string | null; contextLabel: string | null; question: string } {
  if (skill !== "listening") {
    return { context: null, contextLabel: null, question: prompt };
  }

  const scriptMatch = prompt.match(/^Script:\s*(['"])(.+?)\1\.?\s*([\s\S]+)$/);
  if (scriptMatch) {
    return {
      context: scriptMatch[2],
      contextLabel: "Listen to the script",
      question: scriptMatch[3].trim(),
    };
  }

  const handoverMatch = prompt.match(/^Handover:\s*(.+?)\.\s+([\s\S]+)$/);
  if (handoverMatch) {
    return {
      context: handoverMatch[1],
      contextLabel: "Handover note",
      question: handoverMatch[2].trim(),
    };
  }

  return { context: null, contextLabel: null, question: prompt };
}

/** Build ordered answer from rank picks (1 = first). */
export function sequenceFromRanks(
  options: string[],
  ranks: Record<string, number | "">,
): string[] | null {
  const entries = options
    .map((opt) => ({ opt, rank: ranks[opt] }))
    .filter((e): e is { opt: string; rank: number } => typeof e.rank === "number" && e.rank > 0);

  if (entries.length !== options.length) return null;

  const used = new Set(entries.map((e) => e.rank));
  if (used.size !== options.length) return null;
  if (Math.max(...entries.map((e) => e.rank)) > options.length) return null;

  return [...entries]
    .sort((a, b) => a.rank - b.rank)
    .map((e) => e.opt);
}
