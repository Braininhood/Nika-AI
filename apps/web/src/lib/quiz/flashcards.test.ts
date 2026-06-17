import { describe, expect, it } from "vitest";

import { totalReadingQuestionCount } from "@/content/reading";
import type { Flashcard } from "@/lib/db/types";
import { scheduleSm2 } from "@/lib/quiz/flashcards";
import { professionsWithReadingBlocks } from "@/content/reading";

function baseCard(overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id: "fc-test",
    front: "Q",
    back: "A",
    nextReviewAt: 0,
    interval: 1,
    ease: 2.5,
    repetitions: 0,
    ...overrides,
  };
}

describe("scheduleSm2", () => {
  it("resets interval on Again (quality 0)", () => {
    const result = scheduleSm2(baseCard({ repetitions: 3, interval: 10 }), 0);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("sets 6-day interval on second Good review", () => {
    const first = scheduleSm2(baseCard(), 3);
    expect(first.repetitions).toBe(1);
    expect(first.interval).toBe(1);

    const second = scheduleSm2(first, 3);
    expect(second.repetitions).toBe(2);
    expect(second.interval).toBe(6);
  });

  it("increases ease on Easy (quality 5)", () => {
    const card = baseCard({ repetitions: 2, interval: 6, ease: 2.5 });
    const result = scheduleSm2(card, 5);
    expect(result.ease).toBeGreaterThan(2.5);
  });

  it("never drops ease below 1.3", () => {
    const card = baseCard({ ease: 1.35, repetitions: 2, interval: 6 });
    const result = scheduleSm2(card, 0);
    expect(result.ease).toBeGreaterThanOrEqual(1.3);
  });
});

describe("reading content volume", () => {
  it("has at least 50 tagged reading questions and 12 professions", () => {
    expect(totalReadingQuestionCount()).toBeGreaterThanOrEqual(50);
    expect(professionsWithReadingBlocks().length).toBe(12);
  });
});
