import { describe, expect, it } from "vitest";

import { NIKA_APP_ICON, NIKA_COMPANION_IMAGE } from "@/lib/nika/assets";

describe("nika assets", () => {
  it("uses one companion portrait everywhere", () => {
    expect(NIKA_COMPANION_IMAGE).toBe("/nika/avatar/nika-companion.png");
    expect(NIKA_APP_ICON).toBe(NIKA_COMPANION_IMAGE);
  });
});
