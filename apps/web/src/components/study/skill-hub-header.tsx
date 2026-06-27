"use client";

import { StudySkillIcon, type StudySkill } from "@/components/study/study-quick-skills";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";

interface SkillHubHeaderProps {
  skill?: StudySkill;
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export function SkillHubHeader({
  skill,
  eyebrow,
  title,
  description,
  backHref = "/study",
  backLabel = "← Back to study hub",
}: SkillHubHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-surface p-6">
      {backHref ? (
        <nav aria-label="Back to previous step" className="mb-4">
          <SecondaryActionLink href={backHref}>{backLabel}</SecondaryActionLink>
        </nav>
      ) : null}
      <div className="flex items-start gap-3">
        {skill ? <StudySkillIcon skill={skill} /> : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-brand-primary">{eyebrow}</p>
          <h1 className="mt-1 break-words text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-soft">{description}</p>
        </div>
      </div>
    </header>
  );
}
