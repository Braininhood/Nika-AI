"use client";

import { PROFESSIONS } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";

interface ProfessionPickerProps {
  value?: OetProfession;
  onChange: (profession: OetProfession) => void;
}

export function ProfessionPicker({ value, onChange }: ProfessionPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PROFESSIONS.map((profession) => {
        const selected = value === profession.code;
        const displayLabel =
          profession.label.length >= 14 ? profession.shortLabel : profession.label;

        return (
          <button
            key={profession.code}
            type="button"
            onClick={() => onChange(profession.code)}
            aria-pressed={selected}
            aria-label={profession.label}
            title={profession.label}
            className={`flex min-h-[5.75rem] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent sm:min-h-[6.25rem] sm:px-3 ${
              selected
                ? "border-brand-primary bg-brand-accent-soft shadow-sm"
                : "border-border bg-surface hover:border-brand-primary/25 hover:bg-surface-muted"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${profession.iconBg}`}
              aria-hidden
            >
              {profession.icon}
            </span>
            <span
              className={`max-w-full text-xs leading-snug sm:text-sm ${
                selected ? "font-semibold text-ink" : "font-medium text-ink"
              }`}
            >
              {displayLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
