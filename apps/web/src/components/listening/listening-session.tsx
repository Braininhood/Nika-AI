"use client";

import Link from "next/link";
import { useState } from "react";

import { AccentContextBanner } from "@/components/content/accent-context-banner";
import { ListeningAudioPanel } from "@/components/listening/listening-audio-panel";
import { ListeningExamBriefing } from "@/components/listening/listening-exam-briefing";
import { ListeningResultsPanel } from "@/components/listening/listening-results-panel";
import { ListeningTimerBar } from "@/components/listening/listening-timer-bar";
import { NoteCompletionPanel } from "@/components/listening/note-completion-panel";
import { QuizQuestionField } from "@/components/reading/quiz-question";
import type { ListeningBlock } from "@/content/listening";
import { partAExamTip, partBExamStyleTip } from "@/lib/listening/exam-guide";
import { submitListeningAttempt } from "@/lib/listening/submit-attempt";

interface ListeningSessionProps {
  block: ListeningBlock;
  mode: "part_a" | "part_b" | "part_c";
  backHref: string;
  examMode?: boolean;
  importAudioId?: string;
  importedAnswerKey?: Record<string, string>;
}

export function ListeningSession({
  block,
  mode,
  backHref,
  examMode = false,
  importAudioId,
  importedAnswerKey,
}: ListeningSessionProps) {
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitListeningAttempt>> | null>(
    null,
  );

  const isPartA = block.part === "A";
  const singleQuestionFlow = block.part === "B";
  const visibleQuestions = singleQuestionFlow
    ? block.questions.slice(questionIndex, questionIndex + 1)
    : block.questions;

  const noteFieldIds =
    block.noteFields?.map((f) => f.id) ??
    block.questions.map((q) => q.id.match(/q(\d+)$/)?.[0] ?? q.id);

  const getPartAResponsesForScoring = (): Record<string, string | string[]> => {
    if (!isPartA) return responses;
    const mapped: Record<string, string> = {};
    for (const q of block.questions) {
      const suffix = q.id.match(/q(\d+)$/)?.[1];
      const fieldKey = suffix ? `q${suffix}` : q.id;
      mapped[q.id] = String(responses[fieldKey] ?? responses[q.id] ?? "");
    }
    return mapped;
  };

  const allAnswered = isPartA
    ? noteFieldIds.every((id) => {
        const v = responses[id];
        return typeof v === "string" && v.trim().length > 0;
      })
    : block.questions.every((q) => responses[q.id] !== undefined && responses[q.id] !== "");

  const handleNoteChange = (fieldId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitListeningAttempt({
      block,
      questions: block.questions,
      responses: isPartA ? getPartAResponsesForScoring() : responses,
      mode,
      importedAnswerKey,
    });
    setResult(res);
    setSubmitting(false);
  };

  if (result) {
    return (
      <ListeningResultsPanel
        score={result.score}
        block={block}
        questions={block.questions}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        usedImportedKey={result.usedImportedKey}
        backHref={backHref}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Listening
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">{block.title}</h1>
        <ListeningExamBriefing part={block.part} compact />
      </header>

      <AccentContextBanner
        variant="listening"
        accentNote={block.accentNote}
        localeContext={block.localeContext}
        patientAccent={block.patientAccent}
        clinicianAccent={block.clinicianAccent}
        primaryAccent={block.accent}
      />

      <ListeningTimerBar totalMinutes={block.durationMinutes} label={`Part ${block.part} practice`} />

      <ListeningAudioPanel
        block={block}
        examMode={examMode}
        importAudioId={importAudioId}
      />

      {isPartA && (
        <section>
          <h3 className="mb-2 font-semibold text-ink">Consultation notes</h3>
          <p className="mb-3 text-xs text-ink-soft">{partAExamTip()}</p>
          <NoteCompletionPanel
            template={block.noteTemplate}
            fields={block.noteFields ?? []}
            responses={Object.fromEntries(
              noteFieldIds.map((id) => [id, String(responses[id] ?? "")]),
            )}
            onChange={handleNoteChange}
          />
        </section>
      )}

      {!isPartA && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Questions</h3>
            {singleQuestionFlow && block.questions.length > 1 && (
              <span className="text-xs text-ink-soft">
                {questionIndex + 1} / {block.questions.length}
              </span>
            )}
          </div>
          {block.part === "B" && (
            <p className="mb-3 text-xs text-ink-soft">{partBExamStyleTip()}</p>
          )}
          <div className="space-y-4">
            {visibleQuestions.map((q, i) => (
              <QuizQuestionField
                key={q.id}
                question={q}
                index={singleQuestionFlow ? questionIndex : i}
                value={responses[q.id]}
                onChange={(v) => setResponses((prev) => ({ ...prev, [q.id]: v }))}
              />
            ))}
          </div>
          {singleQuestionFlow && block.questions.length > 1 && (
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
      )}

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
