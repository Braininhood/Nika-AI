"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PassagePanel } from "@/components/reading/passage-panel";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { ReadingTimerBar } from "@/components/reading/reading-timer-bar";
import { OET_READING } from "@/lib/exam/oet-counts";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";
import {
  assembleReadingExamA,
  type ReadingExamASet,
} from "@/lib/reading/exam-assembly";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

export default function ReadingExamPartAPage() {
  const { session, loading } = useAuth();
  const [examSet, setExamSet] = useState<ReadingExamASet | null>(null);
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
        assembleReadingExamA(profile?.profession, profile?.targetCountry, seed),
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
      mode: "part_a",
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
        backHref="/reading/exam/part-a"
        questions={questions}
      />
    );
  }

  if (!examSet) {
    return <p className="py-8 text-sm text-ink-soft">Loading Part A exam…</p>;
  }

  const target = OET_READING.partA;
  const count = examSet.allQuestions.length;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Reading exam — Part A</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {count} matching questions across {examSet.sections.length} text sets (Text A–D each) ·{" "}
          {OET_READING.partAMinutes}-minute exam lock (real OET: {target} questions).
        </p>
        {count < target ? (
          <p className="mt-2 text-xs text-amber-700">
            Content pool has {count} of {target} questions — more Part A passages are being added.
          </p>
        ) : null}
      </header>

      <ReadingExamBriefing part="A" compact />

      <ReadingTimerBar mode="part_a" locked={locked} onExpire={() => setLocked(true)} />

      {examSet.sections.map(({ block, questions: sectionQs }, index) => (
        <section key={block.id} className="space-y-4">
          <p className="text-xs font-semibold uppercase text-brand-primary">
            Text set {index + 1} of {examSet.sections.length}
          </p>
          <PassagePanel block={block} collapsible defaultOpen={index === 0} />
          <QuizQuestionList
            questions={sectionQs}
            responses={responses}
            disabled={locked}
            onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
          />
        </section>
      ))}

      <button
        type="button"
        disabled={!allAnswered || submitting || locked}
        onClick={() => void handleSubmit()}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : `Submit Part A (${count} questions)`}
      </button>

      <p className="text-center text-xs text-ink-soft">
        Next:{" "}
        <Link href="/reading/exam" className="text-brand-primary underline">
          Parts B &amp; C exam (45 min)
        </Link>{" "}
        ·{" "}
        <Link href="/reading/exam/full" className="text-brand-primary underline">
          Full reading exam (60 min)
        </Link>
      </p>
    </div>
  );
}
