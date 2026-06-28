import type { QuizQuestion, ReadingBlock } from "@/content/reading";
import { applyReadingResult, scoreQuiz } from "@/lib/quiz/engine";
import { saveFlashcardsFromWrongQuestions } from "@/lib/quiz/flashcards";
import { db } from "@/lib/db";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";

export interface ReadingSubmitInput {
  block?: ReadingBlock;
  questions: QuizQuestion[];
  responses: Record<string, string | string[]>;
  mode?: "part_a" | "part_b" | "part_c" | "adaptive_quiz" | "clever_quiz";
}

export interface ReadingSubmitResult {
  attemptId: string;
  score: ReturnType<typeof scoreQuiz>;
  flashcardsAdded: number;
  skillMapUpdated: boolean;
}

export async function submitReadingAttempt(
  input: ReadingSubmitInput,
): Promise<ReadingSubmitResult> {
  const { block, questions, responses, mode = "adaptive_quiz" } = input;
  const score = scoreQuiz(questions, responses);
  const attemptId = crypto.randomUUID();

  const wrongIds = score.answers.filter((a) => !a.correct).map((a) => a.questionId);
  const flashcardsAdded = await saveFlashcardsFromWrongQuestions(questions, wrongIds);

  let skillMapUpdated = false;
  const profile = await loadUserProfile();
  if (profile?.skillMap) {
    const correctTags = score.answers.filter((a) => a.correct).flatMap((a) => a.tags);
    const updated = applyReadingResult(
      profile.skillMap,
      score.accuracy,
      score.wrongTags,
      correctTags,
    );
    await saveSkillMap(updated);
    skillMapUpdated = true;
    window.dispatchEvent(new CustomEvent("oet-skill-map-updated"));
  }

  const { refreshAdaptiveState } = await import("@/lib/adaptive/service");
  void refreshAdaptiveState();

  await db.attempts.put({
    id: attemptId,
    skill: "reading",
    part: block?.part ?? questions[0]?.part,
    scenarioId: block?.id,
    scoreRaw: {
      mode,
      accuracy: score.accuracy,
      correct: score.correct,
      total: score.total,
      wrongTags: score.wrongTags,
      questionIds: questions.map((q) => q.id),
    },
    createdAt: Date.now(),
    synced: false,
  });

  const { notifyStudyDataChanged } = await import("@/lib/sync/notify-study-sync");
  notifyStudyDataChanged();

  await db.progress.put({
    id: attemptId,
    skill: "reading",
    score: Math.round(score.accuracy * 100),
    tags: score.wrongTags,
    createdAt: Date.now(),
  });

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  return { attemptId, score, flashcardsAdded, skillMapUpdated };
}
