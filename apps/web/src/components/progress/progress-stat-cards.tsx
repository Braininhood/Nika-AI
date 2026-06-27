"use client";

interface ProgressStatCardProps {
  label: string;
  value: string;
  hint: string;
  accent?: "default" | "brand" | "forest";
}

function accentClass(accent: ProgressStatCardProps["accent"]): string {
  if (accent === "brand") return "text-brand-primary";
  if (accent === "forest") return "text-forest";
  return "text-ink";
}

export function ProgressStatCard({ label, value, hint, accent = "default" }: ProgressStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accentClass(accent)}`}>{value}</p>
      <p className="mt-1.5 text-xs leading-snug text-ink-soft">{hint}</p>
    </div>
  );
}

interface SkillWeekBreakdownProps {
  counts: Record<string, number>;
}

const SKILL_ORDER = ["reading", "listening", "writing", "speaking"] as const;

const SKILL_LABELS: Record<(typeof SKILL_ORDER)[number], string> = {
  reading: "Reading",
  listening: "Listening",
  writing: "Writing",
  speaking: "Speaking",
};

export function SkillWeekBreakdown({ counts }: SkillWeekBreakdownProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-bold text-ink">This week by skill</h2>
      <p className="mt-1 text-sm text-ink-soft">Completed activities in the last 7 days</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {SKILL_ORDER.map((skill) => {
          const count = counts[skill] ?? 0;
          return (
            <li
              key={skill}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
            >
              <span className="text-ink-soft">{SKILL_LABELS[skill]}</span>
              <span className="font-semibold tabular-nums text-ink">{count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
