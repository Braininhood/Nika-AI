"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type StudySkill = "reading" | "writing" | "listening" | "speaking";

const SKILL_ICONS: Record<StudySkill, ReactNode> = {
  reading: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round" />
      <path d="M8 7h8M8 11h6" strokeLinecap="round" />
    </svg>
  ),
  writing: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  ),
  listening: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 3a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v3" strokeLinecap="round" />
    </svg>
  ),
  speaking: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v3M8 21h8" strokeLinecap="round" />
    </svg>
  ),
};

export function StudySkillIcon({ skill }: { skill: StudySkill }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-primary">
      {SKILL_ICONS[skill]}
    </span>
  );
}

const QUICK_SKILLS: { skill: StudySkill; label: string; href: string }[] = [
  { skill: "reading", label: "Reading", href: "/reading" },
  { skill: "writing", label: "Writing", href: "/writing/learn" },
  { skill: "listening", label: "Listening", href: "/listening" },
  { skill: "speaking", label: "Speaking", href: "/speaking" },
];

export function StudyQuickSkills() {
  return (
    <section aria-label="Quick skill access">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
        Four OET skills
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {QUICK_SKILLS.map(({ skill, label, href }) => (
          <Link
            key={skill}
            href={href}
            className="flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3 py-4 text-center transition hover:bg-surface-muted active:scale-[0.98]"
          >
            <StudySkillIcon skill={skill} />
            <span className="text-sm font-semibold text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
