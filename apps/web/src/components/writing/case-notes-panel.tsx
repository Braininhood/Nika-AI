"use client";

import type { CaseNote, WritingScenario } from "@/content/writing/scenarios";

import { CollapsibleSection } from "@/components/ui/collapsible-section";

interface CaseNotesPanelProps {
  scenario: WritingScenario;
  title?: string;
  defaultOpen?: boolean;
}

export function CaseNotesPanel({
  scenario,
  title = "Case notes",
  defaultOpen = true,
}: CaseNotesPanelProps) {
  const subtitle = scenario.taskSheet.instruction;

  return (
    <CollapsibleSection
      title={title}
      subtitle={subtitle}
      defaultOpen={defaultOpen}
      badge={`${scenario.caseNotes.length} notes`}
    >
      <p className="text-sm text-ink-soft">{scenario.taskSheet.instruction}</p>
      <ul className="mt-3 list-disc pl-5 text-xs text-ink-soft">
        {scenario.taskSheet.bulletPoints.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <ul className="mt-4 space-y-2 text-sm text-ink-soft">
        {scenario.caseNotes.map((note: CaseNote) => (
          <li
            key={note.id}
            className={`border-l-2 pl-3 ${note.relevant === false ? "border-warning/50 opacity-80" : "border-border"}`}
          >
            {note.date && (
              <span className="text-xs text-brand-primary">{note.date} · </span>
            )}
            {note.text}
            {note.relevant === false ? (
              <span className="ml-1 text-[10px] uppercase text-ink-soft"> · optional</span>
            ) : null}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
