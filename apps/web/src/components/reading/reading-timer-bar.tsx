"use client";

import { useEffect, useState } from "react";

import { timerWarningMessage } from "@/lib/reading/exam-guide";

export type ReadingTimerMode = "part_a" | "part_bc" | "part_b_drill" | "part_c_drill";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const DEFAULT_DURATIONS: Record<ReadingTimerMode, number> = {
  part_a: 15 * 60,
  part_bc: 45 * 60,
  part_b_drill: 20 * 60,
  part_c_drill: 25 * 60,
};

const LABELS: Record<ReadingTimerMode, string> = {
  part_a: "Part A · 15 min exam lock",
  part_bc: "Parts B & C · 45 min shared (≈20 B + ≈25 C)",
  part_b_drill: "Part B practice · suggested 20 min",
  part_c_drill: "Part C practice · suggested 25 min",
};

interface ReadingTimerBarProps {
  mode: ReadingTimerMode;
  /** Override default duration (seconds). */
  durationSeconds?: number;
  locked?: boolean;
  onExpire?: () => void;
}

export function ReadingTimerBar({
  mode,
  durationSeconds,
  locked = false,
  onExpire,
}: ReadingTimerBarProps) {
  const total = durationSeconds ?? DEFAULT_DURATIONS[mode];
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [expired, setExpired] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    setRemaining(total);
    setRunning(false);
    setExpired(false);
  }, [total, mode]);

  useEffect(() => {
    if (!running || expired) return;
    const id = window.setInterval(() => {
      setRemaining((t) => {
        const warning =
          mode === "part_a" || mode === "part_bc"
            ? timerWarningMessage(mode === "part_a" ? "part_a" : "part_bc", t)
            : null;
        if (warning) setFlash(warning);
        if (t <= 1) {
          setExpired(true);
          setRunning(false);
          onExpire?.();
        }
        return t <= 1 ? 0 : t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, expired, onExpire, mode]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 5000);
    return () => window.clearTimeout(id);
  }, [flash]);

  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const urgent = mode === "part_a" && remaining <= 2 * 60 && running;
  const label = LABELS[mode];

  return (
    <section
      className={`rounded-2xl border p-4 ${
        expired || locked
          ? "border-danger/50 bg-danger/5"
          : urgent
            ? "border-danger/40 bg-danger/5"
            : "border-border bg-surface"
      }`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="min-w-0 flex-1 font-semibold text-ink">{label}</span>
        {!running && !expired ? (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="min-h-9 shrink-0 rounded-lg bg-brand-accent px-3 py-2 text-xs font-semibold text-ink"
          >
            Start timer
          </button>
        ) : (
          <span className={`font-mono ${expired || urgent ? "text-danger" : "text-brand-primary"}`}>
            {expired ? "Time up — locked" : formatTime(remaining)}
          </span>
        )}
      </div>
      {(running || expired) && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className={`h-full transition-all ${expired || urgent ? "bg-danger" : "bg-brand-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {flash && running && (
        <p className="mt-2 text-xs font-medium text-danger" role="status">
          {flash}
        </p>
      )}
      {expired && (
        <p className="mt-2 text-xs text-danger">
          Exam conditions: answers are locked. Submit to review with explanations.
        </p>
      )}
      {(mode === "part_b_drill" || mode === "part_c_drill") && !running && (
        <p className="mt-2 text-xs text-ink-soft">
          Practice timer — optional. Full exam uses the 45-minute B+C block on Exam mode.
        </p>
      )}
    </section>
  );
}

export function useReadingTimerLock(mode: ReadingTimerMode) {
  const [locked, setLocked] = useState(false);
  return {
    locked,
    onExpire: () => setLocked(true),
    mode,
  };
}
