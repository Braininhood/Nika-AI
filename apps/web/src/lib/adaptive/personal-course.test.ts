import { describe, expect, it } from "vitest";

import { generatePersonalCourse } from "@/lib/adaptive/personal-course";
import type { SkillMap, UserProfile } from "@/lib/domain/types";

const TARGET_GRADES = {
  listening: "B" as const,
  reading: "B" as const,
  writing: "B" as const,
  speaking: "B" as const,
  single_sitting: false,
};

function skillMap(): SkillMap {
  return {
    userId: "u1",
    profession: "pharmacy",
    targetRegulator: "GPhC",
    targetGrades: TARGET_GRADES,
    diagnostic: {
      writing: { estBand: "C", gap: 2, weakTags: ["writing:purpose"] },
      listening: { estBand: "C+", gap: 1, weakTags: ["listening:part-c"] },
      reading: { estBand: "B", gap: 0, weakTags: [] },
      speaking: { estBand: "B", gap: 0, weakTags: [] },
    },
    priority: ["writing", "listening", "reading", "speaking"],
    estimatedWeeksToTarget: 8,
    computedAt: new Date().toISOString(),
  };
}

function profile(): UserProfile {
  return {
    id: "u1",
    profession: "pharmacy",
    targetCountry: "UK",
    targetRegulator: "GPhC",
    targetGrades: TARGET_GRADES,
    onboardingComplete: true,
    isGuest: false,
    skillMap: skillMap(),
  };
}

describe("generatePersonalCourse", () => {
  it("orders modules by gap — writing first", () => {
    const course = generatePersonalCourse(profile(), skillMap());
    expect(course.modules[0]?.skill).toBe("writing");
    expect(course.modules[0]?.status).toBe("active");
    expect(course.modules[1]?.status).toBe("locked");
  });

  it("includes practice items for active module", () => {
    const course = generatePersonalCourse(profile(), skillMap());
    const writing = course.modules.find((m) => m.skill === "writing");
    expect(writing?.items.length).toBeGreaterThan(0);
    expect(writing?.items.some((i) => i.route.startsWith("/writing"))).toBe(true);
  });

  it("compresses summary when exam is near", () => {
    const p = { ...profile(), examDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) };
    const course = generatePersonalCourse(p, skillMap());
    expect(course.examUrgencyWeeks).toBeLessThanOrEqual(3);
    expect(course.summary).toContain("week");
  });
});
