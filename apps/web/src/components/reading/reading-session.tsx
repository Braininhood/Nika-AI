"use client";

import Link from "next/link";
import { useState } from "react";

import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { PassagePanel } from "@/components/reading/passage-panel";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { ReadingTimerBar } from "@/components/reading/reading-timer-bar";
import type { ReadingBlock } from "@/content/reading";
import { partBExamStyleTip } from "@/lib/reading/exam-guide";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";

interface ReadingSessionProps {
  block: ReadingBlock;
  timerMode: "part_a" | "part_bc";
  mode: "part_a" | "part_b" | "part_c";
  backHref: string;
}

export function ReadingSession({ block, timerMode, mode, backHref }: ReadingSessionProps) {
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examStyle, setExamStyle] = useState(block.part === "B");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  const allAnswered = block.questions.every((q) => responses[q.id] !== undefined);
  const visibleQuestions =
    examStyle && block.part === "B"
      ? block.questions.slice(questionIndex, questionIndex + 1)
      : block.questions;

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      block,
      questions: block.questions,
      responses,
      mode,
    });
    setResult(res);
    setSubmitting(false);
  };

  if (result) {
    return (
      <ReadingResultsPanel
        score={result.score}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        backHref={backHref}
        block={block}
        questions={block.questions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Reading
      </Link>

      <ReadingExamBriefing part={block.part} compact />

      <ReadingTimerBar
        mode={timerMode}
        locked={locked}
        onExpire={() => setLocked(true)}
      />

      {block.part === "B" && (
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={examStyle}
            onChange={(e) => {
              setExamStyle(e.target.checked);
              setQuestionIndex(0);
            }}
            className="accent-brand-primary"
          />
          Exam-style view (one MCQ per screen)
        </label>
      )}
      {block.part === "B" && examStyle && (
        <p className="text-xs text-ink-soft">{partBExamStyleTip()}</p>
      )}

      <PassagePanel block={block} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Questions</h3>
          {examStyle && block.part === "B" && block.questions.length > 1 && (
            <span className="text-xs text-ink-soft">
              {questionIndex + 1} / {block.questions.length}
            </span>
          )}
        </div>
        <QuizQuestionList
          questions={visibleQuestions}
          responses={responses}
          disabled={locked}
          onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        />
        {examStyle && block.part === "B" && block.questions.length > 1 && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={questionIndex === 0}
              onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={questionIndex >= block.questions.length - 1}
              onClick={() =>
                setQuestionIndex((i) => Math.min(block.questions.length - 1, i + 1))
              }
              className="rounded-lg border border-border px-3 py-1.5 text-xs disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => void handleSubmit()}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit answers"}
      </button>
    </div>
  );
}
