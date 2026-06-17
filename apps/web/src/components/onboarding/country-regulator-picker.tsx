"use client";

import {
  formatTargetGradesSummary,
  getRegulatorsForProfession,
  getTargetGrades,
} from "@/lib/domain/requirements";
import type { OetProfession } from "@/lib/domain/types";

interface CountryRegulatorPickerProps {
  profession: OetProfession;
  regulatorCode?: string;
  onChange: (countryCode: string, regulatorCode: string) => void;
}

export function CountryRegulatorPicker({
  profession,
  regulatorCode,
  onChange,
}: CountryRegulatorPickerProps) {
  const options = getRegulatorsForProfession(profession);
  const selected = options.find((o) => o.code === regulatorCode);
  const previewGrades = regulatorCode ? getTargetGrades(regulatorCode) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        Where are you registering? We&apos;ll set your target grades from official
        regulator requirements.
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selectedOption = regulatorCode === option.code;
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onChange(option.countryCode, option.code)}
              aria-pressed={selectedOption}
              className={`rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
                selectedOption
                  ? "border-brand-primary bg-brand-accent-soft"
                  : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <span className="block text-xs font-medium uppercase tracking-wide text-brand-primary">
                {option.countryLabel}
              </span>
              <span className="mt-1 block text-sm font-semibold text-ink">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected && previewGrades && (
        <div className="rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-sm">
          <p className="font-medium text-forest-deep">Your target grades</p>
          <p className="mt-1 text-ink">{formatTargetGradesSummary(previewGrades)}</p>
          {previewGrades.single_sitting && (
            <p className="mt-2 text-xs text-ink-soft">
              This regulator requires all sub-tests in a single sitting.
            </p>
          )}
          {selected.officialUrl && (
            <a
              href={selected.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-brand-primary hover:underline"
            >
              Verify on official regulator site →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
