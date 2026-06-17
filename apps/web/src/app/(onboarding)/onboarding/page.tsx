"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CountryRegulatorPicker } from "@/components/onboarding/country-regulator-picker";
import { ProfessionPicker } from "@/components/onboarding/profession-picker";
import {
  StudyGoalPicker,
  studyGoalLabel,
} from "@/components/onboarding/study-goal-picker";
import { getProfessionLabel } from "@/lib/domain/professions";
import {
  formatTargetGradesSummary,
  getRegulator,
  getTargetGrades,
} from "@/lib/domain/requirements";
import type { OetProfession, StudyGoal } from "@/lib/domain/types";
import { formatExamDate, minExamDateInput } from "@/lib/exam/countdown";
import { useAuth } from "@/lib/auth/auth-provider";
import { saveOnboarding } from "@/lib/profile/service";

const STEPS = ["profession", "regulator", "study", "review"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState<Step>("profession");
  const [profession, setProfession] = useState<OetProfession | undefined>();
  const [countryCode, setCountryCode] = useState<string>();
  const [regulatorCode, setRegulatorCode] = useState<string>();
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("training");
  const [examDateInput, setExamDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);
  const targetGrades = regulatorCode ? getTargetGrades(regulatorCode) : null;
  const regulator = regulatorCode ? getRegulator(regulatorCode) : undefined;

  const handleRegulatorChange = (nextCountry: string, nextRegulator: string) => {
    setCountryCode(nextCountry);
    setRegulatorCode(nextRegulator);
  };

  const handleFinish = async () => {
    if (!profession || !countryCode || !regulatorCode || !targetGrades) return;

    setSaving(true);
    setError(null);
    try {
      await saveOnboarding(
        {
          profession,
          targetCountry: countryCode,
          targetRegulator: regulatorCode,
          targetGrades,
          studyGoal,
          examDate:
            studyGoal === "exam_prep" && examDateInput.trim()
              ? examDateInput.trim()
              : null,
        },
        session?.access_token,
      );
      router.replace("/diagnostic");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:max-w-2xl">
      <header>
        <p className="text-sm font-medium text-brand-primary">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Set up your OET path</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Tell us your profession and how you want to study. Listening &amp; Reading
          are shared; Writing &amp; Speaking match your role.
        </p>
      </header>

      <ol className="flex gap-2 text-xs font-medium" aria-label="Onboarding progress">
        {STEPS.map((s, index) => (
          <li
            key={s}
            className={`flex-1 rounded-full py-1 text-center ${
              step === s
                ? "bg-brand-accent text-ink"
                : index < stepIndex
                  ? "bg-brand-accent-soft text-ink"
                  : "bg-surface-muted text-ink-soft"
            }`}
          >
            {index + 1}
          </li>
        ))}
      </ol>

      {step === "profession" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Your profession</h2>
          <div className="mt-4">
            <ProfessionPicker
              value={profession}
              onChange={(value) => setProfession(value)}
            />
          </div>
          <button
            type="button"
            disabled={!profession}
            onClick={() => setStep("regulator")}
            className="mt-6 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Continue
          </button>
        </section>
      )}

      {step === "regulator" && profession && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Country &amp; regulator</h2>
          <div className="mt-4">
            <CountryRegulatorPicker
              profession={profession}
              regulatorCode={regulatorCode}
              onChange={handleRegulatorChange}
            />
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setStep("profession")}
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!regulatorCode}
              onClick={() => setStep("study")}
              className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === "study" && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">How are you studying?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            No exam booked yet? Choose training only — you can switch later in Profile.
          </p>
          <div className="mt-4">
            <StudyGoalPicker value={studyGoal} onChange={setStudyGoal} />
          </div>
          {studyGoal === "exam_prep" && (
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span className="text-xs text-ink-soft">
                Exam date (optional — add now or later in Profile)
              </span>
              <input
                type="date"
                value={examDateInput}
                min={minExamDateInput()}
                onChange={(e) => setExamDateInput(e.target.value)}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-ink"
              />
            </label>
          )}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setStep("regulator")}
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("review")}
              className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
            >
              Review
            </button>
          </div>
        </section>
      )}

      {step === "review" && profession && targetGrades && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Your goal</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-soft">Profession</dt>
              <dd className="font-medium text-ink">{getProfessionLabel(profession)}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Regulator</dt>
              <dd className="font-medium text-ink">
                {regulator?.countryLabel} — {regulator?.label}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Target grades</dt>
              <dd className="font-medium text-ink">
                {formatTargetGradesSummary(targetGrades)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Study mode</dt>
              <dd className="font-medium text-ink">{studyGoalLabel(studyGoal)}</dd>
            </div>
            {studyGoal === "exam_prep" && examDateInput.trim() && (
              <div>
                <dt className="text-ink-soft">Exam date</dt>
                <dd className="font-medium text-ink">
                  {formatExamDate(examDateInput.trim())}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-ink-soft">
            Next: a short diagnostic (~35 min) to map your strengths and build
            your personal study plan.
          </p>
          {error && (
            <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setStep("study")}
              className="rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink"
            >
              Back
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleFinish()}
              className="flex-1 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              {saving ? "Saving…" : "Start diagnostic"}
            </button>
          </div>
        </section>
      )}

      <p className="text-center text-xs text-ink-soft">
        Sign in to save your progress and sync across devices.
      </p>
    </div>
  );
}
