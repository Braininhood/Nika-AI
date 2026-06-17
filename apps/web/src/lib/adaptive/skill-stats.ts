import { accuracyToBand } from "@/lib/quiz/engine";
import { gradeIndex } from "@/lib/domain/grades";
import type { OetGrade, OetSkill, SkillMap } from "@/lib/domain/types";
import type { AttemptRecord } from "@/lib/db/types";

import type { SkillAttemptStats } from "./types";

export type { SkillAttemptStats };

const SKILLS: OetSkill[] = ["listening", "reading", "writing", "speaking"];
const RECENT_WINDOW = 5;
const PRACTICE_MODES = new Set([
  "practice",
  "part_a",
  "part_b",
  "part_c",
  "exam",
  "adaptive_quiz",
  "clever_quiz",
  "nika_live",
  "guided",
  "learn",
]);

function bandFromAttempt(attempt: AttemptRecord): OetGrade | null {
  const raw = attempt.scoreRaw;
  if (attempt.skill === "writing") {
    const scores = raw.criterionScores as Record<string, number> | undefined;
    if (!scores || !Object.keys(scores).length) return null;
    const avg =
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    return accuracyToBand(avg);
  }
  if (typeof raw.accuracy === "number") return accuracyToBand(raw.accuracy);
  if (typeof raw.overallScore === "number") return accuracyToBand(raw.overallScore);
  if (typeof attempt.scoreRaw === "object" && "score" in raw) {
    const score = Number(raw.score);
    if (!Number.isNaN(score)) return accuracyToBand(score / 100);
  }
  return null;
}

function isPracticeAttempt(attempt: AttemptRecord): boolean {
  const mode = attempt.scoreRaw.mode as string | undefined;
  if (!mode) return true;
  return PRACTICE_MODES.has(mode);
}

export function computeSkillAttemptStats(attempts: AttemptRecord[]): SkillAttemptStats {
  const sessionsBySkill: Record<OetSkill, number> = {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
  };
  const recentBands: Record<OetSkill, OetGrade[]> = {
    listening: [],
    reading: [],
    writing: [],
    speaking: [],
  };
  const tagFailCounts: Record<string, number> = {};

  const sorted = [...attempts].sort((a, b) => b.createdAt - a.createdAt);

  for (const attempt of sorted) {
    const skill = attempt.skill as OetSkill;
    if (!SKILLS.includes(skill)) continue;
    if (!isPracticeAttempt(attempt)) continue;

    sessionsBySkill[skill] += 1;

    const band = bandFromAttempt(attempt);
    if (band && recentBands[skill].length < RECENT_WINDOW) {
      recentBands[skill].push(band);
    }

    const tags = (attempt.scoreRaw.wrongTags as string[] | undefined) ?? [];
    for (const tag of tags) {
      tagFailCounts[tag] = (tagFailCounts[tag] ?? 0) + 1;
    }
  }

  return {
    sessionsBySkill,
    recentBands,
    tagFailCounts,
    totalAttempts: sorted.length,
    lastAttemptAt: sorted[0]?.createdAt ?? null,
  };
}

export function skillStableAtTarget(
  skill: OetSkill,
  skillMap: SkillMap,
  stats: SkillAttemptStats,
  lastN = 3,
): boolean {
  const target = skillMap.targetGrades[skill];
  const recent = stats.recentBands[skill].slice(0, lastN);
  if (recent.length < lastN) return false;
  const targetIdx = gradeIndex(target);
  return recent.every((band) => gradeIndex(band) >= targetIdx);
}

export function skillTrendDown(
  skill: OetSkill,
  stats: SkillAttemptStats,
  lastN = 5,
): boolean {
  const recent = stats.recentBands[skill].slice(0, lastN);
  if (recent.length < 3) return false;
  const indices = recent.map(gradeIndex);
  const firstHalf = indices.slice(0, Math.floor(indices.length / 2));
  const secondHalf = indices.slice(Math.floor(indices.length / 2));
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return avg(secondHalf) < avg(firstHalf) - 0.5;
}

export function minSessionsPerWeakSkillMet(
  skillMap: SkillMap,
  stats: SkillAttemptStats,
  minSessions = 3,
): boolean {
  const weakSkills = SKILLS.filter((s) => skillMap.diagnostic[s].gap > 0);
  if (!weakSkills.length) return true;
  return weakSkills.every((s) => stats.sessionsBySkill[s] >= minSessions);
}
