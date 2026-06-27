import { describe, expect, it } from "vitest";

import { isStudyRoute } from "./study-routes";

describe("isStudyRoute", () => {
  it("includes today-tip in the study shell", () => {
    expect(isStudyRoute("/today-tip")).toBe(true);
  });

  it("includes vocabulary and dashboard", () => {
    expect(isStudyRoute("/vocabulary")).toBe(true);
    expect(isStudyRoute("/dashboard")).toBe(true);
  });

  it("excludes marketing pages", () => {
    expect(isStudyRoute("/about")).toBe(false);
    expect(isStudyRoute("/")).toBe(false);
  });
});
