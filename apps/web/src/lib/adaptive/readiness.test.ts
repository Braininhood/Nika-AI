import { describe, expect, it } from "vitest";

import type { SkillMap } from "@/lib/domain/types";
import {
  CONSECUTIVE_PASSES_REQUIRED,
  computeReadinessState,
  failedSkillsFromMock,
  mockMeetsTarget,
  nextReadinessAfterMock,
} from "@/lib/adaptive/readiness";
import { computeSkillAttemptStats } from "@/lib/adaptive/skill-stats";
import type { AttemptRecord } from "@/lib/db/types";

function baseSkillMap(): SkillMap {
  return {
    userId: "u1",
    profession: "nursing",
    targetRegulator: "NMC",
    targetGrades: {
      listening: "B",
      reading: "B",
      writing: "B",
      speaking: "B",
      single_sitting: true,
    },
    diagnostic: {
      writing: { estBand: "C+", gap: 1, weakTags: ["writing:purpose"] },
      listening: { estBand: "B", gap: 0, weakTags: [] },
      reading: { estBand: "B", gap: 0, weakTags: [] },
      speaking: { estBand: "B", gap: 0, weakTags: [] },
    },
    priority: ["writing", "listening", "reading", "speaking"],
    estimatedWeeksToTarget: 6,
    computedAt: new Date().toISOString(),
  };
}

describe("mockMeetsTarget", () => {
  it("passes when all skills meet regulator target", () => {
    const grades = {
      listening: "B" as const,
      reading: "B" as const,
      writing: "B" as const,
      speaking: "B" as const,
    };
    expect(mockMeetsTarget(grades, baseSkillMap().targetGrades)).toBe(true);
  });

  it("fails when writing below target", () => {
    const grades = {
      listening: "B" as const,
      reading: "B" as const,
      writing: "C+" as const,
      speaking: "B" as const,
    };
    expect(mockMeetsTarget(grades, baseSkillMap().targetGrades)).toBe(false);
    expect(failedSkillsFromMock(grades, baseSkillMap().targetGrades)).toContain("writing");
  });
});

describe("readiness state machine", () => {
  it("unlocks mock when gates met", () => {
    expect(computeReadinessState(0, true, null)).toBe("mock_eligible");
  });

  it("requires two passes for exam ready", () => {
    expect(computeReadinessState(1, true, true)).toBe("mock_pass_pending");
    expect(computeReadinessState(2, true, true)).toBe("exam_ready");
    expect(CONSECUTIVE_PASSES_REQUIRED).toBe(2);
  });

  it("resets passes on mock fail", () => {
    const after = nextReadinessAfterMock(false, 1, true);
    expect(after.consecutivePasses).toBe(0);
    expect(after.state).toBe("studying");
  });

  it("increments passes on mock pass", () => {
    const after = nextReadinessAfterMock(true, 0, true);
    expect(after.consecutivePasses).toBe(1);
    expect(after.state).toBe("mock_pass_pending");
  });
});

describe("computeSkillAttemptStats", () => {
  it("counts sessions per skill from practice attempts", () => {
    const attempts: AttemptRecord[] = [
      {
        id: "1",
        skill: "writing",
        scoreRaw: { mode: "practice", criterionScores: { purpose: 0.8 } },
        createdAt: Date.now(),
        synced: false,
      },
      {
        id: "2",
        skill: "reading",
        scoreRaw: { mode: "adaptive_quiz", accuracy: 0.7 },
        createdAt: Date.now() - 1000,
        synced: false,
      },
      {
        id: "3",
        skill: "writing",
        scoreRaw: { mode: "practice", criterionScores: { purpose: 0.6 } },
        createdAt: Date.now() - 2000,
        synced: false,
      },
    ];
    const stats = computeSkillAttemptStats(attempts);
    expect(stats.sessionsBySkill.writing).toBe(2);
    expect(stats.sessionsBySkill.reading).toBe(1);
    expect(stats.totalAttempts).toBe(3);
  });
});
