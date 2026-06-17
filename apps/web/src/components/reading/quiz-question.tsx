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

export function QuizQuestionField({
  question,
  index,
  value,
  disabled = false,
  showFeedback = false,
  onChange,
}: QuizQuestionFieldProps) {
  const correctStr =
    typeof question.correctAnswer === "string"
      ? question.correctAnswer
      : question.correctAnswer.join(", ");

  return (
    <fieldset
      className={`rounded-xl border p-4 ${
        showFeedback
          ? value !== undefined &&
            String(value).toLowerCase() === correctStr.toLowerCase()
            ? "border-forest/40 bg-forest/5"
            : "border-danger/30 bg-danger/5"
          : "border-border bg-surface"
      }`}
    >
      <legend className="text-sm font-medium text-ink">
        {index + 1}. {question.prompt}
      </legend>

      {question.type === "mcq" ||
      question.type === "matching" ||
      question.type === "gap_fill" ||
      question.type === "true_false" ||
      question.type === "ordering" ? (
        <ul className="mt-3 space-y-2">
          {(question.options ?? []).map((opt) => (
            <li key={opt}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === opt}
                  disabled={disabled}
                  onChange={() => onChange(opt)}
                  className="mt-1 accent-brand-primary"
                />
                <span
                  className={
                    showFeedback && opt === correctStr ? "font-medium text-forest" : undefined
                  }
                >
                  {opt}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Your answer"
        />
      )}

      {showFeedback && (
        <p className="mt-2 text-xs text-ink-soft">
          {value === correctStr || String(value).toLowerCase() === correctStr.toLowerCase()
            ? "Correct. "
            : `Correct answer: ${correctStr}. `}
          {question.explanation}
        </p>
      )}
    </fieldset>
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
    <div className="space-y-4">
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
