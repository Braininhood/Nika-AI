import { describe, expect, it } from "vitest";

import { getNextItem, createBlockState } from "@/lib/diagnostic/engine";
import { selectQuizQuestions } from "@/lib/quiz/engine";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

describe("personalized question selection", () => {
  it("returns different sets for different user seeds", () => {
    const a = selectQuizQuestions({
      weakTags: ["reading:part-b-gist"],
      mode: "adaptive",
      limit: 5,
      selectionSeed: createSelectionSeed("user-a", "session-1"),
    });
    const b = selectQuizQuestions({
      weakTags: ["reading:part-b-gist"],
      mode: "adaptive",
      limit: 5,
      selectionSeed: createSelectionSeed("user-b", "session-1"),
    });
    const sameUserNewSession = selectQuizQuestions({
      weakTags: ["reading:part-b-gist"],
      mode: "adaptive",
      limit: 5,
      selectionSeed: createSelectionSeed("user-a", "session-2"),
    });

    expect(a.length).toBe(5);
    expect(b.length).toBe(5);
    const aIds = a.map((q) => q.id).join(",");
    const bIds = b.map((q) => q.id).join(",");
    expect(aIds).not.toBe(bIds);
    expect(a.map((q) => q.id).join(",")).not.toBe(sameUserNewSession.map((q) => q.id).join(","));
  });

  it("prefers unseen questions when excludeIds is set", () => {
    const first = selectQuizQuestions({
      weakTags: ["reading:part-c-inference"],
      mode: "adaptive",
      limit: 5,
      selectionSeed: createSelectionSeed("user-x", "s1"),
    });
    const second = selectQuizQuestions({
      weakTags: ["reading:part-c-inference"],
      mode: "adaptive",
      limit: 5,
      excludeIds: first.map((q) => q.id),
      selectionSeed: createSelectionSeed("user-x", "s2"),
    });

    expect(second.some((q) => first.some((f) => f.id === q.id))).toBe(false);
  });
});

describe("getNextItem", () => {
  it("varies by session id", () => {
    const block = createBlockState();
    const a = getNextItem("listening", block, "session-aaa");
    const b = getNextItem("listening", block, "session-bbb");
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a?.id).not.toBe(b?.id);
  });

  it("avoids repeating answered items", () => {
    let block = createBlockState();
    const sessionId = "unique-session-123";
    const first = getNextItem("reading", block, sessionId);
    expect(first).not.toBeNull();

    block = {
      ...block,
      answers: [
        {
          itemId: first!.id,
          skill: "reading",
          tier: first!.tier,
          tag: first!.tag,
          correct: true,
          selectedIndex: first!.correctIndex,
        },
      ],
    };

    const second = getNextItem("reading", block, sessionId);
    expect(second?.id).not.toBe(first?.id);
  });
});
