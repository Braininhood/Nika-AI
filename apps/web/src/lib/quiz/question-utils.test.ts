import { describe, expect, it } from "vitest";

import type { QuizQuestion } from "@/content/reading/types";

import {
  allQuestionsAnswered,
  isSequenceOrdering,
  sequenceFromRanks,
  splitListeningPrompt,
} from "./question-utils";

const sequenceQuestion: QuizQuestion = {
  id: "wq-004",
  skill: "writing",
  profession: "all",
  type: "ordering",
  difficulty: 2,
  tags: [],
  prompt: "Order steps",
  options: ["A", "B", "C", "D"],
  correctAnswer: ["A", "B", "C", "D"],
  explanation: "",
};

describe("isSequenceOrdering", () => {
  it("detects full-sequence ordering", () => {
    expect(isSequenceOrdering(sequenceQuestion)).toBe(true);
  });

  it("rejects pick-one ordering", () => {
    const q: QuizQuestion = {
      ...sequenceQuestion,
      correctAnswer: "A",
    };
    expect(isSequenceOrdering(q)).toBe(false);
  });
});

describe("sequenceFromRanks", () => {
  it("builds ordered list from unique ranks", () => {
    expect(sequenceFromRanks(["A", "B", "C"], { A: 2, B: 1, C: 3 })).toEqual(["B", "A", "C"]);
  });

  it("returns null when ranks duplicate", () => {
    expect(sequenceFromRanks(["A", "B"], { A: 1, B: 1 })).toBeNull();
  });
});

describe("splitListeningPrompt", () => {
  it("splits script prefix", () => {
    const parts = splitListeningPrompt(
      "Script: 'Take two tablets.' How many tablets?",
      "listening",
    );
    expect(parts.context).toBe("Take two tablets.");
    expect(parts.question).toBe("How many tablets?");
  });
});

describe("allQuestionsAnswered", () => {
  it("requires full sequence for ordering arrays", () => {
    expect(
      allQuestionsAnswered([sequenceQuestion], {
        "wq-004": ["A", "B", "C", "D"],
      }),
    ).toBe(true);
    expect(allQuestionsAnswered([sequenceQuestion], { "wq-004": [] })).toBe(false);
  });
});
