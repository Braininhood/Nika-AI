"use client";

import Link from "next/link";

import type { QuizQuestion, ReadingBlock } from "@/content/reading";
import { tipsForPart } from "@/lib/reading/exam-guide";
import type { QuizScoreResult } from "@/lib/quiz/engine";

interface ReadingResultsPanelProps {
  score: QuizScoreResult;
  flashcardsAdded: number;
  skillMapUpdated: boolean;
  backHref?: string;
  block?: ReadingBlock;
  questions?: QuizQuestion[];
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
  const studyTips = tipsForPart(part, score.wrongTags);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

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
                  {tag.replace(/^reading:/, "")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {score.answers.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-ink">Answer review</h3>
          <ul className="mt-4 space-y-4">
            {score.answers.map((answer, i) => {
              const q = questionMap.get(answer.questionId);
              const correctStr =
                q && typeof q.correctAnswer === "string"
                  ? q.correctAnswer
                  : Array.isArray(q?.correctAnswer)
                    ? q.correctAnswer.join(", ")
                    : "";
              return (
                <li
                  key={answer.questionId}
                  className={`rounded-xl border p-3 text-sm ${
                    answer.correct ? "border-forest/30 bg-forest/5" : "border-danger/30 bg-danger/5"
                  }`}
                >
                  <p className="font-medium text-ink">
                    {i + 1}. {q?.prompt ?? answer.questionId}
                  </p>
                  {!answer.correct && q?.type === "matching" && correctStr && (
                    <p className="mt-1 text-xs text-brand-primary">
                      Source: {correctStr} — re-read that extract for synonyms.
                    </p>
                  )}
                  {!answer.correct && (
                    <p className="mt-1 text-xs text-ink-soft">
                      Correct: {correctStr}. {q?.explanation ?? answer.explanation}
                    </p>
                  )}
                  {answer.correct && (
                    <p className="mt-1 text-xs text-ink-soft">{q?.explanation}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {studyTips.length > 0 && score.correct < score.total && (
        <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/20 p-4">
          <h3 className="text-sm font-semibold text-ink">What to study next</h3>
          <ul className="mt-2 space-y-2 text-xs text-ink-soft">
            {studyTips.map((tip) => (
              <li key={tip.title}>
                <strong className="text-ink">{tip.title}:</strong> {tip.body}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/reading/quiz"
          className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Adaptive quiz
        </Link>
        <Link
          href={backHref}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Back to Reading
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
