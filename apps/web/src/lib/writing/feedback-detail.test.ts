import { describe, expect, it } from "vitest";

import { COUNTRY_WAVE2_SCENARIOS } from "@/content/writing/scenarios/country-wave2";
import { runQuickChecklist } from "@/lib/writing/checklist";
import { buildWritingFeedbackDetail } from "@/lib/writing/feedback-detail";

describe("buildWritingFeedbackDetail", () => {
  const scenario = COUNTRY_WAVE2_SCENARIOS.find((s) => s.id === "w-pharm-nz-wave2")!;

  it("flags missing case facts in a sparse letter", () => {
    const letter = "Dear Dr Williams,\n\nI am writing to refer Mr Patel.\n\nYours sincerely,\nPharmacist";
    const checklist = runQuickChecklist(letter, scenario);
    const detail = buildWritingFeedbackDetail(scenario, letter, checklist);

    expect(detail.missedFacts.length).toBeGreaterThan(0);
    expect(detail.improvements.length).toBeGreaterThan(0);
    expect(detail.summary).toContain(scenario.meta.title);
  });

  it("notes strengths when purpose and salutation present", () => {
    const letter =
      "Dear Dr Williams,\n\nI am writing to summarise counselling for Mr Raj Patel regarding apixaban 5mg twice daily.\n\nYours sincerely,\nPharmacist";
    const checklist = runQuickChecklist(letter, scenario);
    const detail = buildWritingFeedbackDetail(scenario, letter, checklist);

    expect(detail.strengths.some((s) => s.toLowerCase().includes("purpose"))).toBe(true);
  });
});
