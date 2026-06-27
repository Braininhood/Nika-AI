"use client";

import Link from "next/link";

import { NikaAvatar } from "@/components/nika/nika-avatar";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { ListeningBlock } from "@/content/listening";
import type { QuizQuestion } from "@/content/reading/types";
import type { QuizScoreResult } from "@/lib/quiz/engine";
import {
  coachingForWrongAnswer,
  formatAnswerDisplay,
  nikaQuizSummary,
  sortAnswersForReview,
  studyTipsForQuiz,
} from "@/lib/quiz/coaching";

interface ListeningResultsPanelProps {
  score: QuizScoreResult;
  block: ListeningBlock;
  questions: QuizQuestion[];
  flashcardsAdded: number;
  skillMapUpdated: boolean;
  usedImportedKey?: boolean;
  backHref: string;
}

function correctAnswerDisplay(q: QuizQuestion | undefined): string {
  if (!q) return "";
  if (typeof q.correctAnswer === "string") return q.correctAnswer;
  if (Array.isArray(q.correctAnswer)) return q.correctAnswer.join(", ");
  return "";
}

export function ListeningResultsPanel({
  score,
  block,
  questions,
  flashcardsAdded,
  skillMapUpdated,
  usedImportedKey,
  backHref,
}: ListeningResultsPanelProps) {
  const tips = studyTipsForQuiz(score, questions);
  const sortedAnswers = sortAnswersForReview(score.answers);
  const wrongCount = score.total - score.correct;
  const nikaMessage = nikaQuizSummary(score, questions);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-xl font-bold text-ink">Results</h2>
        <p className="mt-2 text-3xl font-bold text-brand-primary">
          {score.correct}/{score.total}{" "}
          <span className="text-lg font-semibold text-ink-soft">
            ({Math.round(score.accuracy * 100)}%)
          </span>
        </p>
        {usedImportedKey && (
          <p className="mt-1 text-xs text-brand-primary">Scored using your imported answer key</p>
        )}
        <p className="mt-2 text-xs text-ink-soft">
          OET Listening has 42 weighted items — raw % is practice feedback only, not an OET grade.
        </p>
      </header>

      {skillMapUpdated && (
        <p className="rounded-lg bg-forest/10 px-3 py-2 text-sm text-forest">
          Skill Map updated — Today&apos;s plan will adapt.
        </p>
      )}

      {flashcardsAdded > 0 && (
        <p className="text-sm text-ink-soft">
          {flashcardsAdded} flashcard{flashcardsAdded === 1 ? "" : "s"} added from wrong answers.
        </p>
      )}

      {wrongCount > 0 ? (
        <section className="flex items-start gap-4 rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/25 p-5">
          <NikaAvatar size="sm" state="thinking" glow={0.4} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-ink">Nika&apos;s coaching</p>
            <p className="mt-1 leading-relaxed text-ink-soft">{nikaMessage}</p>
          </div>
        </section>
      ) : null}

      {tips.length > 0 && (
        <CollapsibleSection
          title="Study tips"
          subtitle={`${tips.length} tip${tips.length === 1 ? "" : "s"}`}
          defaultOpen={false}
        >
          <ul className="space-y-2 text-sm text-ink-soft">
            {tips.map((tip) => (
              <li key={tip.title}>
                <span className="font-medium text-ink">{tip.title}</span> — {tip.body}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Transcript" subtitle="Practice mode only" defaultOpen={false}>
        <p className="whitespace-pre-wrap text-sm text-ink-soft">{block.transcript}</p>
      </CollapsibleSection>

      <CollapsibleSection
        title="Answer review"
        subtitle={`${wrongCount} incorrect · ${score.correct} correct`}
        defaultOpen={wrongCount > 0}
      >
        <ul className="space-y-3 text-sm">
          {sortedAnswers.map((a, i) => {
            const q = questions.find((x) => x.id === a.questionId);
            const coaching = coachingForWrongAnswer(q, a);
            return (
              <li
                key={a.questionId}
                className={`rounded-xl border px-3 py-2.5 ${
                  a.correct ? "border-forest/30 bg-forest/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                <p className="font-medium text-ink">
                  {i + 1}. {q?.prompt}
                </p>
                {!a.correct ? (
                  <div className="mt-2 space-y-1 text-xs">
                    <p>
                      <span className="font-semibold text-ink">Your answer:</span>{" "}
                      <span className="text-danger">{formatAnswerDisplay(a.userAnswer)}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Correct answer:</span>{" "}
                      <span className="text-forest">{correctAnswerDisplay(q)}</span>
                    </p>
                    {coaching ? (
                      <p className="mt-1 text-ink-soft">
                        <span className="font-semibold text-brand-primary">Why:</span> {coaching}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  q?.explanation ? (
                    <p className="mt-1 text-xs text-ink-soft">{q.explanation}</p>
                  ) : null
                )}
              </li>
            );
          })}
        </ul>
      </CollapsibleSection>

      <Link
        href={backHref}
        className="inline-flex rounded-xl bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-ink"
      >
        Back to Listening
      </Link>
    </div>
  );
}
