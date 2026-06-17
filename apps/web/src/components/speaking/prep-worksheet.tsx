"use client";

import {
  PREP_WORKSHEET_FIELDS,
  type PrepWorksheet,
} from "@/lib/speaking/exam-guide";

interface PrepWorksheetFormProps {
  value: PrepWorksheet;
  onChange: (next: PrepWorksheet) => void;
  readOnly?: boolean;
}

export function PrepWorksheetForm({ value, onChange, readOnly }: PrepWorksheetFormProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">Prep worksheet</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Structured plan — mirrors what strong candidates write in the 3-minute prep window.
      </p>
      <div className="mt-4 space-y-4">
        {PREP_WORKSHEET_FIELDS.map((field) => (
          <label key={field.id} className="block">
            <span className="text-sm font-medium text-ink">{field.label}</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-border bg-surface-muted/30 px-3 py-2 text-sm text-ink"
              rows={2}
              placeholder={field.placeholder}
              value={value[field.id]}
              readOnly={readOnly}
              onChange={(e) => onChange({ ...value, [field.id]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
