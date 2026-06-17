import { gradeIndex } from "@/lib/domain/grades";
import type { OetSkill, SkillMap } from "@/lib/domain/types";

export type NikaStage = "hatchling" | "fledgling" | "rising" | "soaring" | "guardian";

export type NikaState =
  | "idle"
  | "greeting"
  | "thinking"
  | "celebrating"
  | "encouraging"
  | "proud"
  | "resting";

const SKILLS: OetSkill[] = ["listening", "reading", "writing", "speaking"];

export const NIKA_STAGE_ORDER: readonly NikaStage[] = [
  "hatchling",
  "fledgling",
  "rising",
  "soaring",
  "guardian",
] as const;

export function nikaStageRank(stage: NikaStage): number {
  return NIKA_STAGE_ORDER.indexOf(stage);
}

export function skillDisplayLabel(skill: OetSkill): string {
  const labels: Record<OetSkill, string> = {
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
  };
  return labels[skill];
}

/** Derive Nika's visual growth stage from the learner's skill map. */
export function deriveNikaStage(skillMap?: SkillMap): NikaStage {
  if (!skillMap) return "hatchling";

  const gaps = SKILLS.map((s) => skillMap.diagnostic[s].gap);
  const atTarget = gaps.filter((g) => g <= 0).length;
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

  if (atTarget >= 4) return "guardian";
  if (atTarget >= 2 && avgGap <= 1) return "soaring";
  if (atTarget >= 1 || avgGap <= 2) return "rising";
  if (skillMap.estimatedWeeksToTarget <= 8) return "fledgling";
  return "hatchling";
}

export function nikaStageLabel(stage: NikaStage): string {
  const labels: Record<NikaStage, string> = {
    hatchling: "Hatchling",
    fledgling: "Fledgling",
    rising: "Rising",
    soaring: "Soaring",
    guardian: "Guardian",
  };
  return labels[stage];
}

/** Skills at or above target grade — used for glow intensity. */
export function nikaProgressRatio(skillMap?: SkillMap): number {
  if (!skillMap) return 0.15;
  const hits = SKILLS.filter((s) => {
    const est = skillMap.diagnostic[s].estBand;
    const target = skillMap.targetGrades[s];
    return gradeIndex(est) >= gradeIndex(target);
  }).length;
  return Math.max(0.15, hits / SKILLS.length);
}

/** 0–1 progress through Nika growth stages (for progress UI). */
export function nikaStageProgress(skillMap?: SkillMap): number {
  const rank = nikaStageRank(deriveNikaStage(skillMap));
  return (rank + 1) / NIKA_STAGE_ORDER.length;
}
