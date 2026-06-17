"use client";

import type { CaseNote, WritingScenario } from "@/content/writing/scenarios";

interface CaseNotesPanelProps {
  scenario: WritingScenario;
  title?: string;
}

export function CaseNotesPanel({ scenario, title = "Case notes" }: CaseNotesPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4" aria-labelledby="case-notes-heading">
      <h2 id="case-notes-heading" className="text-sm font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-2 text-sm text-ink-soft">{scenario.taskSheet.instruction}</p>
      <ul className="mt-3 list-disc pl-5 text-xs text-ink-soft">
        {scenario.taskSheet.bulletPoints.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {scenario.caseNotes.map((note: CaseNote) => (
          <li key={note.id} className="border-l-2 border-border pl-3">
            {note.date && (
              <span className="text-xs text-brand-primary">{note.date} · </span>
            )}
            {note.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
