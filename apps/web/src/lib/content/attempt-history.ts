import { db } from "@/lib/db";
import type { OetSkill } from "@/lib/domain/types";

/** Recent scenario / block / role-card IDs for content rotation (newest last). */
export async function recentAttemptScenarioIds(
  skill: OetSkill,
  limit = 30,
): Promise<string[]> {
  const attempts = await db.attempts
    .where("skill")
    .equals(skill)
    .reverse()
    .limit(limit)
    .toArray();
  return attempts
    .map((a) => a.scenarioId)
    .filter((id): id is string => Boolean(id));
}
