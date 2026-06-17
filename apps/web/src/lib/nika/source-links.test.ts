import { describe, expect, it } from "vitest";

import { resolveNikaSourceHref } from "@/lib/nika/source-links";

describe("resolveNikaSourceHref", () => {
  it("maps GPhC regulatory chunk to official site", () => {
    expect(
      resolveNikaSourceHref({
        id: "reg-gphc",
        title: "GPhC — UK pharmacist registration",
        source: "pharmacyregulation.org",
        category: "regulatory",
      }),
    ).toBe("https://www.pharmacyregulation.org/");
  });

  it("maps pharmacy profession chunk to OET ready", () => {
    expect(
      resolveNikaSourceHref({
        id: "prof-pharmacy-oet",
        title: "OET for pharmacists",
        source: "oet-coach-docs",
        category: "profession",
      }),
    ).toBe("https://oet.com/ready");
  });

  it("uses explicit url from API when present", () => {
    expect(
      resolveNikaSourceHref({
        id: "oet-sample-tests",
        title: "Official OET sample tests",
        url: "https://oet.com",
      }),
    ).toBe("https://oet.com/");
  });

  it("drops unsafe urls from API", () => {
    expect(
      resolveNikaSourceHref({
        id: "evil",
        title: "Evil",
        url: "javascript:alert(1)",
      }),
    ).toBeNull();
  });
});
