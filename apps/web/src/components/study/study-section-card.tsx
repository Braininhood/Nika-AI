"use client";

import Link from "next/link";

import { StudySkillIcon, type StudySkill } from "@/components/study/study-quick-skills";

export interface StudyLinkItem {
  href: string;
  label: string;
  hint?: string;
  badge?: string;
}

interface StudySectionCardProps {
  skill?: StudySkill;
  title: string;
  phase?: string;
  hubHref?: string;
  hubLabel?: string;
  hubHint?: string;
  items: StudyLinkItem[];
  highlighted?: boolean;
}

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StudySectionCard({
  skill,
  title,
  phase,
  hubHref,
  hubLabel,
  hubHint,
  items,
  highlighted = false,
}: StudySectionCardProps) {
  return (
    <section
      className={`rounded-2xl border bg-surface p-5 ${
        highlighted ? "border-brand-primary/40 bg-brand-accent-soft/20" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        {skill ? <StudySkillIcon skill={skill} /> : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {phase ? (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                {phase}
              </span>
            ) : null}
          </div>
          {hubHref && hubLabel ? (
            <Link
              href={hubHref}
              className="mt-3 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow active:scale-[0.99]"
            >
              <span>
                {hubLabel}
                {hubHint ? (
                  <span className="mt-0.5 block text-xs font-normal text-ink/80">{hubHint}</span>
                ) : null}
              </span>
              <Chevron />
            </Link>
          ) : null}
        </div>
      </div>

      {items.length > 0 ? (
        <ul className={`space-y-2 ${hubHref ? "mt-4" : "mt-3"}`}>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm transition hover:bg-surface-muted active:bg-surface-muted"
              >
                <span className="min-w-0">
                  <span className="font-medium text-ink">{item.label}</span>
                  {item.hint ? (
                    <span className="mt-0.5 block truncate text-xs text-ink-soft">{item.hint}</span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {item.badge ? (
                    <span className="rounded-full bg-brand-accent-soft px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                      {item.badge}
                    </span>
                  ) : null}
                  <Chevron />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
