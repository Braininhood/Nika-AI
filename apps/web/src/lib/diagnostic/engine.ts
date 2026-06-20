import {
  computeGap,
  estimateBandFromTier,
  estimateWeeksToTarget,
  sortSkillsByGap,
} from "@/lib/domain/grades";
import type { OetGrade, OetSkill, SkillMap, TargetGrades } from "@/lib/domain/types";

import { itemsForSkill } from "./items";
import type { BlockAnswer, DiagnosticSessionState, SkillBlockState } from "./types";

const MIN_ITEMS = 4;
const MAX_ITEMS = 8;

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function createBlockState(): SkillBlockState {
  return { tier: 2, consecutiveCorrect: 0, consecutiveWrong: 0, answers: [] };
}

export function recordAnswer(
  block: SkillBlockState,
  answer: BlockAnswer,
): SkillBlockState {
  const next = {
    ...block,
    answers: [...block.answers, answer],
    consecutiveCorrect: answer.correct ? block.consecutiveCorrect + 1 : 0,
    consecutiveWrong: answer.correct ? 0 : block.consecutiveWrong + 1,
  };

  if (next.consecutiveCorrect >= 2 && next.tier < 3) {
    next.tier += 1;
    next.consecutiveCorrect = 0;
    next.consecutiveWrong = 0;
  } else if (next.consecutiveWrong >= 2 && next.tier > 1) {
    next.tier -= 1;
    next.consecutiveCorrect = 0;
    next.consecutiveWrong = 0;
  }

  return next;
}

export function getNextItem(skill: OetSkill, block: SkillBlockState, sessionId = "") {
  if (block.answers.length >= MAX_ITEMS) return null;
  if (block.answers.length >= MIN_ITEMS) {
    const recent = block.answers.slice(-3);
    const sameTier = recent.every((a) => a.tier === block.tier);
    if (sameTier && recent.length >= 3) return null;
  }

  const pool = itemsForSkill(skill).filter(
    (item) =>
      item.tier === block.tier &&
      !block.answers.some((a) => a.itemId === item.id),
  );

  const seed = hashString(`${sessionId}:${skill}:${block.tier}`);

  if (pool.length === 0) {
    const fallback = itemsForSkill(skill).filter(
      (item) => !block.answers.some((a) => a.itemId === item.id),
    );
    const shuffled = shuffleWithSeed(fallback, seed);
    return shuffled[block.answers.length % Math.max(shuffled.length, 1)] ?? null;
  }

  const shuffled = shuffleWithSeed(pool, seed);
  return shuffled[block.answers.length % shuffled.length] ?? null;
}

function weakTagsFromAnswers(answers: BlockAnswer[]): string[] {
  const incorrect = answers.filter((a) => !a.correct);
  const tags = [...new Set(incorrect.map((a) => a.tag))];
  if (tags.length === 0 && answers.length > 0) {
    return [answers[0]!.tag.split(":")[0] + ":foundation"];
  }
  return tags.length > 0 ? tags : [`${answers[0]?.skill ?? "writing"}:foundation`];
}

function blockResult(block: SkillBlockState, targetGrade: string) {
  const correct = block.answers.filter((a) => a.correct).length;
  const accuracy = block.answers.length ? correct / block.answers.length : 0.5;
  const peakTier = block.answers.length
    ? Math.max(block.tier, ...block.answers.map((a) => a.tier))
    : block.tier;
  const estBand = estimateBandFromTier(peakTier, accuracy);
  return {
    estBand,
    gap: computeGap(estBand, targetGrade),
    weakTags: weakTagsFromAnswers(block.answers),
  };
}

export function buildSkillMapFromSession(
  session: DiagnosticSessionState,
  profile: {
    userId: string;
    profession: SkillMap["profession"];
    targetRegulator: string;
    targetGrades: TargetGrades;
  },
): SkillMap {
  const skills: OetSkill[] = ["listening", "reading", "writing", "speaking"];
  const diagnostic = {} as SkillMap["diagnostic"];

  for (const skill of skills) {
    const block = session.blocks[skill] ?? createBlockState();
    const target = profile.targetGrades[skill];
    diagnostic[skill] = blockResult(block, target);
  }

  const priority = sortSkillsByGap(diagnostic);
  const totalGap = skills.reduce((sum, s) => sum + diagnostic[s].gap, 0);

  return {
    userId: profile.userId,
    profession: profile.profession,
    targetRegulator: profile.targetRegulator,
    targetGrades: profile.targetGrades,
    diagnostic,
    priority,
    estimatedWeeksToTarget: estimateWeeksToTarget(totalGap),
    computedAt: new Date().toISOString(),
  };
}
