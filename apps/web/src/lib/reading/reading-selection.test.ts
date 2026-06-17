import { describe, expect, it } from "vitest";

import {
  blocksForUser,
  blocksForUserPart,
  pickPlanReadingBlock,
  professionsWithReadingBlocks,
  readingBlockCount,
  totalReadingQuestionCount,
} from "@/content/reading";
import { PROFESSIONS } from "@/lib/domain/professions";

describe("reading content registry", () => {
  it("has at least 50 questions and all 12 profession Part A blocks", () => {
    expect(totalReadingQuestionCount()).toBeGreaterThanOrEqual(50);
    expect(readingBlockCount()).toBeGreaterThanOrEqual(25);
    expect(professionsWithReadingBlocks().length).toBe(12);
    expect(PROFESSIONS.every((p) => professionsWithReadingBlocks().includes(p.code))).toBe(true);
  });
});

describe("blocksForUser country-first ordering", () => {
  it("prefers UK Part B for UK nursing users", () => {
    const blocks = blocksForUserPart("B", "nursing", "UK");
    expect(blocks[0]?.countryCode).toBe("UK");
    expect(blocks[0]?.id).toMatch(/^r-uk-b-/);
  });

  it("prefers AU Part B for AU pharmacy users", () => {
    const blocks = blocksForUserPart("B", "pharmacy", "AU");
    expect(blocks[0]?.countryCode).toBe("AU");
  });

  it("prefers US Part B for US medicine users", () => {
    const blocks = blocksForUserPart("B", "medicine", "US");
    expect(blocks[0]?.countryCode).toBe("US");
  });
});

describe("pickPlanReadingBlock", () => {
  it("returns profession-specific Part A for physiotherapy", () => {
    const block = pickPlanReadingBlock("physiotherapy", "UK", 1, "A");
    expect(block.profession).toBe("physiotherapy");
    expect(block.part).toBe("A");
    expect(block.id).toBe("r-phys-part-a");
  });

  it("returns locale Part B for IE dietetics", () => {
    const block = pickPlanReadingBlock("dietetics", "IE", 1, "B");
    expect(block.part).toBe("B");
    expect(block.countryCode).toBe("IE");
  });

  it("includes universal blocks as fallback in full list", () => {
    const blocks = blocksForUser("podiatry", "CA");
    expect(blocks.some((b) => b.countryCode === "CA")).toBe(true);
    expect(blocks.some((b) => b.countryCode === "ALL")).toBe(true);
  });
});
