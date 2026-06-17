import { describe, expect, it } from "vitest";

import {
  APP_HOME_PATH,
  SITE_ROOT_PATH,
  logoHref,
  studyHomeHref,
} from "@/lib/navigation/home";

describe("navigation home paths", () => {
  it("logo always points at site root", () => {
    expect(logoHref()).toBe(SITE_ROOT_PATH);
  });

  it("study home is dashboard", () => {
    expect(studyHomeHref()).toBe(APP_HOME_PATH);
  });
});
