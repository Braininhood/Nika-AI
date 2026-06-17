"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CaseNotesPanel } from "@/components/writing/case-notes-panel";
import { FeedbackPanel } from "@/components/writing/feedback-panel";
import { LetterEditor } from "@/components/writing/letter-editor";
import { ScenarioGradedSamplesPanel } from "@/components/writing/scenario-graded-samples-panel";
import { getScenario } from "@/content/writing/scenarios";
import { samplesForScenario } from "@/content/writing/sample-letters";
import { useAuth } from "@/lib/auth/auth-provider";
import { db } from "@/lib/db";
import { submitWritingAttempt } from "@/lib/writing/submit-feedback";

export default function WritingPracticeScenarioPage() {
  const params = useParams();
  const scenarioId = params.scenarioId as string;
  const scenario = getScenario(scenarioId);
  const { session } = useAuth();

  const [letterText, setLetterText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitWritingAttempt>> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (!scenario) {
    return (
      <p className="py-8 text-sm text-ink-soft">
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

  const linkedSamples = samplesForScenario(scenario.id);
  const hasLinkedSamples = linkedSamples.length > 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/writing/practice" className="text-sm text-ink-soft hover:text-ink">
        ← Practice scenarios
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink capitalize">{scenario.meta.letterType} letter</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href={`/writing/guided/${scenario.id}`} className="text-brand-primary hover:underline">
            Try guided wizard →
          </Link>
          <Link href={`/writing/exam/${scenario.id}`} className="text-brand-primary hover:underline">
            Exam mode →
          </Link>
          {!hasLinkedSamples && (
            <Link href="/writing/learn/samples" className="text-brand-primary hover:underline">
              Graded samples →
            </Link>
          )}
        </div>
      </header>

      <CaseNotesPanel scenario={scenario} />

      <ScenarioGradedSamplesPanel scenarioId={scenario.id} />

      <LetterEditor
        value={letterText}
        onChange={setLetterText}
        savedHint={savedAt ? "draft saved" : null}
        disabled={submitting}
      />

      <button
        type="button"
        disabled={submitting || letterText.trim().length < 50}
        onClick={() => void handleSubmit()}
        className="w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent disabled:opacity-40"
      >
        {submitting ? "Checking…" : "Submit for feedback"}
      </button>
    </div>
  );
}
