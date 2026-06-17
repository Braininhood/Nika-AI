"use client";

import { useEffect, useState } from "react";

interface PrepTimerProps {
  totalMinutes: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function PrepTimer({ totalMinutes, onExpire, autoStart = true }: PrepTimerProps) {
  const totalSec = totalMinutes * 60;
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(autoStart);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setExpired(true);
          onExpire?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, remaining, onExpire]);

  const warn = remaining <= 30 && remaining > 0;

  return (
    <div
      className={`rounded-xl border p-4 ${expired ? "border-success/40 bg-success/5" : warn ? "border-warning/40 bg-warning/5" : "border-brand-primary/30 bg-brand-accent-soft/20"}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
        Preparation time · OET exam faithful
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ink">
        {formatClock(remaining)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {expired
          ? "Prep time ended — begin your role-play when ready."
          : "Plan your opening, ICE questions, key information, and close."}
      </p>
      {!expired && (
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="mt-3 text-xs text-brand-primary hover:underline"
        >
          {running ? "Pause prep timer" : "Resume prep timer"}
        </button>
      )}
    </div>
  );
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
