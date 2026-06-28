"use client";

import { useEffect, useMemo, useState } from "react";

import { AccentContextBanner } from "@/components/content/accent-context-banner";
import { ListeningAudioPanel } from "@/components/listening/listening-audio-panel";
import { ListeningResultsPanel } from "@/components/listening/listening-results-panel";
import { NoteCompletionPanel } from "@/components/listening/note-completion-panel";
import { QuizQuestionField } from "@/components/reading/quiz-question";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { partFromWeakTag } from "@/content/listening";
import { useAuth } from "@/lib/auth/auth-provider";
import { OET_LISTENING } from "@/lib/exam/oet-counts";
import {
  assembleListeningExamA,
  assembleListeningExamBC,
} from "@/lib/listening/exam-assembly";
import { loadUserProfile } from "@/lib/profile/service";
import { submitListeningAttempt } from "@/lib/listening/submit-attempt";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

interface ListeningCleverExamSessionProps {
  weakTags: string[];
  backHref: string;
}

export function ListeningCleverExamSession({ weakTags, backHref }: ListeningCleverExamSessionProps) {
  const { session, loading } = useAuth();
  const [profession, setProfession] = useState<string | undefined>();
  const [targetCountry, setTargetCountry] = useState<string | undefined>();
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitListeningAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      setProfession(profile?.profession);
      setTargetCountry(profile?.targetCountry);
    });
  }, [loading, session?.user?.id]);

  const focus =
    weakTags.map(partFromWeakTag).find(Boolean) ??
    (weakTags.some((t) => t.includes("part-a"))
      ? "A"
      : weakTags.some((t) => t.includes("part-c"))
        ? "C"
        : "B");

  const seed = createSelectionSeed(session?.user?.id);

  const examA = useMemo(
    () => (focus === "A" ? assembleListeningExamA(profession, targetCountry, seed) : null),
    [focus, profession, targetCountry, seed],
  );
  const examBC = useMemo(
    () => (focus !== "A" ? assembleListeningExamBC(profession, targetCountry, seed) : null),
    [focus, profession, targetCountry, seed],
  );

  const questions = useMemo(() => {
    if (focus === "A") return examA?.allQuestions ?? [];
    if (focus === "C") {
      return examBC?.partCBlocks.flatMap((b) => b.questions) ?? [];
    }
    return examBC?.partBExtracts.map((e) => e.question) ?? [];
  }, [examA, examBC, focus]);

  const mapPartAResponses = (): Record<string, string | string[]> => {
    const mapped = { ...responses };
    if (!examA) return mapped;
    for (const { block, questions: sectionQs } of examA.sections) {
      for (const q of sectionQs) {
        const suffix = q.id.match(/q(\d+)$/)?.[1];
        const fieldKey = suffix ? `q${suffix}` : q.id;
        mapped[q.id] = String(responses[fieldKey] ?? responses[q.id] ?? "");
      }
    }
    return mapped;
  };

  const allAnswered =
    questions.length > 0 &&
    questions.every((q) => {
      const v = focus === "A" ? mapPartAResponses()[q.id] : responses[q.id];
      return typeof v === "string" ? v.trim().length > 0 : v !== undefined;
    });

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitListeningAttempt({
      questions,
      responses: focus === "A" ? mapPartAResponses() : responses,
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
        questions={questions}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        usedImportedKey={result.usedImportedKey}
        backHref={backHref}
      />
    );
  }

  const partLabel =
    focus === "A"
      ? `Part A · ${OET_LISTENING.partA} note completion`
      : focus === "C"
        ? `Part C · ${OET_LISTENING.partC} MCQ`
        : `Part B · ${OET_LISTENING.partB} extracts`;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StudyPageHeader
        backHref={backHref}
        backLabel="Back"
        skill="listening"
        eyebrow="Listening · Audio quiz"
        title={partLabel}
        description={
          <p className="text-sm text-ink-soft">
            Exam-faithful listening with real audio — play each clip once, then answer.{" "}
            {questions.length} questions in this set.
          </p>
        }
      />

      {focus === "A" && examA
        ? examA.sections.map(({ block }, index) => (
            <section
              key={block.id}
              className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase text-brand-primary">
                Consultation {index + 1} of {examA.sections.length}
              </p>
              <p className="text-sm font-medium text-ink">{block.title}</p>
              <AccentContextBanner
                variant="listening"
                accentNote={block.accentNote}
                localeContext={block.localeContext}
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
                  setResponses((prev) => ({ ...prev, [fieldId]: value }))
                }
              />
            </section>
          ))
        : null}

      {focus === "B" && examBC
        ? examBC.partBExtracts.map((extract) => (
            <section
              key={extract.key}
              className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase text-brand-primary">
                Extract {extract.index} of {examBC.partBExtracts.length}
              </p>
              <p className="text-sm font-medium text-ink">{extract.block.title}</p>
              <ListeningAudioPanel block={extract.block} examMode />
              <QuizQuestionField
                question={extract.question}
                index={extract.index - 1}
                value={responses[extract.question.id]}
                onChange={(v) =>
                  setResponses((prev) => ({ ...prev, [extract.question.id]: v }))
                }
              />
            </section>
          ))
        : null}

      {focus === "C" && examBC
        ? examBC.partCBlocks.map((block) => (
            <section
              key={block.id}
              className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-sm font-medium text-ink">{block.title}</p>
              <ListeningAudioPanel block={block} examMode />
              <div className="space-y-4">
                {block.questions.map((q, i) => (
                  <QuizQuestionField
                    key={q.id}
                    question={q}
                    index={i}
                    value={responses[q.id]}
                    onChange={(v) => setResponses((prev) => ({ ...prev, [q.id]: v }))}
                  />
                ))}
              </div>
            </section>
          ))
        : null}

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => void handleSubmit()}
        className="min-h-12 w-full rounded-xl bg-brand-accent px-4 py-3.5 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : `Submit listening quiz (${questions.length} questions)`}
      </button>
    </div>
  );
}
