"use client";

import {
  checklistByGroup,
  CLINICAL_CHECKLIST_GROUPS,
  type ClinicalChecklistGroup,
} from "@/lib/speaking/clinical-checklist";

interface ClinicalChecklistPanelProps {
  ratings: Record<string, boolean>;
  suggestions?: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
  readOnly?: boolean;
}

export function ClinicalChecklistPanel({
  ratings,
  suggestions = {},
  onChange,
  readOnly,
}: ClinicalChecklistPanelProps) {
  const grouped = checklistByGroup();

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">Clinical communication checklist</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Self-rate against OET descriptors · AI may pre-suggest items from your transcript
      </p>

      {(Object.keys(grouped) as ClinicalChecklistGroup[]).map((group) => (
        <div key={group} className="mt-4">
          <p className="text-sm font-medium text-ink">{CLINICAL_CHECKLIST_GROUPS[group].title}</p>
          <p className="text-xs text-ink-soft">{CLINICAL_CHECKLIST_GROUPS[group].description}</p>
          <ul className="mt-2 space-y-2">
            {grouped[group].map((item) => {
              const suggested = suggestions[item.id];
              const checked = ratings[item.id] ?? false;
              return (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={checked}
                      disabled={readOnly}
                      onChange={(e) => onChange(item.id, e.target.checked)}
                    />
                    <span className={checked ? "text-ink" : "text-ink-soft"}>
                      {item.label}
                      {suggested && !checked && (
                        <span className="ml-1 text-xs text-brand-primary">(suggested from transcript)</span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
