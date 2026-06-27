"use client";

import type { QuizQuestion } from "@/content/reading";

interface QuizQuestionFieldProps {
  question: QuizQuestion;
  index: number;
  value: string | string[] | undefined;
  disabled?: boolean;
  showFeedback?: boolean;
  onChange: (value: string | string[]) => void;
}

function correctAnswerDisplay(question: QuizQuestion): string {
  if (typeof question.correctAnswer === "string") return question.correctAnswer;
  return question.correctAnswer.join(", ");
}

export function QuizQuestionField({
  question,
  index,
  value,
  disabled = false,
  showFeedback = false,
  onChange,
}: QuizQuestionFieldProps) {
  const correctStr = correctAnswerDisplay(question);
  const isCorrect =
    value !== undefined &&
    String(Array.isArray(value) ? value.join(", ") : value).toLowerCase() ===
      correctStr.toLowerCase();
  const options = question.options ?? [];
  const isChoiceQuestion =
    question.type === "mcq" ||
    question.type === "matching" ||
    question.type === "gap_fill" ||
    question.type === "true_false" ||
    question.type === "ordering";

  return (
    <article
      className={`overflow-hidden rounded-2xl border shadow-sm ${
        showFeedback
          ? isCorrect
            ? "border-forest/40 bg-forest/5"
            : "border-danger/30 bg-danger/5"
          : "border-border bg-surface"
      }`}
    >
      <header className="border-b border-border/70 bg-surface-muted/25 px-4 py-3">
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-sm font-bold text-brand-primary"
            aria-hidden
          >
            {index + 1}
          </span>
          <h2
            id={`question-${question.id}-prompt`}
            className="min-w-0 flex-1 break-words text-base font-semibold leading-snug text-ink [overflow-wrap:anywhere]"
          >
            {question.prompt}
          </h2>
        </div>
      </header>

      <div className="p-4">
        {isChoiceQuestion ? (
          <ul
            className="space-y-2"
            role="radiogroup"
            aria-labelledby={`question-${question.id}-prompt`}
          >
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <li key={opt}>
                  <label
                    className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-base transition active:scale-[0.99] ${
                      selected
                        ? "border-brand-primary bg-brand-accent-soft/50 font-medium text-ink"
                        : "border-border bg-surface-muted/30 text-ink hover:bg-surface-muted/60"
                    } ${disabled ? "pointer-events-none opacity-60" : ""} ${
                      showFeedback && opt === correctStr ? "ring-1 ring-forest/50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={selected}
                      disabled={disabled}
                      onChange={() => onChange(opt)}
                      className="h-4 w-4 shrink-0 accent-brand-primary"
                    />
                    <span className="min-w-0 flex-1 break-words leading-snug [overflow-wrap:anywhere]">
                      {opt}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <input
            type="text"
            id={`question-${question.id}-input`}
            aria-labelledby={`question-${question.id}-prompt`}
            value={typeof value === "string" ? value : ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-base"
            placeholder="Type your answer"
          />
        )}

        {showFeedback && (
          <p className="mt-3 break-words rounded-lg bg-surface-muted/80 px-3 py-2 text-sm leading-relaxed text-ink-soft">
            {isCorrect ? "Correct. " : `Correct answer: ${correctStr}. `}
            {question.explanation}
          </p>
        )}
      </div>
    </article>
  );
}

interface QuizQuestionListProps {
  questions: QuizQuestion[];
  responses: Record<string, string | string[]>;
  disabled?: boolean;
  showFeedback?: boolean;
  onChange: (questionId: string, value: string | string[]) => void;
}

export function QuizQuestionList({
  questions,
  responses,
  disabled = false,
  showFeedback = false,
  onChange,
}: QuizQuestionListProps) {
  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, i) => (
        <QuizQuestionField
          key={q.id}
          question={q}
          index={i}
          value={responses[q.id]}
          disabled={disabled}
          showFeedback={showFeedback}
          onChange={(v) => onChange(q.id, v)}
        />
      ))}
    </div>
  );
}
