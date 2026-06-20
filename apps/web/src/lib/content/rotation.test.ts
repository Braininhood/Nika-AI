import { describe, expect, it } from "vitest";

import { dailyRotationSeed, pickRotatedItem } from "@/lib/content/rotation";

describe("pickRotatedItem", () => {
  const pool = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("rotates never-attempted items by day seed", () => {
    const seed = dailyRotationSeed("2026-06-20");
    const first = pickRotatedItem(pool, [], 0, seed);
    const again = pickRotatedItem(pool, [], 0, seed);
    expect(first.id).toBe(again.id);
    expect(pool.some((item) => item.id === first.id)).toBe(true);
  });
});
