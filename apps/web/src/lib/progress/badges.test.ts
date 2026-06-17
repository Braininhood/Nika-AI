import { describe, expect, it } from "vitest";

import { evaluateNewBadges } from "@/lib/progress/badges";
import type { ProgressSnapshot } from "@/lib/progress/types";

function emptySnapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    hasSkillMap: false,
    totalAttempts: 0,
    skillsAttempted: new Set(),
    readingQuizCount: 0,
    cleverQuizCount: 0,
    bestQuizAccuracy: 0,
    studyStreakDays: 0,
    nikaStageRank: 0,
    skillsAtTarget: 0,
    mockCompleted: 0,
    ...overrides,
  };
}

describe("evaluateNewBadges", () => {
  it("unlocks skill map badge when map exists", () => {
    const fresh = evaluateNewBadges(emptySnapshot({ hasSkillMap: true }), []);
    expect(fresh).toContain("skill_map_ready");
  });

  it("unlocks clever mind after clever quiz", () => {
    const fresh = evaluateNewBadges(emptySnapshot({ cleverQuizCount: 1 }), []);
    expect(fresh).toContain("clever_mind");
  });

  it("skips already unlocked badges", () => {
    const fresh = evaluateNewBadges(emptySnapshot({ cleverQuizCount: 1 }), ["clever_mind"]);
    expect(fresh).not.toContain("clever_mind");
  });

  it("unlocks streak badges at thresholds", () => {
    expect(evaluateNewBadges(emptySnapshot({ studyStreakDays: 3 }), [])).toContain("streak_3");
    expect(evaluateNewBadges(emptySnapshot({ studyStreakDays: 7 }), [])).toContain("streak_7");
  });
});
