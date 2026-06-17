"use client";

import Link from "next/link";
import { useState } from "react";

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
      <Link
        href={`/writing/learn/samples/${sample.id}`}
        className="mt-3 text-sm font-medium text-brand-primary hover:underline"
      >
        Full annotated sample →
      </Link>
    </article>
  );
}

interface ScenarioGradedSamplesPanelProps {
  scenarioId: string;
  /** Collapse previews until expanded (practice page keeps open by default). */
  defaultExpanded?: boolean;
}

export function ScenarioGradedSamplesPanel({
  scenarioId,
  defaultExpanded = true,
}: ScenarioGradedSamplesPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const samples = samplesForScenario(scenarioId);
  const gradeB = samples.find(
    (s) => s.estimatedOverall === "B" || s.estimatedOverall === "A",
  );
  const gradeC = samples.find((s) => s.estimatedOverall === "C");

  if (!gradeB && !gradeC) return null;

  const hasPair = Boolean(gradeB && gradeC);

  return (
    <section className="rounded-2xl border border-brand-primary/25 bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-ink">
            {hasPair ? "Grade B vs C — this scenario" : "Graded sample — this scenario"}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            {hasPair
              ? "Compare a strong letter with a weak one before you write. Same case notes, different criteria scores."
              : "Model letter linked to this practice task."}
          </p>
        </div>
        {hasPair && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-soft hover:text-ink"
          >
            {expanded ? "Collapse" : "Expand previews"}
          </button>
        )}
      </div>

      {expanded && (
        <div
          className={`mt-4 grid gap-4 ${gradeB && gradeC ? "md:grid-cols-2" : "grid-cols-1"}`}
        >
          {gradeB ? <SamplePreviewCard sample={gradeB} highlight="good" /> : null}
          {gradeC ? <SamplePreviewCard sample={gradeC} highlight="weak" /> : null}
        </div>
      )}

      {!expanded && hasPair && gradeB && gradeC && (
        <p className="mt-3 text-xs text-ink-soft">
          <Link href={`/writing/learn/samples/${gradeB.id}`} className="text-brand-primary hover:underline">
            Grade B
          </Link>
          {" · "}
          <Link href={`/writing/learn/samples/${gradeC.id}`} className="text-danger hover:underline">
            Grade C
          </Link>
        </p>
      )}
    </section>
  );
}
