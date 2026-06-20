"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProgressBadgesGrid } from "@/components/progress/progress-badges-grid";
import { WeakSkillRadar } from "@/components/dashboard/weak-skill-radar";
import { ExamCountdownCard } from "@/components/dashboard/exam-countdown-card";
import { ReadinessCard } from "@/components/readiness/readiness-card";
import { loadReadinessStatus } from "@/lib/adaptive/service";
import type { ReadinessStatus } from "@/lib/adaptive/types";
import { getScenario } from "@/content/writing/scenarios";
import { getProfessionLabel } from "@/lib/domain/professions";
import { formatTargetGradesSummary } from "@/lib/domain/requirements";
import type { SkillMap, UserProfile } from "@/lib/domain/types";
import { recommendedWritingStage } from "@/lib/adaptive/skill-map";
import { getWritingProgressStats, type WritingProgressStats } from "@/lib/writing/progress-stats";
import { computeExamCountdown, resolveStudyGoal, shouldShowExamCountdown } from "@/lib/exam/countdown";
import { writingStageLabel } from "@/lib/writing/recommendations";
import { loadUserProfile } from "@/lib/profile/service";
import { useAuth } from "@/lib/auth/auth-provider";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProgressPage() {
  const { session, loading } = useAuth();
  const [skillMap, setSkillMap] = useState<SkillMap | undefined>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<WritingProgressStats | null>(null);
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((p) => {
      setProfile(p);
      setSkillMap(p?.skillMap);
    });
    void getWritingProgressStats().then(setStats);
    void loadReadinessStatus().then(setReadiness);
  }, [loading, session?.user?.id]);

  const writingBand = skillMap?.diagnostic.writing?.estBand;
  const writingGap = skillMap?.diagnostic.writing?.gap;
  const stage = writingStageLabel(skillMap);
  const examCountdown = shouldShowExamCountdown(profile ?? undefined)
    ? computeExamCountdown(profile?.examDate)
    : null;
  const studyGoal = resolveStudyGoal(profile ?? undefined);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Progress</h1>
        {profile?.profession && (
          <p className="mt-1 text-sm text-ink-soft">
            {getProfessionLabel(profile.profession)}
            {profile.targetGrades
              ? ` · Target ${formatTargetGradesSummary(profile.targetGrades)}`
              : ""}
          </p>
        )}
      </header>

      {examCountdown ? (
        <ExamCountdownCard countdown={examCountdown} compact={false} />
      ) : studyGoal === "exam_prep" ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-3 text-sm text-ink-soft">
          Booked your OET?{" "}
          <Link href="/profile" className="font-medium text-brand-primary hover:underline">
            Add your exam date in Profile
          </Link>{" "}
          when you have one.
        </p>
      ) : null}

      {readiness ? <ReadinessCard status={readiness} /> : null}

      <ProgressBadgesGrid compact />

      {stats && (
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-soft">Study streak</p>
            <p className="text-2xl font-bold text-ink">{stats.studyStreakDays} days</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-soft">Today</p>
            <p className="text-2xl font-bold text-ink">~{stats.minutesTodayEstimate} min</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-soft">Writing attempts (7d)</p>
            <p className="text-2xl font-bold text-ink">{stats.attemptsThisWeek}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-ink-soft">Avg criteria score</p>
            <p className="text-2xl font-bold text-ink">
              {stats.averageCriterionScore != null
                ? `${Math.round(stats.averageCriterionScore * 100)}%`
                : "—"}
            </p>
          </div>
        </section>
      )}

      {skillMap && (
        <section className="rounded-2xl border border-border bg-surface p-4 text-sm">
          <h2 className="font-semibold text-ink">Writing pathway</h2>
          <p className="mt-2 text-ink-soft">
            Stage: <span className="font-medium text-ink">{stage}</span>
            {writingBand ? ` · Estimated band ${writingBand}` : ""}
            {writingGap != null ? ` · ${writingGap} grade step(s) to target` : ""}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            Stage:{" "}
            {recommendedWritingStage(skillMap) === "learn"
              ? "Focus on lessons and samples"
              : recommendedWritingStage(skillMap) === "guided"
                ? "Use guided wizard before independent practice"
                : "Independent practice and exam timing"}
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block text-sm font-medium text-brand-primary hover:underline"
          >
            Open today&apos;s plan →
          </Link>
        </section>
      )}

      <WeakSkillRadar skillMap={skillMap} />

      {stats && stats.recentAttempts.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-ink">Recent writing attempts</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.recentAttempts.map((attempt) => {
              const scenario = attempt.scenarioId
                ? getScenario(attempt.scenarioId)
                : undefined;
              return (
                <li
                  key={attempt.id}
                  className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {scenario?.meta.title ?? attempt.scenarioId ?? "Writing"}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {formatDate(attempt.createdAt)} · {attempt.wordCount} words ·{" "}
                      {attempt.mode}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-forest">
                    {Math.round(attempt.avgScore * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Link
        href="/diagnostic?retake=1"
        className="text-center text-sm text-brand-primary hover:underline"
      >
        Re-run diagnostic placement test
      </Link>
    </div>
  );
}
