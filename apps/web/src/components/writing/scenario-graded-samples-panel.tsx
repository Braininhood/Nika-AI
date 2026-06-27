"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import {
  samplesForScenario,
  type GradedSampleLetter,
} from "@/content/writing/sample-letters";

const GRADE_STYLES: Record<string, string> = {
  A: "bg-success/15 text-forest-deep",
  B: "bg-brand-accent-soft text-brand-primary-strong",
  C: "bg-danger/10 text-danger",
};

function letterPreview(sample: GradedSampleLetter, maxChars = 480): string {
  const text = sample.paragraphs.map((p) => p.text).join("\n\n");
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
}

function SamplePreviewCard({
  sample,
  highlight,
}: {
  sample: GradedSampleLetter;
  highlight: "good" | "weak";
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 ${
        highlight === "good"
          ? "border-brand-primary/30 bg-brand-accent-soft/15"
          : "border-danger/25 bg-danger/5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${GRADE_STYLES[sample.estimatedOverall]}`}
        >
          Grade {sample.estimatedOverall}
        </span>
        <h3 className="text-sm font-semibold text-ink">{sample.title}</h3>
      </div>
      <p className="mt-1 text-xs text-ink-soft">{sample.wordCount} words</p>
      <pre className="mt-3 max-h-44 flex-1 overflow-auto whitespace-pre-wrap rounded-xl bg-surface p-3 text-xs leading-relaxed text-ink">
        {letterPreview(sample)}
      </pre>
      <p className="mt-3 text-xs text-ink-soft">{sample.assessorSummary}</p>
      <SecondaryActionLink href={`/writing/learn/samples/${sample.id}`} className="mt-3">
        Full annotated sample →
      </SecondaryActionLink>
    </article>
  );
}

interface ScenarioGradedSamplesPanelProps {
  scenarioId: string;
  defaultOpen?: boolean;
}

export function ScenarioGradedSamplesPanel({
  scenarioId,
  defaultOpen = false,
}: ScenarioGradedSamplesPanelProps) {
  const samples = samplesForScenario(scenarioId);
  const gradeB = samples.find(
    (s) => s.estimatedOverall === "B" || s.estimatedOverall === "A",
  );
  const gradeC = samples.find((s) => s.estimatedOverall === "C");

  if (!gradeB && !gradeC) return null;

  const hasPair = Boolean(gradeB && gradeC);
  const subtitle = hasPair
    ? "Compare Grade B (strong) vs Grade C (weak) for this exact scenario."
    : "Model letter linked to this practice task.";

  return (
    <CollapsibleSection
      title={hasPair ? "Grade B vs C — this scenario" : "Graded sample — this scenario"}
      subtitle={subtitle}
      defaultOpen={defaultOpen}
      variant="samples"
      badge={hasPair ? "Examples" : "Sample"}
    >
      <p className="text-xs text-ink-soft">
        Read these after drafting your own letter — same case notes, different criteria scores.
      </p>
      <div
        className={`mt-4 grid gap-4 ${gradeB && gradeC ? "md:grid-cols-2" : "grid-cols-1"}`}
      >
        {gradeB ? <SamplePreviewCard sample={gradeB} highlight="good" /> : null}
        {gradeC ? <SamplePreviewCard sample={gradeC} highlight="weak" /> : null}
      </div>
    </CollapsibleSection>
  );
}
