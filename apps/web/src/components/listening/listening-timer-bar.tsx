"use client";

import { useEffect, useState } from "react";

interface ListeningTimerBarProps {
  totalMinutes: number;
  onExpire?: () => void;
  label?: string;
}

export function ListeningTimerBar({
  totalMinutes,
  onExpire,
  label = "Session timer",
}: ListeningTimerBarProps) {
  const totalSec = totalMinutes * 60;
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, remaining, onExpire]);

  const pct = totalSec ? ((totalSec - remaining) / totalSec) * 100 : 0;
  const warn = remaining <= 60 && remaining > 0;

  return (
    <div
      className={`rounded-xl border p-3 ${warn ? "border-danger/40 bg-danger/5" : "border-border bg-surface"}`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className={warn ? "font-semibold text-danger" : "text-ink-soft"}>
          {formatClock(remaining)} left
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full transition-all ${warn ? "bg-danger" : "bg-brand-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="mt-2 text-xs text-brand-primary hover:underline"
      >
        {running ? "Pause timer" : "Resume timer"}
      </button>
    </div>
  );
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
