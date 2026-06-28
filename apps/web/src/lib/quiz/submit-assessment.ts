import type { QuizQuestion } from "@/content/reading/types";
import type { AssessmentSkill } from "@/content/assessment";
import type { OetSkill } from "@/lib/domain/types";
import {
  applyListeningResult,
  applyReadingResult,
  applySpeakingResult,
  scoreQuiz,
} from "@/lib/quiz/engine";
import { applyWritingResultFromQuiz } from "@/lib/quiz/writing-quiz-result";
import { saveFlashcardsFromWrongQuestions } from "@/lib/quiz/flashcards";
import { db } from "@/lib/db";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";

export interface AssessmentSubmitInput {
  questions: QuizQuestion[];
  responses: Record<string, string | string[]>;
  skill: AssessmentSkill | OetSkill;
  mode?: string;
}

export interface AssessmentSubmitResult {
  attemptId: string;
  score: ReturnType<typeof scoreQuiz>;
  flashcardsAdded: number;
  skillMapUpdated: boolean;
}

function skillForAttempt(skill: AssessmentSubmitInput["skill"]): OetSkill {
  if (skill === "vocab" || skill === "mixed") return "reading";
  return skill;
}

export async function submitAssessmentAttempt(
  input: AssessmentSubmitInput,
): Promise<AssessmentSubmitResult> {
  const { questions, responses, skill, mode = "clever_quiz" } = input;
  const score = scoreQuiz(questions, responses);
  const attemptId = crypto.randomUUID();
  const attemptSkill = skillForAttempt(skill);

  const wrongIds = score.answers.filter((a) => !a.correct).map((a) => a.questionId);
  const flashcardsAdded = await saveFlashcardsFromWrongQuestions(questions, wrongIds);

  let skillMapUpdated = false;
  const profile = await loadUserProfile();
  if (profile?.skillMap) {
    const correctTags = score.answers.filter((a) => a.correct).flatMap((a) => a.tags);

    let updated = profile.skillMap;
    if (skill === "listening") {
      updated = applyListeningResult(updated, score.accuracy, score.wrongTags, correctTags);
    } else if (skill === "speaking") {
      updated = applySpeakingResult(updated, score.accuracy, score.wrongTags, correctTags);
    } else if (skill === "writing") {
      updated = applyWritingResultFromQuiz(updated, score.accuracy, score.wrongTags, correctTags);
    } else {
      updated = applyReadingResult(updated, score.accuracy, score.wrongTags, correctTags);
    }

    await saveSkillMap(updated);
    skillMapUpdated = true;
    window.dispatchEvent(new CustomEvent("oet-skill-map-updated"));
  }

  const { refreshAdaptiveState } = await import("@/lib/adaptive/service");
  void refreshAdaptiveState();

  await db.attempts.put({
    id: attemptId,
    skill: attemptSkill,
    scoreRaw: {
      mode,
      assessmentSkill: skill,
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

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  return { attemptId, score, flashcardsAdded, skillMapUpdated };
}
