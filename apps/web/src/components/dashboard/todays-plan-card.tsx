"use client";

import Link from "next/link";

import { SecondaryActionLink } from "@/components/ui/secondary-action-button";

import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";
import type { DailyPlan } from "@/lib/plan/types";

interface TodaysPlanCardProps {
  plan: DailyPlan | null;
  profession?: OetProfession | null;
}

export function TodaysPlanCard({ plan, profession }: TodaysPlanCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
        Daily schedule
      </p>
      <h2 className="mt-1 text-lg font-bold text-ink">Today&apos;s plan</h2>

      {plan ? (
        <>
          <p className="mt-1 text-sm text-ink-soft">
            {plan.prioritySkill.charAt(0).toUpperCase() + plan.prioritySkill.slice(1)} focus · ~
            {plan.estimatedMinutes} min
            {plan.primaryScenarioId && profession
              ? ` · ${getProfessionLabel(profession)}`
              : ""}
          </p>
          <ul className="mt-4 space-y-2">
            {plan.items.map((item) => (
              <li key={`${item.type}-${item.route}`}>
                <Link
                  href={item.route}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm transition hover:bg-surface-muted active:bg-surface-muted"
                >
                  <span className="font-medium text-ink">{item.title}</span>
                  <span className="shrink-0 text-ink-soft">{item.durationMinutes}m</span>
                </Link>
              </li>
            ))}
          </ul>
          <SecondaryActionLink href="/study" className="mt-4">
            Open full study hub →
          </SecondaryActionLink>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          Complete onboarding and diagnostic to unlock your personalized plan.
        </p>
      )}
    </section>
  );
}
