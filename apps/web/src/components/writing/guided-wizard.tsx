"use client";

import { useState } from "react";

import type { WritingScenario } from "@/content/writing/scenarios";
import { FeedbackPanel } from "@/components/writing/feedback-panel";
import { useAuth } from "@/lib/auth/auth-provider";
import { signOffForProfession } from "@/lib/writing/profession-signoff";
import { submitWritingAttempt } from "@/lib/writing/submit-feedback";

const STEPS = [
  "notes",
  "purpose",
  "opening",
  "body",
  "closing",
  "review",
] as const;

type WizardStep = (typeof STEPS)[number];

interface GuidedWritingWizardProps {
  scenario: WritingScenario;
}

export function GuidedWritingWizard({ scenario }: GuidedWritingWizardProps) {
  const { session } = useAuth();
  const [step, setStep] = useState<WizardStep>("notes");
  const [includedNotes, setIncludedNotes] = useState<Set<string>>(new Set());
  const [purposeAnswer, setPurposeAnswer] = useState("");
  const [opening, setOpening] = useState("");
  const [bodyChecks, setBodyChecks] = useState<Set<string>>(new Set());
  const [closing, setClosing] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitWritingAttempt>> | null>(null);

  const stepIndex = STEPS.indexOf(step);
  const mustInclude = scenario.assessorGuide.mustInclude;

  const toggleNote = (id: string) => {
    setIncludedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleBodyCheck = (id: string) => {
    setBodyChecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const assembledLetter = [
    `Dear ${scenario.meta.readerName ?? scenario.meta.readerRole},`,
    "",
    opening.trim(),
    "",
    bodyChecks.size > 0
      ? `I would like to highlight the following: ${[...bodyChecks]
          .map((id) => scenario.caseNotes.find((n) => n.id === id)?.text)
          .filter(Boolean)
          .join("; ")}.`
      : "",
    "",
    closing.trim(),
    "",
    "Yours sincerely,",
    signOffForProfession(scenario.profession),
  ]
    .filter(Boolean)
    .join("\n");

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitWritingAttempt({
      scenario,
      letterText: assembledLetter,
      accessToken: session?.access_token,
      mode: "guided",
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
      <p className="text-xs text-ink-soft">
        Guided wizard · step {stepIndex + 1} of {STEPS.length}
      </p>

      {step === "notes" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 1 — Select relevant case notes</h2>
          <p className="mt-2 text-sm text-ink-soft">Tap notes to include in your letter.</p>
          <ul className="mt-4 space-y-2">
            {scenario.caseNotes.map((note) => {
              const selected = includedNotes.has(note.id);
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => toggleNote(note.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                      selected ? "border-brand-primary bg-brand-accent-soft" : "border-border"
                    }`}
                  >
                    {selected ? "✓ " : ""}{note.text}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setStep("purpose")}
            className="mt-4 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
          >
            Next: Purpose
          </button>
        </section>
      )}

      {step === "purpose" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 2 — Purpose</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Who is the reader and why are you writing? ({scenario.meta.readerRole})
          </p>
          <textarea
            value={purposeAnswer}
            onChange={(e) => setPurposeAnswer(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Refer Mr Holt to GP for BP review because…"
          />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setStep("notes")} className="rounded-xl border px-4 py-2 text-sm">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("opening")}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Next: Opening
            </button>
          </div>
        </section>
      )}

      {step === "opening" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 3 — Opening sentence</h2>
          <p className="mt-2 text-xs text-ink-soft">
            Hint: I am writing to refer [patient] for [reason]…
          </p>
          <textarea
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            rows={4}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setStep("purpose")} className="rounded-xl border px-4 py-2 text-sm">
              Back
            </button>
            <button
              type="button"
              disabled={opening.trim().length < 20}
              onClick={() => setStep("body")}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Next: Body facts
            </button>
          </div>
        </section>
      )}

      {step === "body" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 4 — Must-include facts</h2>
          <p className="mt-2 text-sm text-ink-soft">Check each fact you will cover in the body.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {mustInclude.map((id) => {
              const note = scenario.caseNotes.find((n) => n.id === id);
              if (!note) return null;
              return (
                <li key={id}>
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={bodyChecks.has(id)}
                      onChange={() => toggleBodyCheck(id)}
                      className="accent-brand-primary"
                    />
                    {note.text}
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setStep("opening")} className="rounded-xl border px-4 py-2 text-sm">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("closing")}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Next: Closing
            </button>
          </div>
        </section>
      )}

      {step === "closing" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 5 — Closing + request</h2>
          <textarea
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="I would be grateful if you could review his medication within two weeks…"
          />
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setStep("body")} className="rounded-xl border px-4 py-2 text-sm">
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("review")}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Review letter
            </button>
          </div>
        </section>
      )}

      {step === "review" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Step 6 — Review &amp; submit</h2>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-ink">
            {assembledLetter}
          </pre>
          <p className="mt-2 text-xs text-ink-soft">
            {assembledLetter.trim().split(/\s+/).filter(Boolean).length} words · aim 150–220 for OET
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setStep("closing")} className="rounded-xl border px-4 py-2 text-sm">
              Back
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
            >
              {submitting ? "Submitting…" : "Submit for feedback"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
