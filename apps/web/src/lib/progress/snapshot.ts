import { db, getActiveUser } from "@/lib/db";
import type { AttemptRecord } from "@/lib/db/types";
import type { SkillMap } from "@/lib/domain/types";
import { deriveNikaStage, nikaStageRank } from "@/lib/nika/stage";
import type { ProgressSnapshot } from "@/lib/progress/types";

const SKILLS = ["listening", "reading", "writing", "speaking"] as const;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
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

function quizAccuracy(attempt: AttemptRecord): number {
  const raw = attempt.scoreRaw;
  if (typeof raw.accuracy === "number") return raw.accuracy;
  if (typeof raw.correct === "number" && typeof raw.total === "number" && raw.total > 0) {
    return raw.correct / raw.total;
  }
  return 0;
}

export async function buildProgressSnapshot(userId?: string): Promise<ProgressSnapshot> {
  const user = userId ? { id: userId } : await getActiveUser();
  const attempts = await db.attempts.toArray();
  const mocks = await db.mockAttempts.filter((m) => m.status === "completed").toArray();

  let skillMap: SkillMap | undefined;
  if (user?.id) {
    const record = await db.skillMaps.get(user.id);
    skillMap = record?.snapshot as SkillMap | undefined;
  }

  const readingQuizzes = attempts.filter(
    (a) =>
      a.skill === "reading" &&
      (a.scoreRaw.mode === "adaptive_quiz" || a.scoreRaw.mode === "clever_quiz"),
  );
  const cleverQuizzes = readingQuizzes.filter((a) => a.scoreRaw.mode === "clever_quiz");

  const quizAccuracies = readingQuizzes
    .filter((a) => Number(a.scoreRaw.total ?? 0) >= 5)
    .map(quizAccuracy);

  const skillsAtTarget = skillMap
    ? SKILLS.filter((s) => skillMap!.diagnostic[s].gap <= 0).length
    : 0;

  return {
    hasSkillMap: Boolean(skillMap),
    totalAttempts: attempts.length,
    skillsAttempted: new Set(attempts.map((a) => a.skill)),
    readingQuizCount: readingQuizzes.filter((a) => a.scoreRaw.mode === "adaptive_quiz").length,
    cleverQuizCount: cleverQuizzes.length,
    bestQuizAccuracy: quizAccuracies.length ? Math.max(...quizAccuracies) : 0,
    studyStreakDays: computeStreak(attempts),
    nikaStageRank: nikaStageRank(deriveNikaStage(skillMap)),
    skillsAtTarget,
    mockCompleted: mocks.length,
  };
}
