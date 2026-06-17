import { describe, expect, it } from "vitest";

import { selectAssessmentQuestions } from "@/lib/quiz/engine";

describe("selectAssessmentQuestions", () => {
  it("returns listening clever mix with multiple types", () => {
    const qs = selectAssessmentQuestions({
      weakTags: ["listening:part-b-gist"],
      mode: "clever_mix",
      limit: 5,
      assessmentSkill: "listening",
    });
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.skill === "listening")).toBe(true);
  });

  it("returns mixed skills across pool", () => {
    const qs = selectAssessmentQuestions({
      weakTags: [],
      mode: "clever_mix",
      limit: 5,
      assessmentSkill: "mixed",
    });
    const skills = new Set(qs.map((q) => q.skill));
    expect(skills.size).toBeGreaterThan(1);
  });

  it("returns vocab bank questions", () => {
    const qs = selectAssessmentQuestions({
      weakTags: ["vocab:clinical"],
      mode: "clever_mix",
      limit: 3,
      assessmentSkill: "vocab",
    });
    expect(qs.length).toBe(3);
    expect(qs.every((q) => q.skill === "vocab")).toBe(true);
  });
});
