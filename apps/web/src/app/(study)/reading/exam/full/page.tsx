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
  assembleReadingExamBC,
  type ReadingExamASet,
  type ReadingExamBCSet,
} from "@/lib/reading/exam-assembly";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

type FullExamPhase = "part_a" | "part_bc" | "done";

export default function ReadingFullExamPage() {
  const { session, loading } = useAuth();
  const [examA, setExamA] = useState<ReadingExamASet | null>(null);
  const [examBC, setExamBC] = useState<ReadingExamBCSet | null>(null);
  const [phase, setPhase] = useState<FullExamPhase>("part_a");
  const [responsesA, setResponsesA] = useState<Record<string, string | string[]>>({});
  const [responsesBC, setResponsesBC] = useState<Record<string, string | string[]>>({});
  const [lockedA, setLockedA] = useState(false);
  const [lockedBC, setLockedBC] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const seed = createSelectionSeed(session?.user?.id);
      setExamA(assembleReadingExamA(profile?.profession, profile?.targetCountry, seed));
      setExamBC(
        assembleReadingExamBC(profile?.profession, profile?.targetCountry, seed + 99),
      );
    });
  }, [loading, session?.user?.id]);

  const questionsA = useMemo(() => examA?.allQuestions ?? [], [examA]);
  const questionsBC = useMemo(() => examBC?.allQuestions ?? [], [examBC]);
  const allQuestions = useMemo(
    () => [...questionsA, ...questionsBC],
    [questionsA, questionsBC],
  );

  const allAnsweredA =
    questionsA.length > 0 && questionsA.every((q) => responsesA[q.id] !== undefined);
  const allAnsweredBC =
    questionsBC.length > 0 && questionsBC.every((q) => responsesBC[q.id] !== undefined);

  const handleFinishA = () => {
    if (!allAnsweredA && !lockedA) return;
    setPhase("part_bc");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitFull = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      questions: allQuestions,
      responses: { ...responsesA, ...responsesBC },
      mode: "part_c",
    });
    setResult(res);
    setPhase("done");
    setSubmitting(false);
  };

  if (result) {
    return (
      <ReadingResultsPanel
        score={result.score}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        backHref="/reading/exam/full"
        questions={allQuestions}
      />
    );
  }

  if (!examA || !examBC) {
    return <p className="py-8 text-sm text-ink-soft">Loading full reading exam…</p>;
  }

  const totalTarget = OET_READING.partA + OET_READING.partB + OET_READING.partC;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Full reading exam</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Real OET: Part A ({OET_READING.partA} Q · {OET_READING.partAMinutes} min lock) then Parts B
          &amp; C ({OET_READING.partB + OET_READING.partC} Q · {OET_READING.partBcMinutes} min
          shared) · {totalTarget} questions total.
        </p>
        <p className="mt-2 text-xs font-medium text-brand-primary">
          Phase {phase === "part_a" ? "1" : "2"} of 2 —{" "}
          {phase === "part_a" ? "Part A only" : "Parts B & C"}
        </p>
      </header>

      {phase === "part_a" ? (
        <>
          <ReadingExamBriefing part="A" compact />
          <ReadingTimerBar mode="part_a" locked={lockedA} onExpire={() => setLockedA(true)} />

          {examA.sections.map(({ block, questions: sectionQs }, index) => (
            <section key={block.id} className="space-y-4">
              <p className="text-xs font-semibold uppercase text-brand-primary">
                Part A · Text set {index + 1} of {examA.sections.length}
              </p>
              <PassagePanel block={block} collapsible defaultOpen={index === 0} />
              <QuizQuestionList
                questions={sectionQs}
                responses={responsesA}
                disabled={lockedA}
                onChange={(id, value) => setResponsesA((prev) => ({ ...prev, [id]: value }))}
              />
            </section>
          ))}

          <button
            type="button"
            disabled={(!allAnsweredA && !lockedA) || submitting}
            onClick={handleFinishA}
            className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Continue to Parts B &amp; C →
          </button>
        </>
      ) : (
        <>
          <ReadingExamBriefing part="B" compact />
          <ReadingExamBriefing part="C" compact />
          <ReadingTimerBar mode="part_bc" locked={lockedBC} onExpire={() => setLockedBC(true)} />

          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-ink">
              Part B — {examBC.partBQuestionCount} extracts
            </h2>
            {examBC.partBExtracts.map((extract) => (
              <div
                key={extract.key}
                className="space-y-3 rounded-2xl border border-border bg-surface p-4"
              >
                <p className="text-xs font-semibold uppercase text-brand-primary">
                  Extract {extract.index} of {examBC.partBExtracts.length}
                </p>
                <p className="text-sm font-medium text-ink">{extract.title}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {extract.paragraph}
                </p>
                <QuizQuestionList
                  questions={[extract.question]}
                  responses={responsesBC}
                  disabled={lockedBC}
                  onChange={(id, value) => setResponsesBC((prev) => ({ ...prev, [id]: value }))}
                />
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <h2 className="text-sm font-semibold text-ink">
              Part C — {examBC.partCQuestionCount} questions
            </h2>
            {examBC.partCBlocks.map((block) => (
              <div key={block.id} className="space-y-4">
                <PassagePanel block={block} collapsible defaultOpen />
                <QuizQuestionList
                  questions={block.questions}
                  responses={responsesBC}
                  disabled={lockedBC}
                  onChange={(id, value) => setResponsesBC((prev) => ({ ...prev, [id]: value }))}
                />
              </div>
            ))}
          </section>

          <button
            type="button"
            disabled={!allAnsweredBC || submitting || lockedBC}
            onClick={() => void handleSubmitFull()}
            className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            {submitting
              ? "Submitting…"
              : `Submit full exam (${questionsA.length + questionsBC.length} questions)`}
          </button>
        </>
      )}
    </div>
  );
}
