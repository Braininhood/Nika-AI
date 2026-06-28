"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { PassagePanel } from "@/components/reading/passage-panel";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { ReadingTimerBar } from "@/components/reading/reading-timer-bar";
import { OET_READING } from "@/lib/exam/oet-counts";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import {
  assembleReadingExamBC,
  type ReadingExamBCSet,
} from "@/lib/reading/exam-assembly";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

export default function ReadingExamPage() {
  const { session, loading } = useAuth();
  const [examSet, setExamSet] = useState<ReadingExamBCSet | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const seed = createSelectionSeed(session?.user?.id);
      setExamSet(
        assembleReadingExamBC(profile?.profession, profile?.targetCountry, seed),
      );
    });
  }, [loading, session?.user?.id]);

  const questions = useMemo(() => examSet?.allQuestions ?? [], [examSet]);
  const allAnswered =
    questions.length > 0 && questions.every((q) => responses[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      questions,
      responses,
      mode: "part_b",
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
        backHref="/reading/exam"
        questions={questions}
      />
    );
  }

  if (!examSet) {
    return <p className="py-8 text-sm text-ink-soft">Loading exam passages…</p>;
  }

  const totalQ = examSet.partBQuestionCount + examSet.partCQuestionCount;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Reading exam — Parts B &amp; C</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {examSet.partBQuestionCount} Part B extracts · {examSet.partCQuestionCount} Part C
          questions · {totalQ} total · shared {OET_READING.partBcMinutes}-minute block (real OET:{" "}
          {OET_READING.partB}+{OET_READING.partC} = {OET_READING.partB + OET_READING.partC}{" "}
          questions).
        </p>
        {examSet.partCQuestionCount < OET_READING.partC ? (
          <p className="mt-2 text-xs text-amber-700">
            Part C pool has {examSet.partCQuestionCount} of {OET_READING.partC} questions — more
            passages coming soon.
          </p>
        ) : null}
      </header>

      <ReadingExamBriefing part="B" compact />
      <ReadingExamBriefing part="C" compact />

      <ReadingTimerBar mode="part_bc" locked={locked} onExpire={() => setLocked(true)} />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">
          Part B — {examSet.partBQuestionCount} workplace extracts
        </h2>
        <p className="text-xs text-ink-soft">
          Real exam: one short text per screen, one MCQ each. Allow ~15–20 minutes for this section.
        </p>
        {examSet.partBExtracts.map((extract) => (
          <div key={extract.key} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase text-brand-primary">
              Extract {extract.index} of {examSet.partBExtracts.length}
            </p>
            <p className="text-sm font-medium text-ink">{extract.title}</p>
            {extract.localeContext ? (
              <p className="text-xs text-brand-primary">{extract.localeContext}</p>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{extract.paragraph}</p>
            <QuizQuestionList
              questions={[extract.question]}
              responses={responses}
              disabled={locked}
              onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
            />
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold text-ink">
          Part C — {examSet.partCBlocks.length} longer texts
        </h2>
        <p className="text-xs text-ink-soft">
          Real exam: two texts, questions follow passage order. Allow ~25–30 minutes for Part C.
        </p>
        {examSet.partCBlocks.map((block) => (
          <div key={block.id} className="space-y-4">
            <PassagePanel block={block} collapsible defaultOpen />
            <QuizQuestionList
              questions={block.questions}
              responses={responses}
              disabled={locked}
              onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
            />
          </div>
        ))}
      </section>

      <p className="text-center text-xs text-ink-soft">
        <Link href="/reading/exam/part-a" className="text-brand-primary underline">
          Part A exam (15 min)
        </Link>{" "}
        ·{" "}
        <Link href="/reading/exam/full" className="text-brand-primary underline">
          Full reading exam (60 min)
        </Link>
      </p>

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => void handleSubmit()}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : `Submit exam (${totalQ} questions)`}
      </button>
    </div>
  );
}
