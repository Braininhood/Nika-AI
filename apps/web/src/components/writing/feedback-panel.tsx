"use client";

import Link from "next/link";

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
}

export function FeedbackPanel({
  feedback,
  checklist,
  queuedForSync,
  criterionScores: scoresProp,
  scenarioId,
}: FeedbackPanelProps) {
  const scores = scoresProp ?? ((feedback.criterion_scores ?? {}) as Record<string, number>);
  const cards = criterionScoreCards(scores);
  const weakCriteria = Object.entries(scores)
    .filter(([, score]) => score < 0.6)
    .map(([key]) => key);
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
    <>
      <section className="rounded-2xl border border-border bg-surface p-4">
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
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-semibold text-ink">Criteria snapshot</h2>
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
        <ScenarioGradedSamplesPanel scenarioId={scenarioId} defaultExpanded={false} />
      )}

      {weakCriteria.length > 0 && (
        <section className="rounded-2xl border border-dashed border-brand-primary bg-brand-accent-soft/30 p-4 text-sm">
          <h2 className="font-semibold text-ink">Recommended next steps</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {weakCriteria.map((key) => {
              const lesson = LESSON_BY_CRITERION[key];
              if (!lesson) return null;
              return (
                <li key={key}>
                  <Link
                    href={lesson.href}
                    className="inline-flex rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-brand-primary hover:underline"
                  >
                    {lesson.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/writing/learn/drills"
                className="inline-flex rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-brand-primary hover:underline"
              >
                Content drills
              </Link>
            </li>
            {modelSample && (
              <li>
                <Link
                  href={`/writing/learn/samples/${modelSample.id}`}
                  className="inline-flex rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-brand-primary hover:underline"
                >
                  Grade B sample
                </Link>
              </li>
            )}
            {showWeakSample && weakSample && (
              <li>
                <Link
                  href={`/writing/learn/samples/${weakSample.id}`}
                  className="inline-flex rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-danger hover:underline"
                >
                  Grade C — what to avoid
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-forest/30 bg-forest/5 p-4 text-sm">
        <h2 className="font-semibold text-forest-deep">Feedback</h2>
        {feedback.grade_estimate != null && feedback.grade_estimate !== "" && (
          <p className="mt-1 text-xs font-medium text-brand-primary">
            Indicative: {String(feedback.grade_estimate)}
          </p>
        )}
        <p className="mt-2 text-ink">{String(feedback.feedback ?? "")}</p>
        {queuedForSync && (
          <p className="mt-2 text-xs text-ink-soft">
            AI feedback queued — check the sync badge in the header when back online.
          </p>
        )}
        {Array.isArray(feedback.actions) && (
          <ul className="mt-3 list-disc pl-5 text-ink-soft">
            {(feedback.actions as string[]).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-soft">Skill Map and Today&apos;s plan updated.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl bg-brand-accent px-4 py-2 font-semibold text-ink"
          >
            Today&apos;s plan
          </Link>
          <Link
            href="/progress"
            className="rounded-xl border border-border px-4 py-2 font-semibold text-ink"
          >
            View progress
          </Link>
        </div>
      </section>
    </>
  );
}
