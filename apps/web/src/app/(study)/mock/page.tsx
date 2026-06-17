"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ReadinessCard } from "@/components/readiness/readiness-card";
import { formatTargetGradesSummary } from "@/lib/domain/requirements";
import type { OetSkill } from "@/lib/domain/types";
import { loadReadinessStatus } from "@/lib/adaptive/service";
import type { ReadinessStatus } from "@/lib/adaptive/types";
import { buildFullMockBlueprint } from "@/lib/mock/build-mock";
import {
  MOCK_SKILL_ORDER,
  recordMockSkillCompletion,
  startMockSession,
  submitMockAttempt,
} from "@/lib/mock/submit-mock";
import { loadUserProfile } from "@/lib/profile/service";
import { useAuth } from "@/lib/auth/auth-provider";
import { db } from "@/lib/db";
import { accuracyToBand } from "@/lib/quiz/engine";
import { gradeIndex } from "@/lib/domain/grades";

export default function MockExamPage() {
  const { session, loading } = useAuth();
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null);
  const [mockId, setMockId] = useState<string | null>(null);
  const [completedSkills, setCompletedSkills] = useState<Set<OetSkill>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    nikaMessage: string;
    failedSkills: OetSkill[];
  } | null>(null);
  const [blueprint, setBlueprint] = useState<ReturnType<typeof buildFullMockBlueprint> | null>(
    null,
  );

  const [targetSummary, setTargetSummary] = useState<string>("");

  const refresh = useCallback(async () => {
    const [status, profile] = await Promise.all([loadReadinessStatus(), loadUserProfile()]);
    setReadiness(status);
    if (profile?.targetGrades) {
      setTargetSummary(formatTargetGradesSummary(profile.targetGrades));
    }
    if (profile?.skillMap) {
      setBlueprint(buildFullMockBlueprint(profile, profile.skillMap));
    }
    const active = await db.mockAttempts
      .filter((m) => m.status === "in_progress")
      .first();
    if (active) {
      setMockId(active.id);
      setCompletedSkills(new Set(Object.keys(active.skillResults) as OetSkill[]));
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("oet-adaptive-updated", onUpdate);
    window.addEventListener("oet-skill-map-updated", onUpdate);
    return () => {
      window.removeEventListener("oet-adaptive-updated", onUpdate);
      window.removeEventListener("oet-skill-map-updated", onUpdate);
    };
  }, [loading, refresh, session?.user?.id]);

  async function handleStartMock() {
    if (!blueprint) return;
    const sessionRecord = await startMockSession(blueprint.id);
    setMockId(sessionRecord.id);
    setCompletedSkills(new Set());
    setResult(null);
  }

  async function handleMarkSkillDone(skill: OetSkill) {
    if (!mockId) return;
    const attempts = await db.attempts
      .where("skill")
      .equals(skill)
      .filter((a) => (a.scoreRaw.mode as string) === "mock" || (a.scoreRaw.mode as string) === "exam")
      .toArray();
    const latest = attempts.sort((a, b) => b.createdAt - a.createdAt)[0];
    let accuracy = 0.7;
    if (latest) {
      const raw = latest.scoreRaw;
      if (typeof raw.accuracy === "number") accuracy = raw.accuracy;
      else if (typeof raw.overallScore === "number") accuracy = raw.overallScore;
      else if (raw.criterionScores) {
        const scores = raw.criterionScores as Record<string, number>;
        accuracy =
          Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
      }
    }
    const profile = await loadUserProfile();
    const target = profile?.targetGrades?.[skill] ?? "B";
    const estBand = accuracyToBand(accuracy);
    await recordMockSkillCompletion(mockId, skill, {
      skill,
      estBand,
      passed: gradeIndex(estBand) >= gradeIndex(target),
      attemptId: latest?.id,
      accuracy,
    });
    setCompletedSkills((prev) => new Set([...prev, skill]));
  }

  async function handleSubmitMock() {
    if (!mockId) return;
    setSubmitting(true);
    try {
      const record = await db.mockAttempts.get(mockId);
      if (!record) return;
      const skillResults = Object.fromEntries(
        MOCK_SKILL_ORDER.map((skill) => {
          const r = record.skillResults[skill];
          return r
            ? [
                skill,
                {
                  skill,
                  estBand: r.estBand as import("@/lib/domain/types").OetGrade,
                  passed: r.passed,
                  attemptId: r.attemptId,
                  accuracy: r.accuracy,
                },
              ]
            : null;
        }).filter(Boolean) as [OetSkill, import("@/lib/adaptive/types").MockSkillResult][],
      );
      const out = await submitMockAttempt({ mockId, skillResults });
      setResult({
        passed: out.passed,
        nikaMessage: out.nikaMessage,
        failedSkills: out.failedSkills,
      });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const canStart =
    readiness?.state === "mock_eligible" ||
    readiness?.state === "mock_pass_pending" ||
    readiness?.state === "exam_ready";

  const allSkillsDone = blueprint
    ? MOCK_SKILL_ORDER.every((s) => completedSkills.has(s))
    : false;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">Loading…</div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">OET mock exam</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Full four-skill simulation under exam timing. Pass{" "}
          <strong>2 consecutive mocks</strong> at your regulator target to unlock exam ready.
        </p>
      </header>

      {readiness ? <ReadinessCard status={readiness} compact /> : null}

      {result ? (
        <section
          className={`rounded-2xl border p-5 ${result.passed ? "border-forest bg-forest/5" : "border-border bg-surface"}`}
        >
          <h2 className="font-semibold text-ink">
            {result.passed ? "Mock passed at target" : "Mock — adapt and retry"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{result.nikaMessage}</p>
          {!result.passed && result.failedSkills.length > 0 && (
            <p className="mt-2 text-sm text-ink">
              Focus areas: {result.failedSkills.join(", ")}
            </p>
          )}
          <Link
            href="/dashboard"
            className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
          >
            View updated plan
          </Link>
        </section>
      ) : null}

      {blueprint && !result && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">Full mock blueprint</h2>
          <p className="mt-1 text-xs text-ink-soft">
            ~{blueprint.totalMinutes} min · Scored against {targetSummary || "your targets"}
          </p>

          {!mockId && (
            <button
              type="button"
              disabled={!canStart}
              onClick={() => void handleStartMock()}
              className="mt-4 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
            >
              {canStart ? "Begin full mock" : "Complete readiness gates first"}
            </button>
          )}

          {mockId && (
            <ol className="mt-4 space-y-3">
              {blueprint.sections.map((section, idx) => {
                const done = completedSkills.has(section.skill);
                return (
                  <li
                    key={section.skill}
                    className={`rounded-xl border px-4 py-3 ${done ? "border-forest/40 bg-forest/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-ink-soft">
                          Step {idx + 1} · {section.durationMinutes} min
                        </p>
                        <p className="font-medium text-ink">{section.title}</p>
                        <p className="mt-1 text-xs text-ink-soft">{section.instructions}</p>
                      </div>
                      {done && <span className="text-forest text-sm font-bold">Done</span>}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href={`${section.route}${section.route.includes("?") ? "&" : "?"}mockSession=${mockId}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
                      >
                        Open exam
                      </Link>
                      {!done && (
                        <button
                          type="button"
                          onClick={() => void handleMarkSkillDone(section.skill)}
                          className="rounded-lg bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
                        >
                          Mark complete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {mockId && allSkillsDone && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmitMock()}
              className="mt-4 w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Scoring mock…" : "Submit mock & update plan"}
            </button>
          )}
        </section>
      )}

      <Link href="/progress" className="text-center text-sm text-brand-primary hover:underline">
        Readiness report on Progress
      </Link>
    </div>
  );
}
