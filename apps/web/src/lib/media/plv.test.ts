import { describe, expect, it } from "vitest";

import {
  computeExpiry,
  isPackExpired,
  scoreWithImportedKey,
} from "@/lib/media/plv";
import { chunkPassagesFromText, parseAnswerKeyFromText } from "@/lib/media/pdf-parse";

describe("PLV helpers", () => {
  it("parses OET-style answer keys", () => {
    const text = "Q1 lower back pain\n2. three weeks\nQuestion 3 ibuprofen";
    const key = parseAnswerKeyFromText(text);
    expect(key.q1).toBe("lower back pain");
    expect(key["2"]).toBe("three weeks");
    expect(key.q3).toBe("ibuprofen");
  });

  it("chunks passages by Part headers", () => {
    const text = "Part A notes here with enough text.\n\nPart B more content for testing chunking.";
    const chunks = chunkPassagesFromText(text);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });

  it("computes expiry and detects expired packs", () => {
    const created = Date.now() - 100 * 24 * 60 * 60 * 1000;
    const expires = computeExpiry(created, 90);
    expect(isPackExpired({ expiresAt: expires - 1 } as never)).toBe(true);
  });

  it("scores with imported answer key", () => {
    const results = scoreWithImportedKey(
      { "l-a-001-q1": "lower back pain" },
      { q1: "lower back pain" },
    );
    expect(results[0]?.correct).toBe(true);
  });
});
