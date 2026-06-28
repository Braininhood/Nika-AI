"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AccentContextBanner } from "@/components/content/accent-context-banner";
import { ListeningAudioPanel } from "@/components/listening/listening-audio-panel";
import { ListeningExamBriefing } from "@/components/listening/listening-exam-briefing";
import { ListeningResultsPanel } from "@/components/listening/listening-results-panel";
import { ListeningTimerBar } from "@/components/listening/listening-timer-bar";
import { NoteCompletionPanel } from "@/components/listening/note-completion-panel";
import { QuizQuestionField } from "@/components/reading/quiz-question";
import { OET_LISTENING } from "@/lib/exam/oet-counts";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  assembleListeningExamA,
  assembleListeningExamBC,
  type ListeningExamASet,
  type ListeningExamBCSet,
} from "@/lib/listening/exam-assembly";
import { partAExamTip } from "@/lib/listening/exam-guide";
import { submitListeningAttempt } from "@/lib/listening/submit-attempt";
import { loadUserProfile } from "@/lib/profile/service";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

export default function ListeningExamPage() {
  const { session, loading } = useAuth();
  const [examA, setExamA] = useState<ListeningExamASet | null>(null);
  const [examBC, setExamBC] = useState<ListeningExamBCSet | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitListeningAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const seed = createSelectionSeed(session?.user?.id);
      setExamA(assembleListeningExamA(profile?.profession, profile?.targetCountry, seed));
      setExamBC(
        assembleListeningExamBC(profile?.profession, profile?.targetCountry, seed + 33),
      );
    });
  }, [loading, session?.user?.id]);

  const allQuestions = useMemo(
    () => [...(examA?.allQuestions ?? []), ...(examBC?.allQuestions ?? [])],
    [examA, examBC],
  );

  const partBCount = examBC?.partBExtracts.length ?? 0;
  const partCCount = examBC?.allQuestions.filter((q) => q.part === "C").length ?? 0;
  const partACount = examA?.allQuestions.length ?? 0;
  const totalTarget = OET_LISTENING.partA + OET_LISTENING.partB + OET_LISTENING.partC;

  const mapPartAResponses = (): Record<string, string | string[]> => {
    const mapped = { ...responses };
    if (!examA) return mapped;
    for (const { questions: sectionQs } of examA.sections) {
      for (const q of sectionQs) {
        const suffix = q.id.match(/q(\d+)$/)?.[1];
        const fieldKey = suffix ? `q${suffix}` : q.id;
        mapped[q.id] = String(responses[fieldKey] ?? responses[q.id] ?? "");
      }
    }
    return mapped;
  };

  const allAnswered =
    allQuestions.length > 0 &&
    allQuestions.every((q) => {
      const v = mapPartAResponses()[q.id];
      if (Array.isArray(v)) {
        return v.length > 0 && v.every((item) => String(item).trim().length > 0);
      }
      return typeof v === "string" && v.trim().length > 0;
    });

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitListeningAttempt({
      questions: allQuestions,
      responses: mapPartAResponses(),
      mode: "exam",
    });
    setResult(res);
    setSubmitting(false);
  };

  if (result) {
    const summaryBlock = examA?.sections[0]?.block ?? examBC?.partBExtracts[0]?.block;
    if (!summaryBlock) return null;
    return (
      <ListeningResultsPanel
        score={result.score}
        block={summaryBlock}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        usedImportedKey={result.usedImportedKey}
        backHref="/listening/exam"
        questions={allQuestions}
      />
    );
  }

  if (!examA || !examBC) {
    return <p className="py-8 text-sm text-ink-soft">Loading listening exam…</p>;
  }

  const actualTotal = partACount + partBCount + partCCount;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/listening" className="text-sm text-ink-soft hover:text-ink">
        ← Listening hub
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Listening exam — full test</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Part A ({partACount} note completion) · Part B ({partBCount} extracts) · Part C (
          {partCCount} MCQ) · real OET: {totalTarget} questions in {OET_LISTENING.totalMinutes}{" "}
          minutes.
        </p>
        {actualTotal < totalTarget ? (
          <p className="mt-2 text-xs text-amber-700">
            Content pool has {actualTotal} of {totalTarget} questions — more audio blocks are being
            added.
          </p>
        ) : null}
      </header>

      <ListeningExamBriefing part="A" compact />
      <ListeningExamBriefing part="B" compact />
      <ListeningExamBriefing part="C" compact />

      <ListeningTimerBar
        totalMinutes={OET_LISTENING.totalMinutes}
        label={`Full listening exam · ${OET_LISTENING.totalMinutes} min`}
        examMode
        onExpire={() => setLocked(true)}
      />

      <section className="space-y-8">
        <h2 className="text-sm font-semibold text-ink">
          Part A — consultation notes ({partACount} gaps)
        </h2>
        <p className="text-xs text-ink-soft">{partAExamTip()}</p>
        {examA.sections.map(({ block }, index) => (
            <div key={block.id} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase text-brand-primary">
                Consultation {index + 1} of {examA.sections.length}
              </p>
              <p className="text-sm font-medium text-ink">{block.title}</p>
              <AccentContextBanner
                variant="listening"
                accentNote={block.accentNote}
                localeContext={block.localeContext}
                patientAccent={block.patientAccent}
                clinicianAccent={block.clinicianAccent}
                primaryAccent={block.accent}
              />
              <ListeningAudioPanel block={block} examMode />
              <NoteCompletionPanel
                template={block.noteTemplate ?? ""}
                fields={block.noteFields ?? []}
                responses={Object.fromEntries(
                  (block.noteFields ?? []).map((f) => [f.id, String(responses[f.id] ?? "")]),
                )}
                onChange={(fieldId, value) =>
                  !locked && setResponses((prev) => ({ ...prev, [fieldId]: value }))
                }
              />
            </div>
          ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Part B — {partBCount} short extracts</h2>
        {examBC.partBExtracts.map((extract) => (
          <div key={extract.key} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase text-brand-primary">
              Extract {extract.index} of {examBC.partBExtracts.length}
            </p>
            <p className="text-sm font-medium text-ink">{extract.block.title}</p>
            <AccentContextBanner
              variant="listening"
              accentNote={extract.block.accentNote}
              localeContext={extract.block.localeContext}
              primaryAccent={extract.block.accent}
            />
            <ListeningAudioPanel block={extract.block} examMode />
            <QuizQuestionField
              question={extract.question}
              index={extract.index - 1}
              value={responses[extract.question.id]}
              onChange={(v) =>
                !locked && setResponses((prev) => ({ ...prev, [extract.question.id]: v }))
              }
            />
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-semibold text-ink">Part C — {partCCount} questions</h2>
        {examBC.partCBlocks.map((block) => (
          <div key={block.id} className="space-y-4 rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-medium text-ink">{block.title}</p>
            <AccentContextBanner
              variant="listening"
              accentNote={block.accentNote}
              localeContext={block.localeContext}
              primaryAccent={block.accent}
            />
            <ListeningAudioPanel block={block} examMode />
            <div className="space-y-4">
              {block.questions.map((q, i) => (
                <QuizQuestionField
                  key={q.id}
                  question={q}
                  index={i}
                  value={responses[q.id]}
                  onChange={(v) => !locked && setResponses((prev) => ({ ...prev, [q.id]: v }))}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <button
        type="button"
        disabled={!allAnswered || submitting || locked}
        onClick={() => void handleSubmit()}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : `Submit exam (${actualTotal} questions)`}
      </button>
    </div>
  );
}
