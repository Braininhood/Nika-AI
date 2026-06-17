import { describe, expect, it } from "vitest";

import {
  OET_COMPUTER_PROFESSIONS,
  OET_OFFICIAL_SAMPLE_LINKS,
  OET_PAPER_PROFESSIONS,
  OET_PROFESSION_SLUGS,
} from "@/content/media/oet-official-samples";
import { PROFESSIONS } from "@/lib/domain/professions";

describe("OET official sample links", () => {
  it("covers all 12 professions for paper", () => {
    expect(OET_PAPER_PROFESSIONS).toHaveLength(12);
    expect(OET_OFFICIAL_SAMPLE_LINKS).toHaveLength(12);
  });

  it("covers all 12 professions for computer", () => {
    expect(OET_COMPUTER_PROFESSIONS).toHaveLength(12);
    for (const link of OET_OFFICIAL_SAMPLE_LINKS) {
      expect(link.computerUrl).toMatch(/oet-test-on-computer/);
    }
  });

  it("uses valid oet.com URL slugs", () => {
    for (const p of PROFESSIONS) {
      const slug = OET_PROFESSION_SLUGS[p.code];
      const link = OET_OFFICIAL_SAMPLE_LINKS.find((l) => l.profession === p.code);
      expect(link?.paperUrl).toBe(
        `https://oet.com/ready/sample-tests/oet-test-on-paper/${slug}`,
      );
    }
  });
});
