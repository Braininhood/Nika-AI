"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  OET_READING_OVERVIEW,
  READING_COMMON_MISTAKES,
  tipsForPart,
} from "@/lib/reading/exam-guide";
import type { ReadingPart } from "@/content/reading/types";

interface ReadingExamBriefingProps {
  part: ReadingPart;
  weakTags?: string[];
  compact?: boolean;
}

export function ReadingExamBriefing({ part, weakTags = [], compact = false }: ReadingExamBriefingProps) {
  const tips = tipsForPart(part, weakTags);
  const partInfo =
    part === "A"
      ? OET_READING_OVERVIEW.parts.A
      : part === "B"
        ? OET_READING_OVERVIEW.parts.B
        : OET_READING_OVERVIEW.parts.C;

  if (compact) {
    return (
      <CollapsibleSection
        title={`Part ${part} briefing`}
        subtitle={partInfo.label}
        defaultOpen={false}
      >
        <div className="space-y-3 text-sm text-ink-soft">
          <p>
            <strong className="text-ink">{partInfo.label}</strong> — real exam:{" "}
            {part === "A"
              ? `${partInfo.questions} questions in ${partInfo.minutes} min (then locked)`
              : part === "B"
                ? `${partInfo.questions} texts × 1 MCQ each, within shared 45 min with Part C`
                : `${partInfo.questions} MCQs on two longer texts (~20 + ~25 min suggested)`}
          </p>
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip.title} className="rounded-lg bg-surface-muted px-3 py-2">
                <p className="font-medium text-ink">{tip.title}</p>
                <p className="mt-0.5 text-xs">{tip.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title={`OET Reading · Part ${part} briefing`}
      subtitle={partInfo.label}
      defaultOpen={false}
    >
      <div className="space-y-3 text-sm text-ink-soft">
        <p>
          <strong className="text-ink">{partInfo.label}</strong> — real exam:{" "}
          {part === "A"
            ? `${partInfo.questions} questions in ${partInfo.minutes} min (then locked)`
            : part === "B"
              ? `${partInfo.questions} texts × 1 MCQ each, within shared 45 min with Part C`
              : `${partInfo.questions} MCQs on two longer texts (~20 + ~25 min suggested)`}
        </p>
        <ul className="space-y-2">
          {tips.map((tip) => (
            <li key={tip.title} className="rounded-lg bg-surface-muted px-3 py-2">
              <p className="font-medium text-ink">{tip.title}</p>
              <p className="mt-0.5 text-xs">{tip.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </CollapsibleSection>
  );
}

export function ReadingStudyGuidePanel() {
  return (
    <CollapsibleSection
      title="How OET Reading works"
      subtitle="60 min · 42 questions · Parts A, B & C"
      defaultOpen={false}
    >
      <p className="text-sm text-ink-soft">
        Same format for all 12 professions. Locale-specific vocabulary in our passages matches your
        destination country.
      </p>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part A — 15 min lock</dt>
          <dd className="mt-1 text-ink-soft">
            Four short texts · matching / gap-fill · scan for synonyms, not identical words.
          </dd>
        </div>
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part B — workplace extracts</dt>
          <dd className="mt-1 text-ink-soft">
            Six short texts · one MCQ each · gist, purpose, or appropriate action.
          </dd>
        </div>
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part C — inference</dt>
          <dd className="mt-1 text-ink-soft">
            Two longer texts · attitude and implied meaning · questions follow text order.
          </dd>
        </div>
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-ink">Common mistakes we train against</h3>
      <ul className="mt-2 space-y-2 text-xs text-ink-soft">
        {READING_COMMON_MISTAKES.map((row) => (
          <li key={row.mistake} className="border-l-2 border-brand-primary/30 pl-2">
            <strong className="text-ink">{row.mistake}:</strong> {row.fix}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
