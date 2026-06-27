"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProgressBadgesGrid } from "@/components/progress/progress-badges-grid";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import {
  ProgressStatCard,
  SkillWeekBreakdown,
} from "@/components/progress/progress-stat-cards";
import { WeakSkillRadar } from "@/components/dashboard/weak-skill-radar";
import { ExamCountdownCard } from "@/components/dashboard/exam-countdown-card";
import { ReadinessCard } from "@/components/readiness/readiness-card";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { loadReadinessStatus } from "@/lib/adaptive/service";
import type { ReadinessStatus } from "@/lib/adaptive/types";
import { getScenario } from "@/content/writing/scenarios";
import { getProfessionLabel } from "@/lib/domain/professions";
import { formatTargetGradesSummary } from "@/lib/domain/requirements";
import type { SkillMap, UserProfile } from "@/lib/domain/types";
import { recommendedWritingStage } from "@/lib/adaptive/skill-map";
import {
  getStudyProgressStats,
  type StudyProgressStats,
} from "@/lib/progress/study-progress-stats";
import { formatStudyMinutes } from "@/lib/progress/study-streak";
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

function skillLabel(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function activityTitle(activity: StudyProgressStats["recentActivity"][number]): string {
  if (activity.skill === "writing" && activity.scenarioId) {
    return getScenario(activity.scenarioId)?.meta.title ?? activity.label;
  }
  return activity.label;
}

export default function ProgressPage() {
  const { session, loading } = useAuth();
  const [skillMap, setSkillMap] = useState<SkillMap | undefined>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StudyProgressStats | null>(null);
  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((p) => {
      setProfile(p);
      setSkillMap(p?.skillMap);
    });
    void getStudyProgressStats().then(setStats);
    void loadReadinessStatus().then(setReadiness);
  }, [loading, session?.user?.id]);

  const writingBand = skillMap?.diagnostic.writing?.estBand;
  const writingGap = skillMap?.diagnostic.writing?.gap;
  const stage = writingStageLabel(skillMap);
  const examCountdown = shouldShowExamCountdown(profile ?? undefined)
    ? computeExamCountdown(profile?.examDate)
    : null;
  const studyGoal = resolveStudyGoal(profile ?? undefined);

  const profileLine = profile?.profession
    ? `${getProfessionLabel(profile.profession)}${
        profile.targetGrades
          ? ` · Target ${formatTargetGradesSummary(profile.targetGrades)}`
          : ""
      }`
    : "Track streaks, study time, and skill growth across all four OET skills.";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        eyebrow="Progress"
        title="Your journey"
        description={profileLine}
        backHref="/dashboard"
        backLabel="← Back to home"
      />

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

      {readiness ? (
        <ReadinessCard status={readiness} collapsible defaultOpen={false} />
      ) : null}

      {stats ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-ink">Study stats</h2>
            <p className="mt-1 text-sm text-ink-soft">
              All four skills count — not just writing. Time includes active study in the app.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ProgressStatCard
              label="Study streak"
              value={stats.studyStreakLabel}
              hint="Days in a row with 10+ min study or a completed activity"
              accent="brand"
            />
            <ProgressStatCard
              label="Today"
              value={stats.minutesTodayLabel}
              hint="Active time in the app plus completed tasks today"
            />
            <ProgressStatCard
              label="This week"
              value={formatStudyMinutes(stats.minutesThisWeek)}
              hint="Estimated study time across the last 7 days"
            />
            <ProgressStatCard
              label="Activities (7d)"
              value={String(stats.attemptsThisWeek)}
              hint="Quizzes, practice blocks, writing, and speaking sessions"
            />
          </div>
        </section>
      ) : null}

      {stats ? <SkillWeekBreakdown counts={stats.attemptsBySkillThisWeek} /> : null}

      <ProgressBadgesGrid compact />

      {stats && stats.writingAverageScore != null ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-ink">Writing feedback average</h2>
          <p className="mt-1 text-sm text-ink-soft">Mean criteria score across submitted writing letters</p>
          <p className="mt-3 text-3xl font-bold tabular-nums text-forest">
            {Math.round(stats.writingAverageScore * 100)}%
          </p>
        </section>
      ) : null}

      {skillMap ? (
        <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
          <h2 className="text-base font-bold text-ink">Writing pathway</h2>
          <p className="mt-2 text-ink-soft">
            Stage: <span className="font-medium text-ink">{stage}</span>
            {writingBand ? ` · Estimated band ${writingBand}` : ""}
            {writingGap != null ? ` · ${writingGap} grade step(s) to target` : ""}
          </p>
          <p className="mt-2 text-xs text-ink-soft">
            {recommendedWritingStage(skillMap) === "learn"
              ? "Focus on lessons and samples"
              : recommendedWritingStage(skillMap) === "guided"
                ? "Use guided wizard before independent practice"
                : "Independent practice and exam timing"}
          </p>
          <SecondaryActionLink href="/dashboard" className="mt-3">
            Open today&apos;s plan →
          </SecondaryActionLink>
        </section>
      ) : null}

      <WeakSkillRadar skillMap={skillMap} />

      {stats && stats.recentActivity.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-ink">Recent activity</h2>
          <p className="mt-1 text-sm text-ink-soft">Latest completed study across all skills</p>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.recentActivity.map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{activityTitle(activity)}</p>
                  <p className="text-xs text-ink-soft">
                    {skillLabel(activity.skill)} · {formatDate(activity.createdAt)}
                    {activity.mode ? ` · ${activity.mode}` : ""}
                  </p>
                </div>
                {activity.scorePercent != null ? (
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-forest">
                    {activity.scorePercent}%
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/diagnostic?retake=1"
        className="text-center text-sm text-brand-primary hover:underline"
      >
        Re-run diagnostic placement test
      </Link>
    </div>
  );
}
