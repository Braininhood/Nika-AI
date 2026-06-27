"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { StudySkillIcon, type StudySkill } from "@/components/study/study-quick-skills";

export interface StudyPageHeaderProps {
  backHref: string;
  backLabel: string;
  skill?: StudySkill;
  /** Context line, e.g. "Writing · Academy" */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}

export function StudyBackLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-brand-primary transition hover:bg-brand-accent-soft/40 active:bg-brand-accent-soft/50 ${className}`}
    >
      <span aria-hidden className="text-base leading-none">
        ←
      </span>
      <span className="truncate">{children}</span>
    </Link>
  );
}

export function StudyPageHeader({
  backHref,
  backLabel,
  skill,
  eyebrow,
  title,
  description,
}: StudyPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <nav aria-label="Back to previous step">
        <StudyBackLink href={backHref}>{backLabel}</StudyBackLink>
      </nav>

      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          {eyebrow}
        </p>
      ) : null}

      <div className="flex items-start gap-3">
        {skill ? <StudySkillIcon skill={skill} /> : null}
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold leading-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <div className="mt-2 break-words text-sm leading-relaxed text-ink-soft">
              {description}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
