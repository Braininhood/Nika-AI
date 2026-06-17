import { db, getActiveUser } from "@/lib/db";
import type { LessonProgressRecord } from "@/lib/db/types";

export async function getLessonProgress(lessonId: string): Promise<LessonProgressRecord | undefined> {
  const user = await getActiveUser();
  if (!user) return undefined;
  return db.lessonProgress.get(lessonId);
}

export async function getAllLessonProgress(): Promise<LessonProgressRecord[]> {
  const user = await getActiveUser();
  if (!user) return [];
  return db.lessonProgress.where("userId").equals(user.id).toArray();
}

export async function saveLessonProgress(
  lessonId: string,
  score: number,
  completed: boolean,
): Promise<void> {
  const user = await getActiveUser();
  if (!user) return;
  await db.lessonProgress.put({
    lessonId,
    userId: user.id,
    score,
    completed,
    completedAt: Date.now(),
  });
}
