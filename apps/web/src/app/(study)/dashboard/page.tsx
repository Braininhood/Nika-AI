"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { NextStepCard } from "@/components/dashboard/next-step-card";
import { ExamCountdownCard } from "@/components/dashboard/exam-countdown-card";
import { WeakSkillRadar } from "@/components/dashboard/weak-skill-radar";
import { scenarioCountryLabel, normalizeScenarioCountry } from "@/content/writing/scenarios";
import { getProfessionLabel } from "@/lib/domain/professions";
import { formatTargetGradesSummary } from "@/lib/domain/requirements";
import type { SkillMap, UserProfile } from "@/lib/domain/types";
import { apiUrl } from "@/lib/api/base-url";
import { useAuth } from "@/lib/auth/auth-provider";
import { buildAdaptiveDailyPlan } from "@/lib/adaptive/plan";
import { loadReadinessStatus } from "@/lib/adaptive/service";
import { computeExamCountdown, shouldShowExamCountdown } from "@/lib/exam/countdown";
import { loadUserProfile } from "@/lib/profile/service";
import {
  primaryReadingRecommendation,
  readingStageLabel,
  type ReadingRecommendation,
} from "@/lib/reading/recommendations";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import {
  primaryWritingRecommendation,
  writingStageLabel,
  type WritingRecommendation,
} from "@/lib/writing/recommendations";
import { ReadinessCard } from "@/components/readiness/readiness-card";
import type { ReadinessStatus } from "@/lib/adaptive/types";
import type { DailyPlan } from "@/lib/plan/types";

type NextStepRecommendation = WritingRecommendation | ReadingRecommendation;

export default function DashboardPage() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skillMap, setSkillMap] = useState<SkillMap | undefined>();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [nextStep, setNextStep] = useState<NextStepRecommendation | null>(null);

  const [readiness, setReadiness] = useState<ReadinessStatus | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then(async (loaded) => {
      setProfile(loaded);
      setSkillMap(loaded?.skillMap);
      const [adaptivePlan, readinessStatus] = await Promise.all([
        buildAdaptiveDailyPlan(loaded),
        loaded?.skillMap
          ? loadReadinessStatus(session?.access_token)
          : Promise.resolve(null),
      ]);
      setPlan(adaptivePlan);
      setReadiness(readinessStatus);

      const priority = loaded?.skillMap?.priority?.[0];
      if (priority === "reading") {
        setNextStep(
          primaryReadingRecommendation(
            loaded?.skillMap,
            loaded?.profession,
            loaded?.targetCountry,
          ),
        );
      }
    });
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      const priority = ctx.profile?.skillMap?.priority?.[0] ?? "writing";
      if (priority !== "reading") {
        setNextStep(primaryWritingRecommendation(ctx));
      }
    });
  }, [loading, session?.user?.id]);

  useEffect(() => {
    if (!session?.access_token || profile?.skillMap) return;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.access_token}`,
    };
    void fetch(apiUrl("/api/v1/plan/today"), { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((apiPlan: DailyPlan | null) => {
        if (apiPlan) setPlan(apiPlan);
      })
      .catch(() => {
        /* Dexie plan already set */
      });
  }, [session?.access_token, profile?.skillMap]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink-soft">
        Loading…
      </div>
    );
  }

  const countryCode = normalizeScenarioCountry(profile?.targetCountry);
  const countryLabel = countryCode ? scenarioCountryLabel(countryCode) : null;
  const stageLabel =
    skillMap?.priority?.[0] === "reading"
      ? readingStageLabel(skillMap)
      : writingStageLabel(skillMap);
  const examCountdown = shouldShowExamCountdown(profile ?? undefined)
    ? computeExamCountdown(profile?.examDate)
    : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-brand-primary">Today</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          {profile?.profession
            ? `${getProfessionLabel(profile.profession)} prep`
            : "Your OET Coach"}
        </h1>
        {profile?.targetRegulator && profile.targetGrades && (
          <p className="mt-2 text-sm text-ink-soft">
            Target: {formatTargetGradesSummary(profile.targetGrades)} ({profile.targetRegulator})
            {countryLabel ? ` · ${countryLabel}` : ""}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/study"
            className="inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow"
          >
            Today&apos;s study
          </Link>
          <Link
            href="/reading"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Reading
          </Link>
          <Link
            href="/listening"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Listening
          </Link>
          <Link
            href="/writing/learn"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Writing
          </Link>
        </div>
      </section>

      {examCountdown ? <ExamCountdownCard countdown={examCountdown} /> : null}

      {readiness ? <ReadinessCard status={readiness} compact /> : null}

      {nextStep && profile?.profession ? (
        <NextStepCard
          recommendation={nextStep}
          stageLabel={stageLabel}
          skillLabel={skillMap?.priority?.[0] ?? "writing"}
        />
      ) : null}

      <WeakSkillRadar skillMap={skillMap} />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">Today&apos;s plan</h2>
        {plan ? (
          <>
            <p className="mt-1 text-xs text-ink-soft">
              Priority: {plan.prioritySkill} · ~{plan.estimatedMinutes} min
              {plan.primaryScenarioId && profile?.profession
                ? ` · ${getProfessionLabel(profile.profession)}`
                : ""}
            </p>
            <ul className="mt-4 space-y-2">
              {plan.items.map((item) => (
                <li key={`${item.type}-${item.route}`}>
                  <Link
                    href={item.route}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm hover:bg-surface-muted"
                  >
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="text-ink-soft">{item.durationMinutes}m</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            Complete onboarding and diagnostic to unlock your personalized plan.
          </p>
        )}
      </section>
    </div>
  );
}
