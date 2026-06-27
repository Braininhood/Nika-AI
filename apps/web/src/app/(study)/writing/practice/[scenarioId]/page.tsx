"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CaseNotesPanel } from "@/components/writing/case-notes-panel";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { FeedbackPanel } from "@/components/writing/feedback-panel";
import { LetterEditor } from "@/components/writing/letter-editor";
import { ScenarioGradedSamplesPanel } from "@/components/writing/scenario-graded-samples-panel";
import { useAuth } from "@/lib/auth/auth-provider";
import { db } from "@/lib/db";
import { useWritingScenario } from "@/lib/writing/use-writing-scenario";
import { submitWritingAttempt } from "@/lib/writing/submit-feedback";

export default function WritingPracticeScenarioPage() {
  const params = useParams();
  const scenarioId = params.scenarioId as string;
  const { scenario, loading } = useWritingScenario(scenarioId);
  const { session } = useAuth();

  const [letterText, setLetterText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitWritingAttempt>> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const persistDraft = useCallback(async (text: string) => {
    if (!scenario) return;
    await db.writingDrafts.put({
      id: `draft-${scenario.id}`,
      scenarioId: scenario.id,
      letterText: text,
      updatedAt: Date.now(),
    });
    setSavedAt(Date.now());
  }, [scenario]);

  useEffect(() => {
    if (!scenario) return;
    void db.writingDrafts.get(`draft-${scenario.id}`).then((draft) => {
      if (draft?.letterText) setLetterText(draft.letterText);
    });
  }, [scenario]);

  useEffect(() => {
    if (!scenario) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persistDraft(letterText), 30_000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [letterText, persistDraft, scenario]);

  useEffect(() => {
    if (result) {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-lg items-center justify-center px-4 text-sm text-ink-soft">
        Loading scenario…
      </div>
    );
  }

  if (!scenario) {
    return (
      <p className="mx-auto max-w-lg px-4 py-8 text-sm text-ink-soft">
        Scenario not found.{" "}
        <Link href="/writing/practice" className="text-brand-primary">
          Back
        </Link>
      </p>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitWritingAttempt({
      scenario,
      letterText,
      accessToken: session?.access_token,
      mode: "practice",
    });
    setResult(res);
    setSubmitting(false);
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-6 pb-24">
      <StudyPageHeader
        backHref="/writing/practice"
        backLabel="Practice scenarios"
        skill="writing"
        eyebrow={`Writing · Practice · ${scenario.meta.title}`}
        title={`${scenario.meta.letterType} letter`}
        description={
          <>
            To: {scenario.meta.readerRole}
            {scenario.meta.readerName ? ` · ${scenario.meta.readerName}` : ""}
            <div className="mt-3 flex flex-wrap gap-2">
              <SecondaryActionLink href={`/writing/guided/${scenario.id}`}>
                Guided wizard →
              </SecondaryActionLink>
              <SecondaryActionLink href={`/writing/exam/${scenario.id}`}>
                Exam mode →
              </SecondaryActionLink>
            </div>
          </>
        }
      />

      <ol className="flex flex-col gap-5" aria-label="Writing practice steps">
        <li>
          <CaseNotesPanel scenario={scenario} defaultOpen />
        </li>
        <li>
          <LetterEditor
            value={letterText}
            onChange={setLetterText}
            savedHint={savedAt ? "draft saved" : null}
            disabled={submitting || Boolean(result)}
          />
        </li>
        <li>
          <ScenarioGradedSamplesPanel scenarioId={scenario.id} defaultOpen={false} />
        </li>
      </ol>

      {!result ? (
        <button
          type="button"
          disabled={submitting || letterText.trim().length < 50}
          onClick={() => void handleSubmit()}
          className="sticky bottom-20 z-10 w-full rounded-xl bg-brand-accent px-4 py-3.5 text-sm font-semibold text-ink shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:opacity-40"
        >
          {submitting ? "Nika is reviewing…" : "Submit for Nika feedback"}
        </button>
      ) : null}

      {result ? (
        <div ref={feedbackRef}>
          <FeedbackPanel
            feedback={result.feedback}
            checklist={result.checklist.items}
            queuedForSync={result.queuedForSync}
            criterionScores={(result.feedback.criterion_scores ?? {}) as Record<string, number>}
            scenarioId={scenario.id}
            letterText={letterText}
          />
        </div>
      ) : null}
    </div>
  );
}
