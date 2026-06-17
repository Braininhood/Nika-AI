import { describe, expect, it } from "vitest";

import { fullQuizPool } from "@/content/reading";
import type { SkillMap } from "@/lib/domain/types";
import {
  applyReadingResult,
  isAnswerCorrect,
  passageBlocksForQuiz,
  quizBriefingPart,
  quizRationale,
  scoreQuiz,
  selectQuizQuestions,
} from "@/lib/quiz/engine";
import { buildDailyPlan } from "@/lib/plan/build-daily-plan";

function testSkillMap(overrides: Partial<SkillMap> & Pick<SkillMap, "diagnostic">): SkillMap {
  return {
    userId: "u1",
    profession: "nursing",
    targetRegulator: "NMC",
    targetGrades: {
      writing: "B",
      listening: "B",
      reading: "B",
      speaking: "B",
      single_sitting: true,
    },
    priority: ["reading", "writing", "listening", "speaking"],
    estimatedWeeksToTarget: 8,
    computedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("selectQuizQuestions", () => {
  it("prefers questions matching weak tags", () => {
    const questions = selectQuizQuestions({
      weakTags: ["reading:part-c-inference"],
      mode: "adaptive",
      limit: 3,
    });
    expect(questions.length).toBe(3);
    expect(questions.some((q) => q.tags.some((t) => t.includes("inference")))).toBe(true);
  });

  it("filters by part in part_focus mode", () => {
    const questions = selectQuizQuestions({
      weakTags: ["reading:part-a"],
      mode: "part_focus",
      part: "A",
      limit: 10,
    });
    expect(questions.every((q) => q.part === "A")).toBe(true);
  });
});

describe("scoreQuiz", () => {
  it("marks MCQ answers and collects wrong tags", () => {
    const [q1, q2] = fullQuizPool().slice(0, 2);
    const correct =
      typeof q1!.correctAnswer === "string" ? q1!.correctAnswer : q1!.correctAnswer[0]!;
    const score = scoreQuiz([q1!, q2!], {
      [q1!.id]: correct,
      [q2!.id]: "definitely wrong",
    });
    expect(score.correct).toBe(1);
    expect(score.wrongTags.length).toBeGreaterThan(0);
  });
});

describe("isAnswerCorrect", () => {
  it("compares case-insensitively", () => {
    expect(isAnswerCorrect("Text A", "text a")).toBe(true);
  });
});

describe("applyReadingResult", () => {
  it("updates reading band and reprioritises skills", () => {
    const map = testSkillMap({
      diagnostic: {
        writing: { estBand: "B", gap: 0, weakTags: [] },
        listening: { estBand: "B", gap: 0, weakTags: [] },
        reading: { estBand: "C", gap: 1, weakTags: ["reading:part-b-gist"] },
        speaking: { estBand: "B", gap: 0, weakTags: [] },
      },
    });
    const updated = applyReadingResult(map, 0.9, [], ["reading:part-b-gist"]);
    expect(updated.diagnostic.reading.estBand).toBe("B");
    expect(updated.diagnostic.reading.gap).toBe(0);
  });
});

describe("passageBlocksForQuiz", () => {
  it("returns blocks for passage-linked Part A questions", () => {
    const questions = selectQuizQuestions({
      weakTags: ["reading:part-a-speed"],
      profession: "pharmacy",
      mode: "adaptive",
      limit: 4,
    });
    const blocks = passageBlocksForQuiz(questions);
    const linked = questions.filter((q) => q.passageId);
    if (linked.length === 0) return;
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]!.paragraphs.length).toBeGreaterThan(0);
    expect(linked.every((q) => blocks.some((b) => b.id === q.passageId))).toBe(true);
  });
});

describe("quizBriefingPart", () => {
  it("follows weak tag part when present", () => {
    expect(quizBriefingPart(["reading:part-a-speed"], [])).toBe("A");
    expect(quizBriefingPart(["reading:part-b-gist"], [])).toBe("B");
  });
});

describe("quizRationale", () => {
  it("mentions weak tag in Nika voice", () => {
    const qs = selectQuizQuestions({ weakTags: ["reading:part-a-speed"], limit: 2 });
    const text = quizRationale(["reading:part-a-speed"], qs);
    expect(text.toLowerCase()).toContain("part a");
  });
});

describe("buildDailyPlan reading priority", () => {
  it("routes to adaptive quiz and Part B when reading is priority", () => {
    const plan = buildDailyPlan({
      profession: "nursing",
      targetCountry: "UK",
      skillMap: testSkillMap({
        priority: ["reading", "writing", "listening", "speaking"],
        diagnostic: {
          writing: { estBand: "B", gap: 0, weakTags: [] },
          listening: { estBand: "B", gap: 0, weakTags: [] },
          reading: { estBand: "C", gap: 1, weakTags: ["reading:part-b-gist"] },
          speaking: { estBand: "B", gap: 0, weakTags: [] },
        },
      }),
    });

    expect(plan.prioritySkill).toBe("reading");
    expect(plan.items.some((item) => item.route === "/reading/quiz")).toBe(true);
    expect(plan.items.some((item) => item.route.includes("/reading/part-b/"))).toBe(true);
  });
});
