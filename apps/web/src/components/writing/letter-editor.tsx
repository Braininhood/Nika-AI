"use client";

import {
  OET_WORD_MAX,
  OET_WORD_MIN,
  WORD_COUNT_STATUS_CLASS,
  countWords,
  wordCountLabel,
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

  return (
    <section className="rounded-2xl border border-border bg-surface p-4" aria-labelledby={`${id}-label`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-label`} className="text-sm font-semibold text-ink">
          {label}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={WORD_COUNT_STATUS_CLASS[status]}
            aria-live="polite"
            aria-atomic="true"
          >
            {wordCountLabel(count, minWords, maxWords)}
          </span>
          {savedHint && <span className="text-ink-soft">{savedHint}</span>}
        </div>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={Math.min(count, maxWords)}
        aria-valuemin={0}
        aria-valuemax={maxWords}
        aria-label="Word count progress toward OET target range"
      >
        <div
          className={`h-full transition-all ${
            status === "ok"
              ? "bg-forest"
              : status === "low"
                ? "bg-warning"
                : status === "high"
                  ? "bg-danger"
                  : "bg-border"
          }`}
          style={{ width: `${Math.min(100, (count / maxWords) * 100)}%` }}
        />
      </div>

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
        OET letters typically use {minWords}–{maxWords} words. Use formal clinical language.
      </p>
    </section>
  );
}
