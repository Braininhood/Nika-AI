import { describe, expect, it } from "vitest";

import { pickPlanScenario } from "@/content/writing/scenarios";
import type { SkillMap } from "@/lib/domain/types";
import { buildDailyPlan } from "@/lib/plan/build-daily-plan";

function testSkillMap(overrides: Partial<SkillMap> & Pick<SkillMap, "diagnostic">): SkillMap {
  return {
    userId: "u1",
    profession: "medicine",
    targetRegulator: "GMC",
    targetGrades: {
      writing: "B",
      listening: "B",
      reading: "B",
      speaking: "B",
      single_sitting: true,
    },
    priority: ["writing", "listening", "reading", "speaking"],
    estimatedWeeksToTarget: 8,
    computedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("pickPlanScenario", () => {
  it("prefers UK scenarios for UK nursing users", () => {
    const scenario = pickPlanScenario("nursing", "UK", 1);
    expect(scenario.profession).toBe("nursing");
    expect(scenario.meta.countryCode).toBe("UK");
  });

  it("prefers AU scenarios for AU nursing users", () => {
    const scenario = pickPlanScenario("nursing", "AU", 1);
    expect(scenario.meta.countryCode).toBe("AU");
  });

  it("caps difficulty when writing gap is large", () => {
    const scenario = pickPlanScenario("podiatry", "IE", 2);
    expect(scenario.difficulty).toBeLessThanOrEqual(1);
  });
});

describe("buildDailyPlan", () => {
  it("routes practice to profession-specific scenario", () => {
    const plan = buildDailyPlan({
      profession: "medicine",
      targetCountry: "US",
      skillMap: testSkillMap({
        diagnostic: {
          writing: { estBand: "C+", gap: 1, weakTags: ["writing:purpose"] },
          listening: { estBand: "B", gap: 0, weakTags: [] },
          reading: { estBand: "B", gap: 0, weakTags: [] },
          speaking: { estBand: "B", gap: 0, weakTags: [] },
        },
      }),
    });

    const practice = plan.items.find((item) => item.type === "practice");
    expect(practice?.route).toContain("/writing/practice/w-med-");
    expect(plan.primaryScenarioId).toMatch(/^w-med-/);
    expect(practice?.route).not.toContain("w-pharm-001");
  });

  it("includes guided step when gap is 1", () => {
    const plan = buildDailyPlan({
      profession: "pharmacy",
      targetCountry: "UK",
      skillMap: testSkillMap({
        profession: "pharmacy",
        targetRegulator: "GPhC",
        diagnostic: {
          writing: { estBand: "C+", gap: 1, weakTags: ["writing:content-selection"] },
          listening: { estBand: "B", gap: 0, weakTags: [] },
          reading: { estBand: "B", gap: 0, weakTags: [] },
          speaking: { estBand: "B", gap: 0, weakTags: [] },
        },
      }),
    });

    expect(plan.items.some((item) => item.type === "guided")).toBe(true);
    expect(plan.items.some((item) => item.route.includes("w-pharm-003"))).toBe(true);
  });

  it("includes nursing scenario for AU training user on practice stage", () => {
    const plan = buildDailyPlan({
      profession: "nursing",
      targetCountry: "AU",
      skillMap: testSkillMap({
        profession: "nursing",
        targetRegulator: "NMBA",
        diagnostic: {
          writing: { estBand: "C+", gap: 1, weakTags: ["writing:purpose"] },
          listening: { estBand: "B", gap: 0, weakTags: [] },
          reading: { estBand: "B", gap: 0, weakTags: [] },
          speaking: { estBand: "B", gap: 0, weakTags: [] },
        },
      }),
    });

    expect(plan.primaryScenarioId).toMatch(/^w-nurs-/);
    expect(plan.items.some((item) => item.route.includes("w-nurs-"))).toBe(true);
    expect(plan.items.some((item) => item.route.includes("w-pharm-"))).toBe(false);
  });
});
