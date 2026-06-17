import { describe, expect, it } from "vitest";

import {
  ADMIN_HOME_PATH,
  isAdminPath,
  isAdminUser,
  isLearnerStudyPath,
  LEARNER_HOME_PATH,
} from "@/lib/auth/roles";

describe("auth roles", () => {
  it("detects admin from app_metadata", () => {
    expect(
      isAdminUser({ app_metadata: { role: "admin" } } as never),
    ).toBe(true);
    expect(isAdminUser({ app_metadata: {} } as never)).toBe(false);
  });

  it("routes admin and learner homes", () => {
    expect(ADMIN_HOME_PATH).toBe("/admin");
    expect(LEARNER_HOME_PATH).toBe("/dashboard");
  });

  it("classifies paths", () => {
    expect(isAdminPath("/admin/scenarios")).toBe(true);
    expect(isLearnerStudyPath("/writing/practice/w-pharm-001")).toBe(true);
    expect(isLearnerStudyPath("/admin")).toBe(false);
  });
});
