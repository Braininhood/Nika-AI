"use client";

import Link from "next/link";

import type { WritingRecommendation } from "@/lib/writing/recommendations";

export interface NextStepRecommendation {
  id: string;
  title: string;
  description: string;
  route: string;
  durationMinutes?: number;
}

interface NextStepCardProps {
  recommendation: NextStepRecommendation;
  stageLabel?: string;
  skillLabel?: string;
}

export function NextStepCard({ recommendation, stageLabel, skillLabel = "writing" }: NextStepCardProps) {
  return (
    <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/30 p-5">
      {stageLabel ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Your {skillLabel} stage · {stageLabel}
        </p>
      ) : null}
      <h2 className="mt-1 text-lg font-bold text-ink">Next best step</h2>
      <p className="mt-1 font-medium text-ink">{recommendation.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{recommendation.description}</p>
      {recommendation.durationMinutes ? (
        <p className="mt-2 text-xs text-ink-soft">~{recommendation.durationMinutes} min</p>
      ) : null}
      <Link
        href={recommendation.route}
        className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
      >
        Start now →
      </Link>
    </section>
  );
}
