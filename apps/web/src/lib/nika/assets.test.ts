import { describe, expect, it } from "vitest";

import { NIKA_COMPANION_IMAGE } from "@/lib/nika/assets";

describe("nika assets", () => {
  it("uses one companion portrait everywhere", () => {
    expect(NIKA_COMPANION_IMAGE).toBe("/nika/avatar/nika-companion.png");
  });
});
