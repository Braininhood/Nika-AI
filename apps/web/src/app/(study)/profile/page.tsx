"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProgressBadgesGrid } from "@/components/progress/progress-badges-grid";
import { AuthEmailStatusCard } from "@/components/profile/auth-email-status-card";
import { PrivacyDataCard } from "@/components/profile/privacy-data-card";
import { StudyGoalPicker } from "@/components/onboarding/study-goal-picker";
import { getProfessionLabel } from "@/lib/domain/professions";
import { formatTargetGradesSummary, getRegulator } from "@/lib/domain/requirements";
import type { StudyGoal, UserProfile } from "@/lib/domain/types";
import {
  computeExamCountdown,
  minExamDateInput,
  resolveStudyGoal,
} from "@/lib/exam/countdown";
import { useAuth } from "@/lib/auth/auth-provider";
import { apiGet } from "@/lib/api/typed";
import type { RemoteProfile } from "@/lib/profile/merge-remote-profile";
import { loadUserProfile, saveExamDate, saveStudyGoal } from "@/lib/profile/service";

export default function ProfilePage() {
  const { session, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studyGoal, setStudyGoal] = useState<StudyGoal>("training");
  const [examDateInput, setExamDateInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [savingExamDate, setSavingExamDate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [aiConsent, setAiConsent] = useState(false);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((loaded) => {
      setProfile(loaded);
      setStudyGoal(resolveStudyGoal(loaded ?? undefined));
      setExamDateInput(loaded?.examDate ?? "");
    });
    if (session?.access_token) {
      void apiGet<RemoteProfile>("/api/v1/profile/me", session.access_token)
        .then((remote) => setAiConsent(Boolean(remote.ai_consent)))
        .catch(() => undefined);
    }
  }, [loading, session?.user?.id, session?.access_token]);

  const regulator = profile?.targetRegulator
    ? getRegulator(profile.targetRegulator)
    : undefined;
  const countdown =
    studyGoal === "exam_prep" ? computeExamCountdown(profile?.examDate) : null;

  const handleStudyGoalChange = async (goal: StudyGoal) => {
    if (!session?.user) {
      setMessage("Sign in to save your study preference.");
      return;
    }
    setSavingGoal(true);
    setMessage(null);
    try {
      const updated = await saveStudyGoal(goal, session.access_token);
      setProfile(updated);
      setStudyGoal(goal);
      setMessage(
        goal === "training"
          ? "Training mode — focus on lessons and practice at your pace."
          : "Exam prep mode — add your date below when you're ready.",
      );
    } catch {
      setMessage("Could not save preference. Try again.");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleSaveExamDate = async (valueOverride?: string | null) => {
    if (!session?.user) {
      setMessage("Sign in to save your exam date.");
      return;
    }
    setSavingExamDate(true);
    setMessage(null);
    try {
      const value =
        valueOverride !== undefined ? valueOverride : examDateInput.trim() || null;
      const updated = await saveExamDate(value, session.access_token);
      setProfile(updated);
      setExamDateInput(updated.examDate ?? "");
      setMessage(value ? "Exam date saved." : "Exam date cleared.");
    } catch {
      setMessage("Could not save exam date. Try again.");
    } finally {
      setSavingExamDate(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Profile</h1>

      <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
        <dl className="space-y-3">
          <div>
            <dt className="text-ink-soft">Account</dt>
            <dd className="font-medium text-ink">
              {session?.user?.email ?? "Signed in"}
            </dd>
          </div>
          {profile?.profession && (
            <div>
              <dt className="text-ink-soft">Profession</dt>
              <dd className="font-medium text-ink">
                {getProfessionLabel(profile.profession)}
              </dd>
            </div>
          )}
          {regulator && (
            <div>
              <dt className="text-ink-soft">Regulator</dt>
              <dd className="font-medium text-ink">
                {regulator.countryLabel} — {regulator.label}
              </dd>
            </div>
          )}
          {profile?.targetGrades && (
            <div>
              <dt className="text-ink-soft">Target grades</dt>
              <dd className="font-medium text-ink">
                {formatTargetGradesSummary(profile.targetGrades)}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/onboarding"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
          >
            Edit goal
          </Link>
          {session?.user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      {session?.user ? <AuthEmailStatusCard /> : null}

      {session?.user ? (
        <PrivacyDataCard aiConsent={aiConsent} onAiConsentChange={setAiConsent} />
      ) : null}

      {session?.user ? <ProgressBadgesGrid /> : null}

      <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
        <h2 className="font-semibold text-ink">How are you studying?</h2>
        <p className="mt-1 text-ink-soft">
          Most people start with training only. Switch to exam prep when you book your OET.
        </p>
        <div className="mt-4">
          <StudyGoalPicker
            value={studyGoal}
            onChange={(goal) => void handleStudyGoalChange(goal)}
            disabled={savingGoal}
          />
        </div>
      </section>

      {studyGoal === "exam_prep" && (
        <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
          <h2 className="font-semibold text-ink">Exam date (optional until you book)</h2>
          <p className="mt-1 text-ink-soft">
            Add your OET date when you know it — we&apos;ll show a countdown on Home and Progress.
          </p>
          {countdown && (
            <p className="mt-3 rounded-lg bg-brand-accent-soft/40 px-3 py-2 text-xs font-medium text-ink">
              {countdown.label}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-ink-soft">Exam date</span>
              <input
                type="date"
                value={examDateInput}
                min={minExamDateInput()}
                onChange={(e) => setExamDateInput(e.target.value)}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-ink"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={savingExamDate}
                onClick={() => void handleSaveExamDate()}
                className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
              >
                {savingExamDate ? "Saving…" : "Save"}
              </button>
              {examDateInput && (
                <button
                  type="button"
                  disabled={savingExamDate}
                  onClick={() => void handleSaveExamDate(null)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted disabled:opacity-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {message && <p className="text-xs text-ink-soft">{message}</p>}
    </div>
  );
}
