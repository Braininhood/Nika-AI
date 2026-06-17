"use client";

import Link from "next/link";

import type { ReadinessStatus } from "@/lib/adaptive/types";

const STATE_LABELS: Record<ReadinessStatus["state"], string> = {
  studying: "Building skills",
  mock_eligible: "Mock unlocked",
  mock_pass_pending: "1 of 2 mocks passed",
  exam_ready: "Exam ready",
};

const STATE_COLORS: Record<ReadinessStatus["state"], string> = {
  studying: "border-border bg-surface-muted",
  mock_eligible: "border-forest/40 bg-forest/5",
  mock_pass_pending: "border-brand-primary/40 bg-brand-primary/5",
  exam_ready: "border-forest bg-forest/10",
};

interface ReadinessCardProps {
  status: ReadinessStatus;
  compact?: boolean;
}

export function ReadinessCard({ status, compact = false }: ReadinessCardProps) {
  const showMockCta =
    status.state === "mock_eligible" ||
    status.state === "mock_pass_pending" ||
    status.state === "exam_ready";

  return (
    <section
      className={`rounded-2xl border p-4 ${STATE_COLORS[status.state]}`}
      aria-label="Exam readiness"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Readiness
          </p>
          <h2 className="mt-1 text-lg font-bold text-ink">{STATE_LABELS[status.state]}</h2>
          {status.state === "mock_pass_pending" && (
            <p className="mt-1 text-sm text-forest font-medium">
              {status.consecutiveMockPasses} / 2 consecutive passes
            </p>
          )}
        </div>
        {status.state === "exam_ready" && (
          <span className="rounded-full bg-forest px-2 py-1 text-xs font-bold text-white">
            Ready
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-soft">{status.nikaMessage}</p>

      {status.mlPrediction && (
        <p className="mt-2 text-xs text-ink-soft">
          AI readiness estimate:{" "}
          <span className="font-semibold text-ink">
            {Math.round(status.mlPrediction.probability * 100)}%
          </span>{" "}
          (from your study patterns — not an official OET score)
        </p>
      )}

      {!compact && (
        <ul className="mt-4 space-y-2">
          {status.gates.map((gate) => (
            <li key={gate.id} className="flex items-start gap-2 text-xs">
              <span aria-hidden className={gate.met ? "text-forest" : "text-ink-soft"}>
                {gate.met ? "✓" : "○"}
              </span>
              <span className={gate.met ? "text-ink" : "text-ink-soft"}>
                <span className="font-medium">{gate.label}</span>
                {" — "}
                {gate.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      {status.rediagnosticDue && (
        <p className="mt-3 text-xs text-ink-soft">
          Re-diagnostic recommended —{" "}
          <Link href="/diagnostic" className="font-medium text-brand-primary hover:underline">
            refresh your Skill Map
          </Link>
        </p>
      )}

      {showMockCta && (
        <Link
          href="/mock"
          className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink hover:opacity-90"
        >
          {status.state === "exam_ready" ? "Take a maintenance mock" : "Start OET mock"}
        </Link>
      )}
    </section>
  );
}
