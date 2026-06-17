"use client";

import type { OetSkill, SkillMap } from "@/lib/domain/types";

const SKILL_LABELS: Record<OetSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

interface WeakSkillRadarProps {
  skillMap?: SkillMap;
}

export function WeakSkillRadar({ skillMap }: WeakSkillRadarProps) {
  if (!skillMap) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 text-sm text-ink-soft">
        Complete the diagnostic to see your skill map.
      </div>
    );
  }

  const skills: OetSkill[] = ["listening", "reading", "writing", "speaking"];

  return (
    <section
      aria-label="Skill map"
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="font-semibold text-ink">Your skill map</h2>
      <p className="mt-1 text-xs text-ink-soft">
        Estimated bands vs your {skillMap.targetRegulator} targets
      </p>
      <ul className="mt-4 space-y-3">
        {skills.map((skill) => {
          const data = skillMap.diagnostic[skill];
          const target = skillMap.targetGrades[skill];
          const gapWidth = Math.min(data.gap * 25, 100);
          return (
            <li key={skill}>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-sm">
                <span className="font-medium text-ink">{SKILL_LABELS[skill]}</span>
                <span className="text-ink-soft text-right">
                  {data.estBand} → {target}
                  {data.gap > 0 && (
                    <span className="ml-1 text-warning">(+{data.gap})</span>
                  )}
                </span>
              </div>
              <div
                className="mt-1 h-2 overflow-hidden rounded-full bg-surface-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-brand-primary transition-all"
                  style={{ width: `${100 - gapWidth}%` }}
                />
              </div>
              {data.weakTags.length > 0 && (
                <p className="mt-1 text-[11px] text-ink-soft">
                  Focus: {data.weakTags[0].replace(":", " — ").replace(/-/g, " ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
