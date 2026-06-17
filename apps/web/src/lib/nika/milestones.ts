import type { OetGrade, OetSkill, SkillMap } from "@/lib/domain/types";

import {
  deriveNikaStage,
  nikaStageLabel,
  nikaStageRank,
  skillDisplayLabel,
  type NikaStage,
} from "@/lib/nika/stage";

export type NikaMilestone =
  | { type: "diagnostic"; stage: NikaStage }
  | { type: "stage"; stage: NikaStage }
  | { type: "skill"; skill: OetSkill; grade: OetGrade };

const SKILLS: OetSkill[] = ["listening", "reading", "writing", "speaking"];

export function nikaMilestoneMessage(milestone: NikaMilestone): string {
  switch (milestone.type) {
    case "diagnostic":
      return `Your Skill Map is ready — I'm at ${nikaStageLabel(milestone.stage)} stage. Let's grow together!`;
    case "stage":
      return `I've reached ${nikaStageLabel(milestone.stage)} stage — your progress is showing!`;
    case "skill":
      return `Your ${skillDisplayLabel(milestone.skill)} reached ${milestone.grade}-level — I've grown with you!`;
  }
}

/** Compare skill maps and return milestones worth celebrating (no persistence). */
export function detectNikaMilestones(
  prev: SkillMap | undefined,
  next: SkillMap,
): NikaMilestone[] {
  if (!prev) {
    return [{ type: "diagnostic", stage: deriveNikaStage(next) }];
  }

  const milestones: NikaMilestone[] = [];
  const oldStage = deriveNikaStage(prev);
  const newStage = deriveNikaStage(next);

  if (nikaStageRank(newStage) > nikaStageRank(oldStage)) {
    milestones.push({ type: "stage", stage: newStage });
  }

  for (const skill of SKILLS) {
    const wasAtTarget = prev.diagnostic[skill].gap <= 0;
    const nowAtTarget = next.diagnostic[skill].gap <= 0;
    if (!wasAtTarget && nowAtTarget) {
      milestones.push({ type: "skill", skill, grade: next.targetGrades[skill] });
    }
  }

  return milestones;
}
