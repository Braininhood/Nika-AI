"use client";

import { useMemo, useState } from "react";

import { sequenceFromRanks } from "@/lib/quiz/question-utils";

interface OrderingSequenceFieldProps {
  options: string[];
  value: string[] | undefined;
  disabled?: boolean;
  onChange: (ordered: string[]) => void;
}

export function OrderingSequenceField({
  options,
  value,
  disabled = false,
  onChange,
}: OrderingSequenceFieldProps) {
  const [ranks, setRanks] = useState<Record<string, number | "">>(() => {
    if (value && value.length === options.length) {
      const next: Record<string, number | ""> = {};
      value.forEach((opt, i) => {
        next[opt] = i + 1;
      });
      return next;
    }
    return Object.fromEntries(options.map((o) => [o, ""]));
  });

  const ordered = useMemo(() => sequenceFromRanks(options, ranks), [options, ranks]);

  const updateRank = (opt: string, rank: number | "") => {
    setRanks((prev) => {
      const next = { ...prev, [opt]: rank };
      const seq = sequenceFromRanks(options, next);
      onChange(seq ?? []);
      return next;
    });
  };

  const rankOptions = options.map((_, i) => i + 1);

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        Assign each step a position — <strong className="text-ink">1 = first</strong>,{" "}
        {options.length} = last. Use each number once.
      </p>
      <ul className="space-y-2">
        {options.map((opt) => {
          const rank = ranks[opt] ?? "";
          const duplicate =
            rank !== "" && options.filter((o) => ranks[o] === rank).length > 1;
          return (
            <li
              key={opt}
              className={`rounded-xl border px-3 py-2.5 ${
                duplicate ? "border-danger/40 bg-danger/5" : "border-border bg-surface-muted/30"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0 flex-1 break-words text-sm leading-snug text-ink [overflow-wrap:anywhere]">
                  {opt}
                </span>
                <label className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
                  Position
                  <select
                    value={rank}
                    disabled={disabled}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateRank(opt, v === "" ? "" : Number(v));
                    }}
                    className="min-h-10 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-ink"
                    aria-label={`Position for ${opt}`}
                  >
                    <option value="">—</option>
                    {rankOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </li>
          );
        })}
      </ul>
      {ordered ? (
        <p className="text-xs text-brand-primary">
          Your order: {ordered.map((s, i) => `${i + 1}. ${s}`).join(" → ")}
        </p>
      ) : null}
    </div>
  );
}
