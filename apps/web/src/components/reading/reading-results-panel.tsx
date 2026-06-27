"use client";

import Link from "next/link";

import { NikaAvatar } from "@/components/nika/nika-avatar";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { QuizQuestion, ReadingBlock } from "@/content/reading";
import { tipsForPart } from "@/lib/reading/exam-guide";
import type { QuizScoreResult } from "@/lib/quiz/engine";
import {
  coachingForWrongAnswer,
  formatAnswerDisplay,
  nikaQuizSummary,
  sortAnswersForReview,
  studyTipsForQuiz,
} from "@/lib/quiz/coaching";

interface ReadingResultsPanelProps {
  score: QuizScoreResult;
  flashcardsAdded: number;
  skillMapUpdated: boolean;
  backHref?: string;
  block?: ReadingBlock;
  questions?: QuizQuestion[];
}

function correctAnswerDisplay(q: QuizQuestion | undefined): string {
  if (!q) return "";
  if (typeof q.correctAnswer === "string") return q.correctAnswer;
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer.join(", ");
  return "";
}

export function ReadingResultsPanel({
  score,
  flashcardsAdded,
  skillMapUpdated,
  backHref = "/reading",
  block,
  questions = [],
}: ReadingResultsPanelProps) {
  const pct = Math.round(score.accuracy * 100);
  const part = block?.part ?? questions[0]?.part ?? "B";
  const studyTips = studyTipsForQuiz(score, questions).length
    ? studyTipsForQuiz(score, questions)
    : tipsForPart(part, score.wrongTags);
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const wrongCount = score.total - score.correct;
  const sortedAnswers = sortAnswersForReview(score.answers);
  const nikaMessage = nikaQuizSummary(score, questions);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-xl font-bold text-ink">Results</h2>
        <p className="mt-2 text-3xl font-bold text-brand-primary">
          {score.correct}/{score.total}{" "}
          <span className="text-lg font-semibold text-ink-soft">({pct}%)</span>
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          OET uses 42 weighted items — treat this as practice accuracy, not a predicted grade.
        </p>
        {skillMapUpdated && (
          <p className="mt-2 text-sm text-forest">
            Skill Map updated — Today&apos;s plan will reflect your reading focus.
          </p>
        )}
        {flashcardsAdded > 0 && (
          <p className="mt-1 text-sm text-ink-soft">
            {flashcardsAdded} flashcard{flashcardsAdded === 1 ? "" : "s"} added —{" "}
            <Link href="/reading/flashcards" className="text-brand-primary hover:underline">
              review now (SM-2)
            </Link>
          </p>
        )}
        {score.wrongTags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-ink-soft">Tags to strengthen</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {score.wrongTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-surface-muted px-2 py-1 text-xs text-ink"
                >
                  {tag.replace(/^(reading|listening|writing|speaking|vocab):/, "")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {wrongCount > 0 ? (
        <section className="flex items-start gap-4 rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/25 p-5">
          <NikaAvatar size="sm" state="thinking" glow={0.4} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">Nika&apos;s coaching</p>
            <p className="mt-1 leading-relaxed text-ink-soft">{nikaMessage}</p>
          </div>
        </section>
      ) : null}

      {score.answers.length > 0 && (
        <CollapsibleSection
          title="Answer review"
          subtitle={`${wrongCount} incorrect · ${score.correct} correct`}
          defaultOpen={wrongCount > 0}
        >
          <p className="mb-4 text-xs text-ink-soft">
            Incorrect items first — your answer, the correct answer, and why.
          </p>
          <ul className="space-y-4">
            {sortedAnswers.map((answer, i) => {
              const q = questionMap.get(answer.questionId);
              const correctStr = correctAnswerDisplay(q);
              const userStr = formatAnswerDisplay(answer.userAnswer);
              const coaching = coachingForWrongAnswer(q, answer);

              return (
                <li
                  key={answer.questionId}
                  className={`rounded-xl border p-3 text-sm ${
                    answer.correct ? "border-forest/30 bg-forest/5" : "border-danger/30 bg-danger/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">
                      {i + 1}. {q?.prompt ?? answer.questionId}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        answer.correct
                          ? "bg-forest/15 text-forest"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {answer.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  {!answer.correct ? (
                    <div className="mt-2 space-y-1 text-xs">
                      <p>
                        <span className="font-semibold text-ink">Your answer:</span>{" "}
                        <span className="text-danger">{userStr}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Correct answer:</span>{" "}
                        <span className="text-forest">{correctStr || "—"}</span>
                      </p>
                      {coaching ? (
                        <p className="mt-2 rounded-lg bg-surface-muted/80 px-2 py-1.5 leading-relaxed text-ink-soft">
                          <span className="font-semibold text-brand-primary">Why:</span> {coaching}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    q?.explanation ? (
                      <p className="mt-2 text-xs text-ink-soft">{q.explanation}</p>
                    ) : null
                  )}
                </li>
              );
            })}
          </ul>
        </CollapsibleSection>
      )}

      {studyTips.length > 0 && score.correct < score.total && (
        <CollapsibleSection
          title="What to study next"
          subtitle={`${studyTips.length} tip${studyTips.length === 1 ? "" : "s"}`}
          defaultOpen={false}
        >
          <ul className="space-y-2 text-xs text-ink-soft">
            {studyTips.map((tip) => (
              <li key={tip.title}>
                <strong className="text-ink">{tip.title}:</strong> {tip.body}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/reading/quiz"
          className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Try another quiz
        </Link>
        <Link
          href={backHref}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Back
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
        >
          View updated plan
        </Link>
      </div>
    </div>
  );
}
