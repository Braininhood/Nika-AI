import type { SkillMap } from "@/lib/domain/types";
import { computeGap, sortSkillsByGap } from "@/lib/domain/grades";

/** Writing criteria quiz results update writing weak tags. */
export function applyWritingResultFromQuiz(
  skillMap: SkillMap,
  accuracy: number,
  wrongTags: string[],
  correctTags: string[],
): SkillMap {
  const bands = [
    { min: 0.85, band: "B" as const },
    { min: 0.65, band: "C+" as const },
    { min: 0.45, band: "C" as const },
    { min: 0, band: "D" as const },
  ];
  const estBand = bands.find((r) => accuracy >= r.min)?.band ?? "D";
  const target = skillMap.targetGrades.writing;
  const gap = computeGap(estBand, target);

  const mergedWeak = [...new Set([...wrongTags, ...skillMap.diagnostic.writing.weakTags])].slice(
    0,
    5,
  );
  const filteredWeak = mergedWeak.filter((tag) => !correctTags.some((c) => c.includes(tag)));

  const diagnostic = {
    ...skillMap.diagnostic,
    writing: {
      estBand,
      gap,
      weakTags: filteredWeak.length ? filteredWeak : ["writing:purpose"],
    },
  };

  return {
    ...skillMap,
    diagnostic,
    priority: sortSkillsByGap(diagnostic),
    computedAt: new Date().toISOString(),
  };
}
