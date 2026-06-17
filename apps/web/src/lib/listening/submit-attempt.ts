import type { ListeningBlock } from "@/content/listening";
import { applyListeningResult, scoreQuiz } from "@/lib/quiz/engine";
import { saveFlashcardsFromWrongQuestions } from "@/lib/quiz/flashcards";
import { db } from "@/lib/db";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";
import type { QuizQuestion } from "@/content/reading/types";

export interface ListeningSubmitInput {
  block?: ListeningBlock;
  questions: QuizQuestion[];
  responses: Record<string, string | string[]>;
  mode?: "part_a" | "part_b" | "part_c" | "exam";
  importedAnswerKey?: Record<string, string>;
}

export interface ListeningSubmitResult {
  attemptId: string;
  score: ReturnType<typeof scoreQuiz>;
  flashcardsAdded: number;
  skillMapUpdated: boolean;
  usedImportedKey: boolean;
}

export async function submitListeningAttempt(
  input: ListeningSubmitInput,
): Promise<ListeningSubmitResult> {
  const { block, questions, responses, mode = "part_b", importedAnswerKey } = input;
  const score = scoreQuiz(questions, responses, importedAnswerKey);
  const attemptId = crypto.randomUUID();

  const wrongIds = score.answers.filter((a) => !a.correct).map((a) => a.questionId);
  const flashcardsAdded = await saveFlashcardsFromWrongQuestions(questions, wrongIds);

  let skillMapUpdated = false;
  const profile = await loadUserProfile();
  if (profile?.skillMap) {
    const correctTags = score.answers.filter((a) => a.correct).flatMap((a) => a.tags);
    const updated = applyListeningResult(
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
    skill: "listening",
    part: block?.part ?? questions[0]?.part,
    scenarioId: block?.id,
    scoreRaw: {
      mode,
      accuracy: score.accuracy,
      correct: score.correct,
      total: score.total,
      wrongTags: score.wrongTags,
      questionIds: questions.map((q) => q.id),
      usedImportedKey: Boolean(importedAnswerKey && Object.keys(importedAnswerKey).length),
    },
    createdAt: Date.now(),
    synced: false,
  });

  await db.progress.put({
    id: attemptId,
    skill: "listening",
    score: Math.round(score.accuracy * 100),
    tags: score.wrongTags,
    createdAt: Date.now(),
  });

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  return {
    attemptId,
    score,
    flashcardsAdded,
    skillMapUpdated,
    usedImportedKey: Boolean(importedAnswerKey && Object.keys(importedAnswerKey).length),
  };
}
