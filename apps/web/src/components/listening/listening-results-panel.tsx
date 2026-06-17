"use client";

import Link from "next/link";

import type { ListeningBlock } from "@/content/listening";
import type { QuizQuestion } from "@/content/reading/types";
import type { QuizScoreResult } from "@/lib/quiz/engine";
import { tipsForPart } from "@/lib/listening/exam-guide";

interface ListeningResultsPanelProps {
  score: QuizScoreResult;
  block: ListeningBlock;
  questions: QuizQuestion[];
  flashcardsAdded: number;
  skillMapUpdated: boolean;
  usedImportedKey?: boolean;
  backHref: string;
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
  const tips = tipsForPart(block.part, score.wrongTags);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h2 className="text-xl font-bold text-ink">Results</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {score.correct} / {score.total} correct ({Math.round(score.accuracy * 100)}%)
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

      {tips.length > 0 && (
        <section className="rounded-xl border border-border p-4">
          <h3 className="font-semibold text-ink">Study tips</h3>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">
            {tips.map((tip) => (
              <li key={tip.title}>
                <span className="font-medium text-ink">{tip.title}</span> — {tip.body}
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className="rounded-xl border border-border p-4">
        <summary className="cursor-pointer font-semibold text-ink">Transcript (practice mode)</summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{block.transcript}</p>
      </details>

      <ul className="space-y-2 text-sm">
        {score.answers.map((a, i) => {
          const q = questions.find((x) => x.id === a.questionId);
          return (
            <li
              key={a.questionId}
              className={`rounded-lg border px-3 py-2 ${a.correct ? "border-forest/30" : "border-danger/30"}`}
            >
              <span className="font-medium">{i + 1}. </span>
              {q?.prompt}
              {!a.correct && (
                <p className="mt-1 text-xs text-ink-soft">{q?.explanation}</p>
              )}
            </li>
          );
        })}
      </ul>

      <Link
        href={backHref}
        className="inline-flex rounded-xl bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-ink"
      >
        Back to Listening
      </Link>
    </div>
  );
}
