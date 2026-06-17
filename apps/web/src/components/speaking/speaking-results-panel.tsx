"use client";

import Link from "next/link";

import type { RolePlayCard } from "@/content/speaking";
import { tipsForSpeakingTags } from "@/lib/speaking/exam-guide";
import type { TranscriptAnalysis } from "@/lib/speaking/analyse-transcript";
import type { SpeakingSubmitResult } from "@/lib/speaking/submit-attempt";

interface SpeakingResultsPanelProps {
  card: RolePlayCard;
  result: SpeakingSubmitResult;
  backHref: string;
}

export function SpeakingResultsPanel({ card, result, backHref }: SpeakingResultsPanelProps) {
  const { analysis, feedback, skillMapUpdated, overallScore } = result;
  const grade = (feedback.grade_estimate as string) ?? (overallScore >= 0.75 ? "B" : "C+");
  const weakTags = (feedback.weak_tags as string[]) ?? analysis.weakTags;
  const tips = tipsForSpeakingTags(weakTags);
  const actions = (feedback.actions as string[]) ?? analysis.suggestedPhrases;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Speaking
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Role-play results</h1>
        <p className="mt-1 text-sm text-ink-soft">{card.setting}</p>
      </header>

      <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/30 p-5">
        <p className="text-[10px] font-semibold uppercase text-brand-primary">Indicative grade</p>
        <p className="mt-1 text-3xl font-bold text-ink">{grade}</p>
        <p className="mt-2 text-sm text-ink-soft">{String(feedback.feedback ?? "")}</p>
        {skillMapUpdated && (
          <p className="mt-2 text-xs text-success">Skill Map updated — plan will adapt.</p>
        )}
        {result.queuedForSync && (
          <p className="mt-2 text-xs text-warning">AI feedback queued — syncs when online.</p>
        )}
      </section>

      <TaskCoverageSection analysis={analysis} />
      <IceSection analysis={analysis} />

      {actions.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="font-semibold text-ink">Suggested phrases</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-soft">
            {actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {tips.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="font-semibold text-ink">Study tips</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {tips.map((t) => (
              <li key={t.id}>
                <span className="font-medium text-ink">{t.title}</span>
                <span className="text-ink-soft"> — {t.body}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-ink-soft">
        OET speaking is assessed on linguistic + clinical communication criteria by trained
        examiners. This practice analysis is indicative only — not an official OET grade.
      </p>

      <Link
        href={backHref}
        className="inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
      >
        Back to Speaking hub
      </Link>
    </div>
  );
}

function TaskCoverageSection({ analysis }: { analysis: TranscriptAnalysis }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">Task checklist</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {analysis.taskCoverage.map((t) => (
          <li key={t.task} className="flex items-start gap-2">
            <span className={t.addressed ? "text-success" : "text-danger"}>
              {t.addressed ? "✓" : "○"}
            </span>
            <span className="text-ink-soft">{t.task}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function IceSection({ analysis }: { analysis: TranscriptAnalysis }) {
  const { iceCoverage } = analysis;
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">ICE coverage (transcript)</h3>
      <ul className="mt-2 flex flex-wrap gap-3 text-sm">
        <IceBadge label="Ideas" ok={iceCoverage.ideas} />
        <IceBadge label="Concerns" ok={iceCoverage.concerns} />
        <IceBadge label="Expectations" ok={iceCoverage.expectations} />
      </ul>
      {analysis.wordsPerMinute && (
        <p className="mt-3 text-xs text-ink-soft">
          ~{analysis.wordsPerMinute} words/min · {analysis.fillerCount} filler words detected
        </p>
      )}
    </section>
  );
}

function IceBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-medium ${ok ? "bg-success/15 text-success" : "bg-danger/10 text-danger"}`}
    >
      {label} {ok ? "✓" : "—"}
    </span>
  );
}
