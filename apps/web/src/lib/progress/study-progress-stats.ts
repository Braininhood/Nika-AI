import { db, getActiveUser } from "@/lib/db";
import type { AttemptRecord } from "@/lib/db/types";
import {
  computeStudyStreak,
  dateKeyFromTimestamp,
  formatStudyMinutes,
  pluralDays,
  startOfDay,
} from "@/lib/progress/study-streak";
import {
  getStudyMinutesLog,
  getTrackedMinutesToday,
  parseDateKey,
} from "@/lib/progress/study-time";

export interface ActivitySummary {
  id: string;
  skill: string;
  label: string;
  scenarioId?: string;
  createdAt: number;
  scorePercent: number | null;
  mode?: string;
}

export interface StudyProgressStats {
  studyStreakDays: number;
  minutesToday: number;
  minutesTodayLabel: string;
  minutesThisWeek: number;
  attemptsThisWeek: number;
  attemptsBySkillThisWeek: Record<string, number>;
  totalAttempts: number;
  writingAverageScore: number | null;
  recentActivity: ActivitySummary[];
  studyStreakLabel: string;
}

function avgWritingCriterionScore(attempt: AttemptRecord): number {
  const raw = attempt.scoreRaw?.criterionScores as Record<string, number> | undefined;
  if (!raw || typeof raw !== "object") return 0;
  const values = Object.values(raw);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function estimateAttemptMinutes(attempt: AttemptRecord): number {
  const raw = attempt.scoreRaw ?? {};

  if (attempt.skill === "writing") {
    const wordCount = Number(raw.wordCount ?? 0);
    if (wordCount > 0) return Math.min(45, Math.max(15, Math.round(wordCount / 4)));
    return 25;
  }

  if (attempt.skill === "speaking") {
    const seconds = Number(raw.durationSeconds ?? 0);
    return seconds > 0 ? Math.max(3, Math.round(seconds / 60)) : 8;
  }

  if (attempt.skill === "listening") {
    const part = String(attempt.part ?? raw.part ?? "");
    if (part === "A") return 12;
    if (part === "B" || part === "C") return 8;
    return 10;
  }

  if (attempt.skill === "reading") {
    const total = Number(raw.total ?? 0);
    if (total > 0) return Math.max(5, Math.round(total * 1.5));
    return 8;
  }

  return 5;
}

function scorePercentFromAttempt(attempt: AttemptRecord): number | null {
  const raw = attempt.scoreRaw ?? {};

  if (attempt.skill === "writing") {
    const avg = avgWritingCriterionScore(attempt);
    return avg > 0 ? Math.round(avg * 100) : null;
  }

  if (typeof raw.accuracy === "number") return Math.round(raw.accuracy * 100);
  if (typeof raw.overallScore === "number") return Math.round(raw.overallScore * 100);

  return null;
}

function activityLabel(attempt: AttemptRecord): string {
  const mode = String(attempt.scoreRaw?.mode ?? "");
  const skill = attempt.skill.charAt(0).toUpperCase() + attempt.skill.slice(1);

  if (mode === "clever_quiz" || mode === "adaptive_quiz") return `${skill} quiz`;
  if (mode === "exam") return `${skill} exam practice`;
  if (mode === "guided") return `${skill} guided`;
  if (attempt.scenarioId) return `${skill} · ${attempt.scenarioId.replace(/-/g, " ")}`;
  return skill;
}

function dailyStudyMinutes(
  dateKey: string,
  attempts: AttemptRecord[],
  trackedLog: Record<string, number>,
  lessonMinutes: number,
): number {
  const dayStart = startOfDay(parseDateKey(dateKey));
  const dayEnd = dayStart + 86_400_000;

  const attemptMinutes = attempts
    .filter((a) => a.createdAt >= dayStart && a.createdAt < dayEnd)
    .reduce((sum, a) => sum + estimateAttemptMinutes(a), 0);

  const tracked = trackedLog[dateKey] ?? 0;
  return Math.max(tracked, attemptMinutes + lessonMinutes);
}

export async function getStudyProgressStats(): Promise<StudyProgressStats> {
  const attempts = await db.attempts.orderBy("createdAt").reverse().toArray();
  const weekAgo = Date.now() - 7 * 86_400_000;
  const weekAttempts = attempts.filter((a) => a.createdAt >= weekAgo);

  const trackedLog = getStudyMinutesLog();
  const attemptTimestamps = attempts.map((a) => a.createdAt);
  const studyStreakDays = computeStudyStreak(attemptTimestamps, trackedLog);

  const user = await getActiveUser();
  let lessonMinutesToday = 0;
  if (user?.id) {
    const todayStart = startOfDay(Date.now());
    const lessons = await db.lessonProgress
      .where("userId")
      .equals(user.id)
      .filter((l) => l.completed && l.completedAt >= todayStart)
      .toArray();
    lessonMinutesToday = lessons.length * 8;
  }

  const todayKey = dateKeyFromTimestamp(Date.now());
  const attemptMinutesToday = attempts
    .filter((a) => dateKeyFromTimestamp(a.createdAt) === todayKey)
    .reduce((sum, a) => sum + estimateAttemptMinutes(a), 0);

  const minutesToday = Math.max(
    getTrackedMinutesToday(),
    attemptMinutesToday + lessonMinutesToday,
  );

  const weekDateKeys = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDateKeys.add(dateKeyFromTimestamp(d.getTime()));
  }

  let minutesThisWeek = 0;
  for (const dateKey of weekDateKeys) {
    minutesThisWeek += dailyStudyMinutes(dateKey, attempts, trackedLog, 0);
  }

  const attemptsBySkillThisWeek: Record<string, number> = {};
  for (const attempt of weekAttempts) {
    attemptsBySkillThisWeek[attempt.skill] = (attemptsBySkillThisWeek[attempt.skill] ?? 0) + 1;
  }

  const writingAttempts = attempts.filter((a) => a.skill === "writing");
  const writingScores = writingAttempts.map(avgWritingCriterionScore).filter((s) => s > 0);
  const writingAverageScore =
    writingScores.length > 0
      ? writingScores.reduce((a, b) => a + b, 0) / writingScores.length
      : null;

  const recentActivity: ActivitySummary[] = attempts.slice(0, 8).map((a) => ({
    id: a.id,
    skill: a.skill,
    label: activityLabel(a),
    createdAt: a.createdAt,
    scorePercent: scorePercentFromAttempt(a),
    mode: String(a.scoreRaw?.mode ?? undefined),
  }));

  return {
    studyStreakDays,
    studyStreakLabel: pluralDays(studyStreakDays),
    minutesToday,
    minutesTodayLabel: formatStudyMinutes(minutesToday),
    minutesThisWeek,
    attemptsThisWeek: weekAttempts.length,
    attemptsBySkillThisWeek,
    totalAttempts: attempts.length,
    writingAverageScore,
    recentActivity,
  };
}

// Backward-compatible aliases for writing-only consumers
export type WritingProgressStats = StudyProgressStats;
export type WritingAttemptSummary = ActivitySummary;

export async function getWritingProgressStats(): Promise<StudyProgressStats> {
  return getStudyProgressStats();
}
