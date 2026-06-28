"use client";

import Link from "next/link";
import { useState } from "react";

import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { PassagePanel } from "@/components/reading/passage-panel";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { ReadingTimerBar } from "@/components/reading/reading-timer-bar";
import { StudyPageHeader } from "@/components/study/study-page-header";
import type { ReadingBlock } from "@/content/reading";
import { normalizeReadingBlock } from "@/content/reading/blocks/registry";
import { partBExamStyleTip } from "@/lib/reading/exam-guide";
import { OET_READING } from "@/lib/exam/oet-counts";
import type { ReadingTimerMode } from "@/components/reading/reading-timer-bar";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";

interface ReadingSessionProps {
  block: ReadingBlock;
  timerMode?: ReadingTimerMode;
  mode: "part_a" | "part_b" | "part_c";
  backHref: string;
  backLabel?: string;
}

export function ReadingSession({
  block: rawBlock,
  timerMode,
  mode,
  backHref,
  backLabel = "Back",
}: ReadingSessionProps) {
  const block = normalizeReadingBlock(rawBlock);
  const questions = block.questions ?? [];
  const resolvedTimer: ReadingTimerMode =
    timerMode ??
    (block.part === "A" ? "part_a" : block.part === "C" ? "part_c_drill" : "part_b_drill");
  const drillDuration =
    block.part === "B"
      ? Math.max(8 * 60, questions.length * 4 * 60)
      : block.part === "C"
        ? Math.max(15 * 60, questions.length * 5 * 60)
        : undefined;
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examStyle, setExamStyle] = useState(block.part === "B");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  const allAnswered = questions.length > 0 && questions.every((q) => responses[q.id] !== undefined);
  const visibleQuestions =
    examStyle && block.part === "B"
      ? questions.slice(questionIndex, questionIndex + 1)
      : questions;

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      block,
      questions,
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
        questions={questions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StudyPageHeader
        backHref={backHref}
        backLabel={backLabel}
        skill="reading"
        eyebrow={`Reading · Part ${block.part}`}
        title={block.title}
        description={
          <p className="text-sm text-ink-soft">
            {questions.length} question{questions.length === 1 ? "" : "s"} · practice mode
            {block.part === "A" ? (
              <>
                {" "}
                (1 text set · real exam: {OET_READING.partA} questions in{" "}
                {OET_READING.partAMinutes} min)
              </>
            ) : null}
            {block.part === "B" ? (
              <> (real exam: {OET_READING.partB} extracts)</>
            ) : null}
            {block.part === "C" ? (
              <> (real exam: {OET_READING.partC} questions on 2 texts)</>
            ) : null}
            {" · "}
            <Link href={`/reading/exam${block.part === "A" ? "/part-a" : ""}`} className="text-brand-primary underline">
              Full exam mode
            </Link>
          </p>
        }
      />

      <ReadingExamBriefing part={block.part} compact />

      <ReadingTimerBar
        mode={resolvedTimer}
        durationSeconds={drillDuration}
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

      <PassagePanel block={block} collapsible defaultOpen />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Questions</h3>
          {examStyle && block.part === "B" && questions.length > 1 && (
            <span className="text-xs text-ink-soft">
              {questionIndex + 1} / {questions.length}
            </span>
          )}
        </div>
        <QuizQuestionList
          questions={visibleQuestions}
          responses={responses}
          disabled={locked}
          onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        />
        {examStyle && block.part === "B" && questions.length > 1 && (
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
              disabled={questionIndex >= questions.length - 1}
              onClick={() =>
                setQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
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
