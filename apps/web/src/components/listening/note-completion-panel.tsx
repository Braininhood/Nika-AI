"use client";

import type { NoteField } from "@/content/listening/types";

interface NoteCompletionPanelProps {
  template?: string;
  fields: NoteField[];
  responses: Record<string, string>;
  disabled?: boolean;
  showFeedback?: boolean;
  correctAnswers?: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export function NoteCompletionPanel({
  template,
  fields,
  responses,
  disabled = false,
  showFeedback = false,
  correctAnswers = {},
  onChange,
}: NoteCompletionPanelProps) {
  if (template) {
    const parts = template.split(/(\{\{[^}]+\}\})/);
    return (
      <div className="rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed">
        {parts.map((part, i) => {
          const match = part.match(/\{\{([^}]+)\}\}/);
          if (!match) {
            return (
              <span key={i} className="whitespace-pre-wrap text-ink-soft">
                {part}
              </span>
            );
          }
          const fieldId = match[1]!;
          const correct = correctAnswers[fieldId];
          const value = responses[fieldId] ?? "";
          const isCorrect =
            showFeedback &&
            correct &&
            value.trim().toLowerCase() === correct.trim().toLowerCase();

          return (
            <span key={i} className="inline-block mx-0.5">
              <input
                type="text"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(fieldId, e.target.value)}
                className={`min-w-[8rem] border-b-2 bg-transparent px-1 py-0.5 outline-none ${
                  showFeedback
                    ? isCorrect
                      ? "border-forest text-forest"
                      : "border-danger text-danger"
                    : "border-brand-primary/50"
                }`}
                aria-label={fields.find((f) => f.id === fieldId)?.label ?? fieldId}
              />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const value = responses[field.id] ?? "";
        const correct = correctAnswers[field.id];
        const isCorrect =
          showFeedback &&
          correct &&
          value.trim().toLowerCase() === correct.trim().toLowerCase();

        return (
          <label key={field.id} className="block text-sm">
            <span className="font-medium text-ink">{field.label}</span>
            <input
              type="text"
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(field.id, e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                showFeedback
                  ? isCorrect
                    ? "border-forest bg-forest/5"
                    : "border-danger bg-danger/5"
                  : "border-border bg-surface"
              }`}
            />
            {showFeedback && correct && !isCorrect && (
              <span className="mt-1 block text-xs text-ink-soft">Expected: {correct}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
