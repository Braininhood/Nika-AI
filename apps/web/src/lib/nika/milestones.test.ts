import { describe, expect, it } from "vitest";

import { detectNikaMilestones, nikaMilestoneMessage } from "@/lib/nika/milestones";
import type { OetProfession, SkillMap } from "@/lib/domain/types";

function mockSkillMap(overrides: Partial<Record<string, unknown>> = {}): SkillMap {
  const base: SkillMap = {
    userId: "u1",
    profession: "pharmacy" as OetProfession,
    targetRegulator: "gphc",
    targetGrades: {
      listening: "B",
      reading: "B",
      writing: "B",
      speaking: "B",
      single_sitting: true,
    },
    diagnostic: {
      listening: { estBand: "C+", gap: 1, weakTags: [] },
      reading: { estBand: "C+", gap: 1, weakTags: [] },
      writing: { estBand: "C", gap: 2, weakTags: [] },
      speaking: { estBand: "C+", gap: 1, weakTags: [] },
    },
    priority: ["writing", "listening", "reading", "speaking"],
    estimatedWeeksToTarget: 10,
    computedAt: new Date().toISOString(),
  };
  return { ...base, ...overrides } as SkillMap;
}

describe("detectNikaMilestones", () => {
  it("returns diagnostic milestone on first skill map", () => {
    const next = mockSkillMap({
      diagnostic: {
        listening: { estBand: "C", gap: 3, weakTags: [] },
        reading: { estBand: "C", gap: 3, weakTags: [] },
        writing: { estBand: "C", gap: 3, weakTags: [] },
        speaking: { estBand: "C", gap: 3, weakTags: [] },
      },
      estimatedWeeksToTarget: 12,
    });
    expect(detectNikaMilestones(undefined, next)).toEqual([
      { type: "diagnostic", stage: "hatchling" },
    ]);
  });

  it("detects stage advancement", () => {
    const baseDiagnostic = {
      listening: { estBand: "C", gap: 3, weakTags: [] },
      reading: { estBand: "C", gap: 3, weakTags: [] },
      writing: { estBand: "C", gap: 3, weakTags: [] },
      speaking: { estBand: "C", gap: 3, weakTags: [] },
    };
    const prev = mockSkillMap({
      diagnostic: baseDiagnostic,
      estimatedWeeksToTarget: 12,
    });
    const next = mockSkillMap({
      diagnostic: baseDiagnostic,
      estimatedWeeksToTarget: 6,
    });
    const milestones = detectNikaMilestones(prev, next);
    expect(milestones.some((m) => m.type === "stage" && m.stage === "fledgling")).toBe(true);
  });

  it("detects skill reaching target", () => {
    const prev = mockSkillMap();
    const next = mockSkillMap({
      diagnostic: {
        ...prev.diagnostic,
        writing: { estBand: "B", gap: 0, weakTags: [] },
      },
    });
    const milestones = detectNikaMilestones(prev, next);
    expect(milestones).toContainEqual({ type: "skill", skill: "writing", grade: "B" });
  });
});

describe("nikaMilestoneMessage", () => {
  it("formats skill milestone copy", () => {
    expect(
      nikaMilestoneMessage({ type: "skill", skill: "writing", grade: "B" }),
    ).toMatch(/Writing reached B-level/);
  });
});
