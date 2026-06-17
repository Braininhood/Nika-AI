import { describe, expect, it } from "vitest";

import { pickPlanListeningBlock, partFromWeakTag } from "@/content/listening";
import { tipsForPart } from "@/lib/listening/exam-guide";
import {
  applyListeningResult,
  recommendedListeningPart,
  recommendedListeningStage,
} from "@/lib/quiz/engine";
import type { SkillMap } from "@/lib/domain/types";

const baseSkillMap: SkillMap = {
  userId: "u1",
  profession: "pharmacy",
  targetRegulator: "GPhC",
  targetGrades: {
    listening: "B",
    reading: "B",
    writing: "B",
    speaking: "B",
    single_sitting: true,
  },
  diagnostic: {
    listening: { estBand: "C", gap: 1, weakTags: ["listening:part-a-detail"] },
    reading: { estBand: "B", gap: 0, weakTags: [] },
    writing: { estBand: "B", gap: 0, weakTags: [] },
    speaking: { estBand: "B", gap: 0, weakTags: [] },
  },
  priority: ["listening", "reading", "writing", "speaking"],
  estimatedWeeksToTarget: 8,
  computedAt: new Date().toISOString(),
};

describe("listening selection", () => {
  it("picks Part A block when gap is high", () => {
    const block = pickPlanListeningBlock(undefined, undefined, 2, "A");
    expect(block.part).toBe("A");
  });

  it("maps weak tags to parts", () => {
    expect(partFromWeakTag("listening:part-c-inference")).toBe("C");
    expect(recommendedListeningPart(baseSkillMap)).toBe("A");
  });

  it("recommends learn stage for large gap or low band", () => {
    expect(recommendedListeningStage(baseSkillMap)).toBe("learn");
    const practiceMap = {
      ...baseSkillMap,
      diagnostic: {
        ...baseSkillMap.diagnostic,
        listening: { estBand: "C+" as const, gap: 1, weakTags: ["listening:part-b-gist"] },
      },
    };
    expect(recommendedListeningStage(practiceMap)).toBe("practice");
    const learnMap = {
      ...baseSkillMap,
      diagnostic: {
        ...baseSkillMap.diagnostic,
        listening: { estBand: "D" as const, gap: 3, weakTags: ["listening:spelling"] },
      },
    };
    expect(recommendedListeningStage(learnMap)).toBe("learn");
  });
});

describe("applyListeningResult", () => {
  it("updates listening band and weak tags", () => {
    const updated = applyListeningResult(baseSkillMap, 0.9, [], ["listening:part-a-detail"]);
    expect(updated.diagnostic.listening.estBand).toBe("B");
    expect(updated.priority[0]).toBe("listening");
  });
});

describe("exam guide", () => {
  it("returns Part A tips", () => {
    const tips = tipsForPart("A", ["listening:spelling"]);
    expect(tips.length).toBeGreaterThan(0);
    expect(tips.some((t) => t.title.toLowerCase().includes("spell"))).toBe(true);
  });
});
