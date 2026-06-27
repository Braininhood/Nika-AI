"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";

export interface StrongWeakExamplesPanelProps {
  goodExample: string;
  weakExample: string;
  tip: string;
  title?: string;
  defaultOpen?: boolean;
}

export function StrongWeakExamplesPanel({
  goodExample,
  weakExample,
  tip,
  title = "Strong & weak examples",
  defaultOpen = false,
}: StrongWeakExamplesPanelProps) {
  const subtitle = tip.length > 72 ? `${tip.slice(0, 69)}…` : tip;

  return (
    <CollapsibleSection title={title} subtitle={subtitle} defaultOpen={defaultOpen} variant="accent">
      <div className="grid gap-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase text-forest">Strong example</p>
          <p className="mt-1 break-words text-ink">{goodExample}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-danger">Weak example</p>
          <p className="mt-1 break-words text-ink-soft">{weakExample}</p>
        </div>
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-ink-soft">
          <strong className="text-ink">Tip:</strong> {tip}
        </p>
      </div>
    </CollapsibleSection>
  );
}
