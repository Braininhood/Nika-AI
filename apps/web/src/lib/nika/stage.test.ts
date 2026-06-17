import { describe, expect, it } from "vitest";

import { deriveNikaStage, nikaProgressRatio } from "@/lib/nika/stage";
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

describe("deriveNikaStage", () => {
  it("returns hatchling without skill map", () => {
    expect(deriveNikaStage()).toBe("hatchling");
  });

  it("returns guardian when all skills at target", () => {
    const map = mockSkillMap({
      diagnostic: {
        listening: { estBand: "B", gap: 0, weakTags: [] },
        reading: { estBand: "B", gap: 0, weakTags: [] },
        writing: { estBand: "B", gap: 0, weakTags: [] },
        speaking: { estBand: "B", gap: 0, weakTags: [] },
      },
    });
    expect(deriveNikaStage(map)).toBe("guardian");
  });

  it("returns rising with mixed progress", () => {
    const map = mockSkillMap({
      diagnostic: {
        listening: { estBand: "B", gap: 0, weakTags: [] },
        reading: { estBand: "C+", gap: 1, weakTags: [] },
        writing: { estBand: "C+", gap: 1, weakTags: [] },
        speaking: { estBand: "C+", gap: 1, weakTags: [] },
      },
    });
    expect(deriveNikaStage(map)).toBe("rising");
  });
});

describe("nikaProgressRatio", () => {
  it("returns minimum glow without skill map", () => {
    expect(nikaProgressRatio()).toBe(0.15);
  });

  it("increases as skills hit target", () => {
    const map = mockSkillMap({
      diagnostic: {
        listening: { estBand: "B", gap: 0, weakTags: [] },
        reading: { estBand: "B", gap: 0, weakTags: [] },
        writing: { estBand: "C", gap: 2, weakTags: [] },
        speaking: { estBand: "C", gap: 2, weakTags: [] },
      },
    });
    expect(nikaProgressRatio(map)).toBe(0.5);
  });
});
