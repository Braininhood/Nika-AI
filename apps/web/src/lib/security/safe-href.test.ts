import { describe, expect, it } from "vitest";

import {
  isSafeInternalPath,
  resolveSafeHref,
  sanitizeExternalHref,
  trimUrl,
} from "./safe-href";

describe("safe-href", () => {
  it("allows https URLs", () => {
    expect(sanitizeExternalHref("https://oet.com")).toBe("https://oet.com/");
  });

  it("normalizes bare domains to https", () => {
    expect(sanitizeExternalHref("oet.com/ready")).toBe("https://oet.com/ready");
  });

  it("blocks javascript: URLs", () => {
    expect(sanitizeExternalHref("javascript:alert(1)")).toBeNull();
    expect(resolveSafeHref("javascript:alert(1)")).toBeNull();
  });

  it("blocks data: URLs", () => {
    expect(sanitizeExternalHref("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("allows safe internal paths", () => {
    expect(isSafeInternalPath("/dashboard")).toBe(true);
    expect(resolveSafeHref("/mock")).toEqual({ kind: "internal", href: "/mock" });
  });

  it("rejects protocol-relative and backslash paths", () => {
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath("/\\evil.com")).toBe(false);
  });

  it("trims trailing punctuation from URLs", () => {
    expect(trimUrl("https://oet.com).")).toBe("https://oet.com");
  });
});
