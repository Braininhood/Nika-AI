import { describe, expect, it } from "vitest";

import { OET_READING_OVERVIEW, tipsForPart, timerWarningMessage } from "@/lib/reading/exam-guide";

describe("exam-guide", () => {
  it("matches OET official part structure", () => {
    expect(OET_READING_OVERVIEW.totalMinutes).toBe(60);
    expect(OET_READING_OVERVIEW.parts.A.minutes).toBe(15);
    expect(OET_READING_OVERVIEW.parts.A.locked).toBe(true);
  });

  it("returns Part A timer warnings at 5 and 2 minutes", () => {
    expect(timerWarningMessage("part_a", 300)).toContain("5 minutes");
    expect(timerWarningMessage("part_a", 120)).toContain("2 minutes");
  });

  it("returns study tips for weak inference tags", () => {
    const tips = tipsForPart("C", ["reading:part-c-inference"]);
    expect(tips.some((t) => t.title.toLowerCase().includes("attitude") || t.tags?.includes("reading:inference"))).toBe(true);
  });
});
