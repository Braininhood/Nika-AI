"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CaseNotesPanel } from "@/components/writing/case-notes-panel";
import { ExamTimerBar, useExamPhase } from "@/components/writing/exam-timer-bar";
import { FeedbackPanel } from "@/components/writing/feedback-panel";
import { LetterEditor } from "@/components/writing/letter-editor";
import { getScenario } from "@/content/writing/scenarios";
import { useAuth } from "@/lib/auth/auth-provider";
import { db } from "@/lib/db";
import { submitWritingAttempt } from "@/lib/writing/submit-feedback";

export default function ExamScenarioPage() {
  const params = useParams();
  const scenarioId = params.scenarioId as string;
  const scenario = getScenario(scenarioId);
  const { session } = useAuth();
  const { phase, setPhase, hideCaseNotes } = useExamPhase();

  const [letterText, setLetterText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitWritingAttempt>> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistDraft = useCallback(async (text: string) => {
    if (!scenario) return;
    await db.writingDrafts.put({
      id: `exam-${scenario.id}`,
      scenarioId: scenario.id,
      letterText: text,
      updatedAt: Date.now(),
    });
    setSavedAt(Date.now());
  }, [scenario]);

  useEffect(() => {
    if (!scenario) return;
    void db.writingDrafts.get(`exam-${scenario.id}`).then((d) => {
      if (d?.letterText) setLetterText(d.letterText);
    });
  }, [scenario]);

  useEffect(() => {
    if (!scenario || phase === "reading") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persistDraft(letterText), 30_000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [letterText, persistDraft, scenario, phase]);

  if (!scenario) {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Scenario not found. <Link href="/writing/exam">Back</Link>
      </p>
    );
  }

  const canWrite = phase === "writing" || phase === "done";

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitWritingAttempt({
      scenario,
      letterText,
      accessToken: session?.access_token,
      mode: "exam",
    });
    setResult(res);
    setSubmitting(false);
  };

  if (result) {
    return (
      <FeedbackPanel
        feedback={result.feedback}
        checklist={result.checklist.items}
        queuedForSync={result.queuedForSync}
        criterionScores={(result.feedback.criterion_scores ?? {}) as Record<string, number>}
        scenarioId={scenario.id}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/writing/exam" className="text-sm text-ink-soft hover:text-ink">
        ← Exam mode
      </Link>

      <ExamTimerBar phase={phase} onPhaseChange={setPhase} />

      <header>
        <h1 className="text-xl font-bold text-ink capitalize">{scenario.meta.letterType} — exam</h1>
      </header>

      {!hideCaseNotes && <CaseNotesPanel scenario={scenario} title="Case notes (reading phase)" />}

      {canWrite && (
        <>
          <LetterEditor
            value={letterText}
            onChange={setLetterText}
            savedHint={savedAt ? "saved" : null}
            disabled={submitting}
          />
          <button
            type="button"
            disabled={submitting || letterText.trim().length < 50}
            onClick={() => void handleSubmit()}
            className="w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit exam attempt"}
          </button>
        </>
      )}
    </div>
  );
}
