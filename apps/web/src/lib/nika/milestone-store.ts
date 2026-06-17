import type { OetSkill, SkillMap } from "@/lib/domain/types";

import { detectNikaMilestones, type NikaMilestone } from "@/lib/nika/milestones";
import { deriveNikaStage, nikaStageRank } from "@/lib/nika/stage";

type StoredProgress = {
  celebratedDiagnostic: boolean;
  celebratedSkills: OetSkill[];
  lastCelebratedStageRank: number;
};

type Listener = (milestones: NikaMilestone[]) => void;

const listeners = new Set<Listener>();

function storageKey(userId: string): string {
  return `oet-nika-milestones-${userId}`;
}

function loadProgress(userId: string): StoredProgress {
  if (typeof window === "undefined") {
    return { celebratedDiagnostic: false, celebratedSkills: [], lastCelebratedStageRank: -1 };
  }
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      return { celebratedDiagnostic: false, celebratedSkills: [], lastCelebratedStageRank: -1 };
    }
    const parsed = JSON.parse(raw) as StoredProgress;
    return {
      celebratedDiagnostic: Boolean(parsed.celebratedDiagnostic),
      celebratedSkills: Array.isArray(parsed.celebratedSkills) ? parsed.celebratedSkills : [],
      lastCelebratedStageRank:
        typeof parsed.lastCelebratedStageRank === "number" ? parsed.lastCelebratedStageRank : -1,
    };
  } catch {
    return { celebratedDiagnostic: false, celebratedSkills: [], lastCelebratedStageRank: -1 };
  }
}

function saveProgress(userId: string, progress: StoredProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(progress));
}

function filterNewMilestones(
  progress: StoredProgress,
  detected: NikaMilestone[],
): { toShow: NikaMilestone[]; next: StoredProgress } {
  const next: StoredProgress = {
    celebratedDiagnostic: progress.celebratedDiagnostic,
    celebratedSkills: [...progress.celebratedSkills],
    lastCelebratedStageRank: progress.lastCelebratedStageRank,
  };
  const toShow: NikaMilestone[] = [];

  for (const milestone of detected) {
    if (milestone.type === "diagnostic") {
      if (next.celebratedDiagnostic) continue;
      next.celebratedDiagnostic = true;
      next.lastCelebratedStageRank = Math.max(
        next.lastCelebratedStageRank,
        nikaStageRank(milestone.stage),
      );
      toShow.push(milestone);
      continue;
    }
    if (milestone.type === "stage") {
      const rank = nikaStageRank(milestone.stage);
      if (rank <= next.lastCelebratedStageRank) continue;
      next.lastCelebratedStageRank = rank;
      toShow.push(milestone);
      continue;
    }
    if (milestone.type === "skill") {
      if (next.celebratedSkills.includes(milestone.skill)) continue;
      next.celebratedSkills.push(milestone.skill);
      toShow.push(milestone);
      continue;
    }
  }

  return { toShow, next };
}

/** Drop skill celebrations when the learner falls below target again (e.g. after a mock). */
export function syncCelebratedSkills(userId: string, skillMap: SkillMap): void {
  const progress = loadProgress(userId);
  progress.celebratedSkills = progress.celebratedSkills.filter(
    (skill) => skillMap.diagnostic[skill].gap <= 0,
  );
  progress.lastCelebratedStageRank = Math.min(
    progress.lastCelebratedStageRank,
    nikaStageRank(deriveNikaStage(skillMap)),
  );
  saveProgress(userId, progress);
}

export function subscribeNikaMilestones(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(milestones: NikaMilestone[]): void {
  if (!milestones.length) return;
  for (const listener of listeners) {
    listener(milestones);
  }
}

/** Call after skill map is saved — emits deduplicated milestones to UI subscribers. */
export function emitNikaMilestonesFromSkillMapUpdate(
  userId: string,
  prev: SkillMap | undefined,
  next: SkillMap,
): void {
  syncCelebratedSkills(userId, next);
  const detected = detectNikaMilestones(prev, next);
  const progress = loadProgress(userId);
  const { toShow, next: updated } = filterNewMilestones(progress, detected);
  saveProgress(userId, updated);
  notify(toShow);
}
