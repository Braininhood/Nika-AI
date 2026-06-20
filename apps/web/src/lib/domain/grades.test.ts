import { describe, expect, it } from "vitest";

import { estimateBandFromTier } from "@/lib/domain/grades";

describe("estimateBandFromTier", () => {
  it("does not award B at tier 2 even with high accuracy", () => {
    expect(estimateBandFromTier(2, 1)).toBe("C+");
    expect(estimateBandFromTier(2, 0.9)).toBe("C+");
  });

  it("awards B only after tier 3 with strong accuracy", () => {
    expect(estimateBandFromTier(3, 0.8)).toBe("B");
    expect(estimateBandFromTier(3, 0.6)).toBe("C+");
  });

  it("keeps tier 1 bands conservative", () => {
    expect(estimateBandFromTier(1, 0.7)).toBe("C");
    expect(estimateBandFromTier(1, 0.4)).toBe("D");
  });
});
