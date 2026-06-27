"use client";

import Link from "next/link";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { ModelLetterPanel } from "@/components/writing/model-letter-panel";
import { ScenarioGradedSamplesPanel } from "@/components/writing/scenario-graded-samples-panel";
import { getScenario } from "@/content/writing/scenarios";
import { samplesForScenario, weakSampleForProfession } from "@/content/writing/sample-letters";
import { gradeBSampleForScenario } from "@/lib/writing/recommendations";
import { criterionScoreCards, type ChecklistItem } from "@/lib/writing/submit-feedback";

const LESSON_BY_CRITERION: Record<string, { href: string; label: string }> = {
  purpose: { href: "/writing/learn/w-lesson-purpose", label: "Purpose lesson" },
  content: { href: "/writing/learn/w-lesson-content", label: "Content lesson" },
  conciseness: { href: "/writing/learn/w-lesson-concise", label: "Conciseness lesson" },
  genre: { href: "/writing/learn/w-lesson-genre", label: "Genre & Style lesson" },
  organisation: { href: "/writing/learn/w-lesson-org", label: "Organisation lesson" },
  language: { href: "/writing/learn/w-lesson-language", label: "Language lesson" },
};

interface FeedbackPanelProps {
  feedback: Record<string, unknown>;
  checklist: ChecklistItem[];
  queuedForSync?: boolean;
  criterionScores?: Record<string, number>;
  scenarioId?: string;
  letterText?: string;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}

export function FeedbackPanel({
  feedback,
  checklist,
  queuedForSync,
  criterionScores: scoresProp,
  scenarioId,
  letterText,
}: FeedbackPanelProps) {
  const scores = scoresProp ?? ((feedback.criterion_scores ?? {}) as Record<string, number>);
  const cards = criterionScoreCards(scores);
  const weakCriteria = Object.entries(scores)
    .filter(([, score]) => score < 0.6)
    .map(([key]) => key);

  const strengths = asStringArray(feedback.strengths);
  const improvements = asStringArray(feedback.improvements);
  const missedFacts = asStringArray(feedback.missed_facts);
  const actions = asStringArray(feedback.actions);

  const modelSample = scenarioId ? gradeBSampleForScenario(scenarioId) : undefined;
  const scenarioSamples = scenarioId ? samplesForScenario(scenarioId) : [];
  const scenarioGradeC = scenarioSamples.find((s) => s.estimatedOverall === "C");
  const scenarioProfession = scenarioId ? getScenario(scenarioId)?.profession : undefined;
  const weakSample =
    scenarioGradeC ??
    (scenarioProfession ? weakSampleForProfession(scenarioProfession) : undefined);
  const showWeakSample = weakCriteria.length > 0 && weakSample;
  const hasScenarioPair = Boolean(modelSample && scenarioGradeC);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/25 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Nika feedback
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">Your letter — reviewed</h2>
        {feedback.grade_estimate != null && feedback.grade_estimate !== "" && (
          <p className="mt-2 text-sm font-semibold text-brand-primary">
            Indicative grade: {String(feedback.grade_estimate)}
          </p>
        )}
        <p className="mt-2 text-sm text-ink">{String(feedback.feedback ?? "")}</p>
        {queuedForSync && (
          <p className="mt-2 text-xs text-ink-soft">
            Detailed AI polish queued — sync when back online. Analysis below is ready now.
          </p>
        )}
      </section>

      {letterText ? (
        <CollapsibleSection title="Your submitted letter" defaultOpen={false} badge="Draft">
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-muted p-3 text-xs leading-relaxed text-ink">
            {letterText}
          </pre>
        </CollapsibleSection>
      ) : null}

      {strengths.length > 0 && (
        <section className="rounded-2xl border border-forest/30 bg-forest/5 p-5">
          <h2 className="font-semibold text-forest-deep">What you did well</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {strengths.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-forest" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(improvements.length > 0 || missedFacts.length > 0) && (
        <section className="rounded-2xl border border-danger/25 bg-danger/5 p-5">
          <h2 className="font-semibold text-ink">What to improve</h2>
          {improvements.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm text-ink">
              {improvements.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-danger" aria-hidden>
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          {missedFacts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Missing from your letter
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {missedFacts.map((fact) => (
                  <li key={fact} className="rounded-lg bg-surface/80 px-3 py-2">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold text-ink">Quick checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {checklist.map((item) => (
            <li key={item.id} className="flex gap-2">
              <span aria-hidden>{item.passed ? "✓" : "○"}</span>
              <span className={item.passed ? "text-forest" : "text-ink"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {cards.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold text-ink">OET criteria scores</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {cards.map((c) => (
              <li key={c.name} className="rounded-lg bg-surface-muted px-3 py-2">
                <span className="text-ink-soft">{c.label}</span>
                <span className="ml-2 font-semibold text-ink">{Math.round(c.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ModelLetterPanel sample={modelSample} scenarioId={scenarioId} />

      {scenarioId && hasScenarioPair && (
        <ScenarioGradedSamplesPanel scenarioId={scenarioId} defaultOpen={false} />
      )}

      {weakCriteria.length > 0 && (
        <section className="rounded-2xl border border-dashed border-brand-primary bg-brand-accent-soft/30 p-5 text-sm">
          <h2 className="font-semibold text-ink">Recommended next steps</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {weakCriteria.map((key) => {
              const lesson = LESSON_BY_CRITERION[key];
              if (!lesson) return null;
              return (
                <li key={key}>
                  <SecondaryActionLink href={lesson.href}>{lesson.label}</SecondaryActionLink>
                </li>
              );
            })}
            <li>
              <SecondaryActionLink href="/writing/learn/drills">Content drills</SecondaryActionLink>
            </li>
            {modelSample && (
              <li>
                <SecondaryActionLink href={`/writing/learn/samples/${modelSample.id}`}>
                  Grade B sample
                </SecondaryActionLink>
              </li>
            )}
            {showWeakSample && weakSample && (
              <li>
                <SecondaryActionLink
                  href={`/writing/learn/samples/${weakSample.id}`}
                  className="border-danger/30 text-danger hover:bg-danger/5"
                >
                  Grade C — what to avoid
                </SecondaryActionLink>
              </li>
            )}
          </ul>
        </section>
      )}

      {actions.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
          <h2 className="font-semibold text-ink">Action plan</h2>
          <ul className="mt-2 list-disc pl-5 text-ink-soft">
            {actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs text-ink-soft">Skill Map and Today&apos;s plan updated.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link
          href="/dashboard"
          className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Today&apos;s plan
        </Link>
        <Link
          href="/writing/practice"
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Try another scenario
        </Link>
        <Link
          href="/progress"
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
        >
          View progress
        </Link>
      </div>
    </div>
  );
}
