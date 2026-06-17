import type { OetGrade, OetSkill } from "./types";

export const GRADE_ORDER: OetGrade[] = ["E", "D", "C", "C+", "B", "A"];

export function gradeIndex(grade: string): number {
  const idx = GRADE_ORDER.indexOf(grade as OetGrade);
  return idx === -1 ? 2 : idx;
}

export function computeGap(estBand: OetGrade, targetGrade: string): number {
  return Math.max(0, gradeIndex(targetGrade) - gradeIndex(estBand));
}

export function estimateBandFromTier(tier: number, accuracy: number): OetGrade {
  if (tier === 1) return accuracy >= 0.6 ? "C" : "D";
  if (tier === 2) {
    if (accuracy >= 0.8) return "B";
    if (accuracy >= 0.55) return "C+";
    return "C";
  }
  if (accuracy >= 0.75) return "B";
  if (accuracy >= 0.5) return "C+";
  return "C";
}

export function sortSkillsByGap(
  diagnostic: Record<OetSkill, { gap: number }>,
): OetSkill[] {
  const skills: OetSkill[] = ["listening", "reading", "writing", "speaking"];
  return [...skills].sort((a, b) => diagnostic[b].gap - diagnostic[a].gap);
}

export function estimateWeeksToTarget(totalGap: number): number {
  return Math.min(16, Math.max(4, totalGap * 2 + 3));
}
