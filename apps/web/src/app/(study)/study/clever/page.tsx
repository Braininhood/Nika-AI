"use client";

import Link from "next/link";

import { CLEVER_SKILL_LABELS, CLEVER_SKILL_ROUTES } from "@/content/assessment";

const SKILLS = ["reading", "listening", "writing", "speaking", "vocab"] as const;

export default function CleverQuizHubPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Clever assessments</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Mixed question types for every OET skill — or ask Nika to &quot;create a vocabulary quiz&quot;
          in chat.
        </p>
      </header>

      <ul className="space-y-3">
        {SKILLS.map((skill) => (
          <li key={skill}>
            <Link
              href={CLEVER_SKILL_ROUTES[skill]}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-4 transition hover:bg-surface-muted"
            >
              <span className="font-medium text-ink">{CLEVER_SKILL_LABELS[skill]}</span>
              <span className="text-sm text-brand-primary">Start →</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/study/clever/mixed"
            className="flex items-center justify-between rounded-xl border border-brand-primary/40 bg-brand-accent-soft/25 px-4 py-4 transition hover:bg-brand-accent-soft/40"
          >
            <span className="font-medium text-ink">{CLEVER_SKILL_LABELS.mixed}</span>
            <span className="text-sm text-brand-primary">Start →</span>
          </Link>
        </li>
      </ul>

      <Link href="/vocabulary" className="text-sm text-brand-primary hover:underline">
        Healthcare vocabulary list →
      </Link>
    </div>
  );
}
