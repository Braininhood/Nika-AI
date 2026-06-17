"use client";

import { useState } from "react";

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
  const [open, setOpen] = useState(!compact);
  const tips = tipsForPart(part, weakTags);
  const partInfo =
    part === "A"
      ? OET_READING_OVERVIEW.parts.A
      : part === "B"
        ? OET_READING_OVERVIEW.parts.B
        : OET_READING_OVERVIEW.parts.C;

  return (
    <section className="rounded-2xl border border-border bg-surface-muted/40 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-ink"
      >
        <span>OET Reading · Part {part} briefing</span>
        <span className="text-xs text-ink-soft">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm text-ink-soft">
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
              <li key={tip.title} className="rounded-lg bg-surface px-3 py-2">
                <p className="font-medium text-ink">{tip.title}</p>
                <p className="mt-0.5 text-xs">{tip.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function ReadingStudyGuidePanel() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-ink">How OET Reading works</h2>
      <p className="mt-2 text-sm text-ink-soft">
        60 minutes · 42 questions · same format for all 12 professions. Locale-specific vocabulary
        in our passages matches your destination country.
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
    </section>
  );
}
