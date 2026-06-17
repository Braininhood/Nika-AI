"use client";

import Link from "next/link";

import { formatExamDate, type ExamCountdown } from "@/lib/exam/countdown";

const URGENCY_STYLES: Record<ExamCountdown["urgency"], string> = {
  past: "border-border bg-surface-muted text-ink-soft",
  soon: "border-warning/50 bg-warning/10 text-ink",
  mid: "border-brand-primary/40 bg-brand-accent-soft/30 text-ink",
  far: "border-border bg-surface text-ink",
};

interface ExamCountdownCardProps {
  countdown: ExamCountdown;
  compact?: boolean;
  editHref?: string;
}

export function ExamCountdownCard({
  countdown,
  compact = false,
  editHref = "/profile",
}: ExamCountdownCardProps) {
  const style = URGENCY_STYLES[countdown.urgency];

  if (compact) {
    return (
      <p className={`rounded-lg px-3 py-2 text-xs ${style}`}>
        <span className="font-semibold">{countdown.label}</span>
        {!countdown.isPast && (
          <>
            {" "}
            · {formatExamDate(countdown.examDate)}
          </>
        )}
      </p>
    );
  }

  return (
    <section className={`rounded-2xl border p-4 ${style}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">Exam countdown</p>
      <p className="mt-1 text-lg font-bold">{countdown.label}</p>
      <p className="mt-1 text-sm opacity-90">{formatExamDate(countdown.examDate)}</p>
      {countdown.isPast ? (
        <Link href={editHref} className="mt-3 inline-block text-sm font-medium underline">
          Set a new exam date →
        </Link>
      ) : (
        <Link href={editHref} className="mt-3 inline-block text-xs opacity-80 hover:underline">
          Change date
        </Link>
      )}
    </section>
  );
}
