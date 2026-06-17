import type { QuizQuestion } from "@/content/reading/types";
import { db } from "@/lib/db";
import type { GeneratedAssessmentRecord } from "@/lib/vocabulary/types";

export function apiQuestionToQuiz(q: Record<string, unknown>): QuizQuestion {
  return {
    id: String(q.id ?? crypto.randomUUID()),
    skill: (q.skill as QuizQuestion["skill"]) ?? "reading",
    profession: "all",
    type: (q.type as QuizQuestion["type"]) ?? "mcq",
    difficulty: 2,
    tags: Array.isArray(q.tags) ? (q.tags as string[]) : ["nika:generated"],
    prompt: String(q.prompt ?? ""),
    options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
    correctAnswer: (q.correctAnswer as string | string[]) ?? "",
    explanation: String(q.explanation ?? ""),
  };
}

export async function saveGeneratedAssessment(input: {
  id: string;
  title: string;
  skill: string;
  questions: Record<string, unknown>[];
}): Promise<GeneratedAssessmentRecord> {
  const record: GeneratedAssessmentRecord = {
    id: input.id,
    title: input.title,
    skill: input.skill,
    questions: input.questions,
    createdAt: Date.now(),
  };
  await db.generatedAssessments.put(record);
  return record;
}

export async function loadGeneratedAssessment(
  id: string,
): Promise<GeneratedAssessmentRecord | undefined> {
  return db.generatedAssessments.get(id);
}

export async function markAssessmentComplete(id: string): Promise<void> {
  const existing = await db.generatedAssessments.get(id);
  if (!existing) return;
  await db.generatedAssessments.put({
    ...existing,
    completedAt: Date.now(),
  });
}

export function questionsFromAssessment(record: GeneratedAssessmentRecord): QuizQuestion[] {
  return record.questions.map(apiQuestionToQuiz);
}
