"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";

const WRITING_PARTS = [
  {
    title: "Reading time — 5 min",
    body: "Read case notes and the task. Decide purpose, reader, and which facts matter before you write.",
  },
  {
    title: "Writing time — 40 min",
    body: "Produce a formal letter (~180–220 words). Referral, discharge, or update — genre must match the task.",
  },
  {
    title: "Six criteria",
    body: "Purpose, Content, Conciseness & Clarity, Genre & Style, Organisation & Layout, Language — all scored together for Grade B/C.",
  },
] as const;

const WRITING_MISTAKES = [
  {
    mistake: "Including irrelevant history",
    fix: "Only facts that support the referral purpose — leave resolved childhood issues out.",
  },
  {
    mistake: "Informal tone",
    fix: "Use formal clinical register. No chatty phrases in GP or specialist letters.",
  },
  {
    mistake: "Burying the request",
    fix: "State purpose early and place a clear action request where the reader expects it.",
  },
] as const;

export function WritingStudyGuidePanel() {
  return (
    <CollapsibleSection
      title="How OET Writing works"
      subtitle="5 + 40 min · ~180–220 words · six criteria · profession-specific case notes"
      defaultOpen={false}
    >
      <p className="text-sm text-ink-soft">
        Same task structure for all 12 professions — your role determines case-note content and letter
        type (referral, discharge, update).
      </p>

      <dl className="mt-4 grid gap-3 text-sm">
        {WRITING_PARTS.map((row) => (
          <div key={row.title} className="rounded-xl bg-surface-muted px-3 py-2">
            <dt className="font-medium text-brand-primary">{row.title}</dt>
            <dd className="mt-1 text-ink-soft">{row.body}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-ink">Common mistakes we train against</h3>
      <ul className="mt-2 space-y-2 text-xs text-ink-soft">
        {WRITING_MISTAKES.map((row) => (
          <li key={row.mistake} className="border-l-2 border-brand-primary/30 pl-2">
            <strong className="text-ink">{row.mistake}:</strong> {row.fix}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
