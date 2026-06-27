import Link from "next/link";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import type { GradedSampleLetter } from "@/content/writing/sample-letters";

interface ModelLetterPanelProps {
  sample?: GradedSampleLetter;
  scenarioId?: string;
}

export function ModelLetterPanel({ sample, scenarioId }: ModelLetterPanelProps) {
  if (!sample) {
    if (!scenarioId) return null;
    return (
      <section className="rounded-2xl border border-dashed border-border bg-surface-muted/50 p-4 text-sm text-ink-soft">
        <p>
          No Grade B model letter for this scenario yet. Browse{" "}
          <Link href="/writing/learn/samples" className="text-brand-primary hover:underline">
            graded samples
          </Link>{" "}
          for your profession.
        </p>
      </section>
    );
  }

  const preview = sample.paragraphs
    .map((p) => p.text)
    .join("\n\n")
    .slice(0, 520);

  return (
    <CollapsibleSection
      title="Grade B model — compare your letter"
      subtitle={sample.title}
      badge={`Grade ${sample.estimatedOverall}`}
      defaultOpen={false}
      variant="accent"
    >
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink">
        {preview}
        {preview.length >= 520 ? "…" : ""}
      </pre>
      <SecondaryActionLink href={`/writing/learn/samples/${sample.id}`} className="mt-3">
        Full annotated sample →
      </SecondaryActionLink>
    </CollapsibleSection>
  );
}
