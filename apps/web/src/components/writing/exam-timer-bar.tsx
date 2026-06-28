"use client";

import { useEffect, useState } from "react";

import { SecondaryActionButton } from "@/components/ui/secondary-action-button";

export type ExamPhase = "reading" | "writing" | "done";

const READ_SECONDS = 5 * 60;
const WRITE_SECONDS = 40 * 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ExamTimerBarProps {
  phase: ExamPhase;
  onPhaseChange: (phase: ExamPhase) => void;
  /** Hide skip-to-writing — real exam conditions. */
  strict?: boolean;
}

export function ExamTimerBar({ phase, onPhaseChange, strict = false }: ExamTimerBarProps) {
  const [readingLeft, setReadingLeft] = useState(READ_SECONDS);
  const [writingLeft, setWritingLeft] = useState(WRITE_SECONDS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || phase === "done") return;
    const id = window.setInterval(() => {
      if (phase === "reading") {
        setReadingLeft((t) => {
          if (t <= 1) {
            onPhaseChange("writing");
            return 0;
          }
          return t - 1;
        });
      } else if (phase === "writing") {
        setWritingLeft((t) => {
          if (t <= 1) {
            onPhaseChange("done");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, phase, onPhaseChange]);

  const start = () => {
    setRunning(true);
    onPhaseChange("reading");
  };

  const skipToWriting = () => {
    setReadingLeft(0);
    onPhaseChange("writing");
  };

  const remaining = phase === "reading" ? readingLeft : writingLeft;
  const total = phase === "reading" ? READ_SECONDS : WRITE_SECONDS;
  const pct = phase === "done" ? 100 : ((total - remaining) / total) * 100;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-ink">Exam mode</span>
        {!running ? (
          <button
            type="button"
            onClick={start}
            className="shrink-0 rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-ink min-h-9"
          >
            Start timers (5 + 40 min)
          </button>
        ) : (
          <span className="font-mono text-brand-primary">
            {phase === "done" ? "Time up" : `${phase === "reading" ? "Reading" : "Writing"} · ${formatTime(remaining)}`}
          </span>
        )}
      </div>
      {running && phase !== "done" && (
        <>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full bg-brand-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          {phase === "reading" && !strict && (
            <SecondaryActionButton className="mt-2" onClick={skipToWriting}>
              Skip to writing phase →
            </SecondaryActionButton>
          )}
        </>
      )}
      {phase === "writing" && (
        <p className="mt-2 text-xs text-ink-soft">Case notes hidden — exam conditions.</p>
      )}
    </section>
  );
}

export function useExamPhase() {
  const [phase, setPhase] = useState<ExamPhase>("reading");
  return { phase, setPhase, hideCaseNotes: phase === "writing" || phase === "done" };
}
