import { db } from "@/lib/db";
import type { AttemptRecord } from "@/lib/db/types";

export interface WritingAttemptSummary {
  id: string;
  scenarioId?: string;
  createdAt: number;
  wordCount: number;
  avgScore: number;
  mode?: string;
}

export interface WritingProgressStats {
  totalAttempts: number;
  attemptsThisWeek: number;
  studyStreakDays: number;
  minutesTodayEstimate: number;
  recentAttempts: WritingAttemptSummary[];
  averageCriterionScore: number | null;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function avgFromAttempt(attempt: AttemptRecord): number {
  const raw = attempt.scoreRaw?.criterionScores as Record<string, number> | undefined;
  if (!raw || typeof raw !== "object") return 0;
  const values = Object.values(raw);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computeStreak(attempts: AttemptRecord[]): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => startOfDay(a.createdAt)));
  let streak = 0;
  let cursor = startOfDay(Date.now());
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 86_400_000;
  }
  return streak;
}

export async function getWritingProgressStats(): Promise<WritingProgressStats> {
  const attempts = await db.attempts
    .where("skill")
    .equals("writing")
    .reverse()
    .sortBy("createdAt");

  const weekAgo = Date.now() - 7 * 86_400_000;
  const todayStart = startOfDay(Date.now());
  const todayAttempts = attempts.filter((a) => a.createdAt >= todayStart);

  const recentAttempts: WritingAttemptSummary[] = attempts.slice(0, 5).map((a) => ({
    id: a.id,
    scenarioId: a.scenarioId,
    createdAt: a.createdAt,
    wordCount: Number(a.scoreRaw?.wordCount ?? 0),
    avgScore: avgFromAttempt(a),
    mode: String(a.scoreRaw?.mode ?? "practice"),
  }));

  const scores = attempts.map(avgFromAttempt).filter((s) => s > 0);
  const averageCriterionScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

  return {
    totalAttempts: attempts.length,
    attemptsThisWeek: attempts.filter((a) => a.createdAt >= weekAgo).length,
    studyStreakDays: computeStreak(attempts),
    minutesTodayEstimate: todayAttempts.length * 25,
    recentAttempts,
    averageCriterionScore,
  };
}
