import { badgeById, evaluateNewBadges } from "@/lib/progress/badges";
import { buildProgressSnapshot } from "@/lib/progress/snapshot";
import type { ProgressBadgeId } from "@/lib/progress/types";

type Listener = (badgeIds: ProgressBadgeId[]) => void;

const listeners = new Set<Listener>();

function storageKey(userId: string): string {
  return `oet-progress-badges-${userId}`;
}

export function loadUnlockedBadges(userId: string): ProgressBadgeId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProgressBadgeId[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUnlockedBadges(userId: string, ids: ProgressBadgeId[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(ids));
}

export function subscribeBadgeUnlocks(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(ids: ProgressBadgeId[]): void {
  if (!ids.length) return;
  for (const listener of listeners) {
    listener(ids);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("oet-badges-updated"));
  }
}

export function badgeUnlockMessage(badgeId: ProgressBadgeId): string {
  const badge = badgeById(badgeId);
  return `Badge unlocked: ${badge.title} — ${badge.description}`;
}

/** Re-evaluate badges after study activity; returns newly unlocked ids. */
export async function refreshProgressBadges(userId: string): Promise<ProgressBadgeId[]> {
  const snapshot = await buildProgressSnapshot(userId);
  const current = loadUnlockedBadges(userId);
  const fresh = evaluateNewBadges(snapshot, current);
  if (fresh.length) {
    saveUnlockedBadges(userId, [...current, ...fresh]);
    notify(fresh);
  }
  return fresh;
}

export async function afterStudyActivity(): Promise<void> {
  const { getActiveUser } = await import("@/lib/db");
  const user = await getActiveUser();
  if (!user?.id) return;
  await refreshProgressBadges(user.id);
}
