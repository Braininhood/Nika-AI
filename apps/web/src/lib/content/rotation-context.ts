import type { OetSkill } from "@/lib/domain/types";

import { recentAttemptScenarioIds } from "./attempt-history";

/** Recent content IDs per skill — feeds pickRotatedItem across plan, Nika, and quizzes. */
export interface RotationContext {
  writing: string[];
  reading: string[];
  listening: string[];
  speaking: string[];
  /** Quiz / assessment question IDs already seen */
  questions: string[];
}

export const EMPTY_ROTATION: RotationContext = {
  writing: [],
  reading: [],
  listening: [],
  speaking: [],
  questions: [],
};

export function rotationForSkill(
  ctx: RotationContext,
  skill: OetSkill,
  extraIds: string[] = [],
): string[] {
  const base =
    skill === "writing"
      ? ctx.writing
      : skill === "reading"
        ? ctx.reading
        : skill === "listening"
          ? ctx.listening
          : ctx.speaking;
  return [...base, ...extraIds];
}

/** Load attempt history from IndexedDB for adaptive rotation. */
export async function loadRotationContext(): Promise<RotationContext> {
  const [writing, reading, listening, speaking, questions] = await Promise.all([
    recentAttemptScenarioIds("writing", 30),
    recentAttemptScenarioIds("reading", 30),
    recentAttemptScenarioIds("listening", 30),
    recentAttemptScenarioIds("speaking", 30),
    recentQuestionIds(80),
  ]);
  return { writing, reading, listening, speaking, questions };
}

/** Collect question IDs from prior quiz / block attempts. */
export async function recentQuestionIds(limit = 80): Promise<string[]> {
  const { db } = await import("@/lib/db");
  const attempts = await db.attempts.orderBy("createdAt").reverse().limit(limit * 2).toArray();
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const attempt of attempts) {
    const raw = attempt.scoreRaw as { questionIds?: string[] } | undefined;
    if (!raw?.questionIds?.length) continue;
    for (const id of raw.questionIds) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    if (ids.length >= limit) break;
  }

  return ids;
}
