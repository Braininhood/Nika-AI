"use client";

import {
  OET_WORD_MAX,
  OET_WORD_MIN,
  WORD_COUNT_STATUS_CLASS,
  countWords,
  wordCountStatus,
} from "@/lib/writing/word-count";

interface LetterEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  rows?: number;
  minWords?: number;
  maxWords?: number;
  savedHint?: string | null;
  disabled?: boolean;
  placeholder?: string;
}

function statusMessage(
  count: number,
  min: number,
  max: number,
): string {
  const status = wordCountStatus(count, min, max);
  switch (status) {
    case "empty":
      return `Aim for ${min}–${max} words (OET Grade B range)`;
    case "low":
      return `${min - count} more words to reach minimum`;
    case "high":
      return `${count - max} words over — trim if you can`;
    case "ok":
      return "Word count in target range";
  }
}

export function LetterEditor({
  value,
  onChange,
  label = "Your letter",
  id = "letter-editor",
  rows = 14,
  minWords = OET_WORD_MIN,
  maxWords = OET_WORD_MAX,
  savedHint,
  disabled = false,
  placeholder = "Dear Dr Chen,\n\nI am writing to refer…",
}: LetterEditorProps) {
  const count = countWords(value);
  const status = wordCountStatus(count, minWords, maxWords);
  const barMax = Math.max(maxWords + 30, count, 1);
  const fillPct = Math.min(100, (count / barMax) * 100);
  const minPct = (minWords / barMax) * 100;
  const maxPct = (maxWords / barMax) * 100;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4" aria-labelledby={`${id}-label`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id={`${id}-label`} className="text-base font-bold text-ink">
          {label}
        </h2>
        <div
          className="flex flex-col items-end gap-0.5"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold tabular-nums ${WORD_COUNT_STATUS_CLASS[status]}`}>
              {count}
            </span>
            <span className="text-sm font-medium text-ink-soft">words</span>
          </p>
          <p className={`text-xs ${WORD_COUNT_STATUS_CLASS[status]}`}>
            Target {minWords}–{maxWords}
            {savedHint ? <span className="text-ink-soft"> · {savedHint}</span> : null}
          </p>
        </div>
      </div>

      {count > 0 ? (
        <div className="mt-3">
          <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-surface-muted"
            role="progressbar"
            aria-valuenow={count}
            aria-valuemin={0}
            aria-valuemax={maxWords}
            aria-label={`${count} words typed. Target range ${minWords} to ${maxWords}.`}
          >
            <div
              className="absolute inset-y-0 rounded-full bg-brand-accent-soft/50"
              style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
              aria-hidden
            />
            <div
              className={`relative z-[1] h-full rounded-full transition-all ${
                status === "ok"
                  ? "bg-forest"
                  : status === "low"
                    ? "bg-warning"
                    : status === "high"
                      ? "bg-danger"
                      : "bg-border"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-ink-soft">
            <span>0</span>
            <span>{minWords}–{maxWords} target</span>
            <span>{barMax}+</span>
          </div>
        </div>
      ) : null}

      <p className={`mt-2 text-xs ${count > 0 ? WORD_COUNT_STATUS_CLASS[status] : "text-ink-soft"}`}>
        {statusMessage(count, minWords, maxWords)}
      </p>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
        spellCheck
        aria-describedby={`${id}-hint`}
        className="mt-3 w-full resize-y rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm leading-relaxed text-ink outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/40 disabled:opacity-50"
        placeholder={placeholder}
      />
      <p id={`${id}-hint`} className="mt-2 text-xs text-ink-soft">
        Use formal clinical language. Word count updates as you type.
      </p>
    </section>
  );
}
