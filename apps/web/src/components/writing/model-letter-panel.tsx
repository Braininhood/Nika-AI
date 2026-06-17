import Link from "next/link";

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
    <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-semibold text-ink">Grade B model — compare your letter</h2>
        <span className="rounded-full bg-brand-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-primary">
          Grade {sample.estimatedOverall}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">{sample.title}</p>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink">
        {preview}
        {preview.length >= 520 ? "…" : ""}
      </pre>
      <Link
        href={`/writing/learn/samples/${sample.id}`}
        className="mt-3 inline-flex text-sm font-medium text-brand-primary hover:underline"
      >
        Full annotated sample →
      </Link>
    </section>
  );
}
