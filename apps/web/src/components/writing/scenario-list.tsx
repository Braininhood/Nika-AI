"use client";

import Link from "next/link";

import {
  scenarioCountryLabel,
  type WritingScenario,
} from "@/content/writing/scenarios";

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Foundation",
  2: "Standard",
  3: "Advanced",
};

interface ScenarioListProps {
  scenarios: WritingScenario[];
  hrefPrefix: string;
  suffix?: string;
  emptyMessage?: string;
}

export function ScenarioList({
  scenarios,
  hrefPrefix,
  suffix,
  emptyMessage = "No scenarios available yet.",
}: ScenarioListProps) {
  if (scenarios.length === 0) {
    return <p className="text-sm text-ink-soft">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {scenarios.map((scenario) => (
        <li key={scenario.id}>
          <Link
            href={`${hrefPrefix}/${scenario.id}`}
            className="block rounded-xl border border-border bg-surface px-4 py-4 transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink">
                  {scenario.meta.title}
                  {suffix ? ` — ${suffix}` : ""}
                </p>
                <p className="mt-1 text-xs capitalize text-ink-soft">
                  {scenario.meta.letterType} · {scenario.meta.readerRole}
                </p>
              </div>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                {scenarioCountryLabel(scenario.meta.countryCode)}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              {DIFFICULTY_LABEL[scenario.difficulty] ?? "Standard"} · ~
              {scenario.meta.estimatedWordCount} words
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
