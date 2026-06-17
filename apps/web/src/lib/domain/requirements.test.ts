import { describe, expect, it } from "vitest";

import { getTargetGrades, getRegulatorsForProfession } from "@/lib/domain/requirements";

describe("requirements", () => {
  it("returns C+ writing for UK NMC nurses", () => {
    const grades = getTargetGrades("NMC");
    expect(grades.writing).toBe("C+");
    expect(grades.listening).toBe("B");
  });

  it("filters regulators by profession", () => {
    const nursing = getRegulatorsForProfession("nursing");
    expect(nursing.some((r) => r.code === "NMC")).toBe(true);
    expect(nursing.some((r) => r.code === "GMC")).toBe(false);
  });
});
