import { describe, expect, it } from "vitest";

import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import {
  bundledAudioPathForAccentPart,
  bundledAudioPathForBlock,
  demoFrequencyForBlock,
} from "./bundled-audio";

describe("bundled-audio", () => {
  it("maps accent and part to pack path", () => {
    expect(bundledAudioPathForAccentPart("IE", "B")).toBe("audio/accent-ie-part-b.wav");
    expect(bundledAudioPathForAccentPart("mixed", "C")).toBe("audio/accent-mixed-part-c.wav");
  });

  it("assigns bundled audio path to every listening block", () => {
    for (const block of ALL_LISTENING_BLOCKS) {
      const path = bundledAudioPathForBlock(block);
      expect(path).toMatch(/^audio\/.+\.wav$/);
      expect(demoFrequencyForBlock(block)).toBeGreaterThan(300);
    }
  });

  it("preserves explicit bundled paths on universal blocks", () => {
    const universal = ALL_LISTENING_BLOCKS.find((b) => b.id === "l-part-a-001");
    expect(universal?.bundledAudioPath).toBe("audio/part-a-back-pain.wav");
    expect(bundledAudioPathForBlock(universal!)).toBe("audio/part-a-back-pain.wav");
  });
});
