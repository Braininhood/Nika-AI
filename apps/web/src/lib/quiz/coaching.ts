import { formatReadingTagLabel } from "@/content/reading";
import type { QuizQuestion } from "@/content/reading/types";
import { tipsForPart as readingTipsForPart } from "@/lib/reading/exam-guide";
import { tipsForPart as listeningTipsForPart } from "@/lib/listening/exam-guide";
import type { QuizScoreResult, ScoredAnswer } from "@/lib/quiz/engine";

export function formatAnswerDisplay(value: string | string[] | undefined): string {
  if (value === undefined || value === "") return "— (no answer)";
  if (Array.isArray(value)) return value.join(", ");
  return value;
}

function skillFromQuestion(q: QuizQuestion | undefined): string {
  return q?.skill ?? "reading";
}

function partFromQuestion(q: QuizQuestion | undefined): "A" | "B" | "C" {
  return q?.part ?? "B";
}

function correctAnswerDisplay(q: QuizQuestion | undefined): string {
  if (!q) return "";
  if (typeof q.correctAnswer === "string") return q.correctAnswer;
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer.join(", ");
  return "";
}

export function coachingForWrongAnswer(
  q: QuizQuestion | undefined,
  answer: ScoredAnswer,
): string {
  if (!q || answer.correct) return "";

  const correct = correctAnswerDisplay(q);
  const parts: string[] = [];

  if (q.type === "matching" && correct) {
    parts.push(`Re-read the extract labelled "${correct}" and look for synonyms of key words in the question.`);
  } else if (q.type === "ordering") {
    parts.push("Check logical sequence — introductions before conclusions, assessment before action.");
  } else if (q.type === "gap_fill") {
    parts.push("Gap-fill items often test collocations and fixed phrases from the passage or script.");
  } else if (q.type === "true_false") {
    parts.push("True/false traps use words like always, never, or only — compare them strictly to the text.");
  } else if (correct) {
    parts.push(`The best option was "${correct}". Eliminate answers that add, omit, or exaggerate what the text says.`);
  }

  if (q.explanation) parts.push(q.explanation);

  return parts.join(" ");
}

export function nikaQuizSummary(
  score: QuizScoreResult,
  questions: QuizQuestion[],
): string {
  const pct = Math.round(score.accuracy * 100);
  const wrongCount = score.total - score.correct;
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  if (wrongCount === 0) {
    return `Strong set — ${pct}% correct. Keep this pace and try a timed block next so exam pressure feels familiar.`;
  }

  const topTag = score.wrongTags[0];
  const firstWrong = score.answers.find((a) => !a.correct);
  const firstQ = firstWrong ? questionMap.get(firstWrong.questionId) : undefined;
  const skill = skillFromQuestion(firstQ);
  const tagLabel = topTag ? formatReadingTagLabel(topTag) : "this question type";

  if (skill === "listening") {
    return `${wrongCount} of ${score.total} need another pass. Focus on ${tagLabel} — note the exact wording in the script before you choose. Replay the clip mentally and ask: "Did the speaker actually say this, or am I assuming?"`;
  }

  if (skill === "writing") {
    return `${wrongCount} of ${score.total} missed writing-criteria points. ${tagLabel} — in letters, examiners reward clear purpose, relevant facts only, and formal register. Review the explanation under each red item below.`;
  }

  if (skill === "speaking") {
    return `${wrongCount} of ${score.total} touched speaking communication skills. ${tagLabel} — in role-plays, acknowledge the patient's concern before giving information, then check understanding.`;
  }

  return `${wrongCount} of ${score.total} need review. Your Skill Map flagged ${tagLabel} — read the "Why" under each incorrect item, then redo a short quiz on that part.`;
}

export function studyTipsForQuiz(
  score: QuizScoreResult,
  questions: QuizQuestion[],
): { title: string; body: string }[] {
  if (score.correct >= score.total) return [];

  const firstQ = questions[0];
  const skill = skillFromQuestion(firstQ);
  const part = partFromQuestion(firstQ);

  if (skill === "listening") {
    return listeningTipsForPart(part, score.wrongTags).slice(0, 3);
  }

  if (skill === "reading" || !firstQ?.skill || firstQ.skill === "reading") {
    return readingTipsForPart(part, score.wrongTags).slice(0, 3);
  }

  return [];
}

export function sortAnswersForReview(
  answers: ScoredAnswer[],
): ScoredAnswer[] {
  return [...answers].sort((a, b) => {
    if (a.correct === b.correct) return 0;
    return a.correct ? 1 : -1;
  });
}
