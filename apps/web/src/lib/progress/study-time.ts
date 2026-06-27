const STORAGE_KEY = "oet-study-minutes-v1";
const MAX_DAYS_RETAINED = 120;

export type StudyMinutesLog = Record<string, number>;

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function loadLog(): StudyMinutesLog {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StudyMinutesLog;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveLog(log: StudyMinutesLog): void {
  if (typeof window === "undefined") return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS_RETAINED);
  const cutoffKey = todayKey(cutoff);
  const trimmed: StudyMinutesLog = {};
  for (const [date, minutes] of Object.entries(log)) {
    if (date >= cutoffKey && minutes > 0) trimmed[date] = minutes;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function addStudyMinutes(minutes: number, date = new Date()): void {
  if (minutes <= 0 || typeof window === "undefined") return;
  const key = todayKey(date);
  const log = loadLog();
  log[key] = (log[key] ?? 0) + minutes;
  saveLog(log);
}

export function getTrackedMinutesForDate(dateKey: string): number {
  return loadLog()[dateKey] ?? 0;
}

export function getTrackedMinutesToday(): number {
  return getTrackedMinutesForDate(todayKey());
}

export function getStudyMinutesLog(): StudyMinutesLog {
  return loadLog();
}

export function parseDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
