import { describe, expect, it } from "vitest";

import { scoreMockFromResults } from "@/lib/mock/submit-mock";
import type { TargetGrades } from "@/lib/domain/types";

const targets: TargetGrades = {
  listening: "B",
  reading: "B",
  writing: "B",
  speaking: "B",
  single_sitting: true,
};

describe("scoreMockFromResults", () => {
  it("passes full mock at target", () => {
    const result = scoreMockFromResults(
      {
        listening: { skill: "listening", estBand: "B", passed: true },
        reading: { skill: "reading", estBand: "B", passed: true },
        writing: { skill: "writing", estBand: "B", passed: true },
        speaking: { skill: "speaking", estBand: "B", passed: true },
      },
      targets,
    );
    expect(result.passed).toBe(true);
    expect(result.failedSkills).toHaveLength(0);
  });

  it("fails and lists weak skills", () => {
    const result = scoreMockFromResults(
      {
        listening: { skill: "listening", estBand: "C+", passed: false },
        reading: { skill: "reading", estBand: "B", passed: true },
        writing: { skill: "writing", estBand: "B", passed: true },
        speaking: { skill: "speaking", estBand: "B", passed: true },
      },
      targets,
    );
    expect(result.passed).toBe(false);
    expect(result.failedSkills).toContain("listening");
  });
});
