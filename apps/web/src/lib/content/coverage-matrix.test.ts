import { describe, expect, it } from "vitest";

import { GRADED_SAMPLE_LETTERS } from "@/content/writing/sample-letters";
import { ALL_LISTENING_BLOCKS, listeningBlockCount } from "@/content/listening";
import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import {
  allProfessionsPresent,
  allScenariosHaveGradedPair,
  fullCountryMatrixComplete,
  speakingCardCount,
  speakingCoverageMatrix,
  writingCoverageMatrix,
  writingScenarioCount,
} from "./coverage-matrix";

describe("content coverage matrix", () => {
  it("all 12 professions have writing and speaking content", () => {
    expect(allProfessionsPresent()).toBe(true);
    expect(writingCoverageMatrix()).toHaveLength(12);
    expect(speakingCoverageMatrix()).toHaveLength(12);
  });

  it("wave 3 completes 6-country matrix for writing and speaking", () => {
    expect(fullCountryMatrixComplete(writingCoverageMatrix())).toBe(true);
    expect(fullCountryMatrixComplete(speakingCoverageMatrix())).toBe(true);
  });

  it("meets wave 4 volume targets", () => {
    expect(writingScenarioCount()).toBeGreaterThanOrEqual(72);
    expect(speakingCardCount()).toBeGreaterThanOrEqual(84);
    expect(ALL_READING_BLOCKS.filter((b) => b.part === "A" && b.profession !== "all").length).toBeGreaterThanOrEqual(24);
    expect(ALL_READING_BLOCKS.length).toBeGreaterThanOrEqual(47);
    expect(listeningBlockCount()).toBeGreaterThanOrEqual(42);
    expect(GRADED_SAMPLE_LETTERS.length).toBeGreaterThanOrEqual(100);
  });

  it("wave 5 baseline completes graded sample pairs for all writing scenarios", () => {
    expect(allScenariosHaveGradedPair()).toBe(true);
    expect(GRADED_SAMPLE_LETTERS.length).toBeGreaterThanOrEqual(146);
  });

  it("wave 4 accent-diversity content is present", () => {
    const accentListening = ALL_LISTENING_BLOCKS.filter((b) =>
      b.tags.includes("listening:accent-diversity"),
    );
    expect(accentListening.length).toBeGreaterThanOrEqual(12);
    const accentSpeaking = ROLE_PLAY_CARDS.filter((c) => c.patientAccent);
    expect(accentSpeaking.length).toBeGreaterThanOrEqual(12);
  });

  it("each profession has at least 6 writing scenarios and 6 speaking cards", () => {
    for (const row of writingCoverageMatrix()) {
      expect(row.count, row.profession).toBeGreaterThanOrEqual(6);
      expect(row.missingCountries, row.profession).toHaveLength(0);
    }
    for (const row of speakingCoverageMatrix()) {
      expect(row.count, row.profession).toBeGreaterThanOrEqual(6);
      expect(row.missingCountries, row.profession).toHaveLength(0);
    }
  });
});
