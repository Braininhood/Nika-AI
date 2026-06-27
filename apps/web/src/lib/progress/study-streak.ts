import { parseDateKey } from "@/lib/progress/study-time";

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dateKeyFromTimestamp(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

const MS_PER_DAY = 86_400_000;

/** Minimum tracked minutes to count a day without a submitted attempt. */
export const STUDY_DAY_MINUTES = 10;

export function collectStudyDayStarts(
  attemptTimestamps: number[],
  trackedMinutesByDate: Record<string, number>,
  minTrackedMinutes = STUDY_DAY_MINUTES,
): Set<number> {
  const days = new Set<number>();
  for (const ts of attemptTimestamps) {
    days.add(startOfDay(ts));
  }
  for (const [date, minutes] of Object.entries(trackedMinutesByDate)) {
    if (minutes >= minTrackedMinutes) {
      days.add(startOfDay(parseDateKey(date)));
    }
  }
  return days;
}

export function computeStudyStreak(
  attemptTimestamps: number[],
  trackedMinutesByDate: Record<string, number>,
  minTrackedMinutes = STUDY_DAY_MINUTES,
): number {
  const days = collectStudyDayStarts(attemptTimestamps, trackedMinutesByDate, minTrackedMinutes);
  if (days.size === 0) return 0;

  let streak = 0;
  let cursor = startOfDay(Date.now());
  while (days.has(cursor)) {
    streak += 1;
    cursor -= MS_PER_DAY;
  }
  return streak;
}

export function pluralDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}

export function formatStudyMinutes(minutes: number): string {
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}
