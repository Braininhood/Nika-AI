import { describe, expect, it } from "vitest";

import { buildSkillMapFromSession, createBlockState, recordAnswer } from "@/lib/diagnostic/engine";
import type { DiagnosticSessionState } from "@/lib/diagnostic/types";

describe("diagnostic engine", () => {
  it("computes skill map from answers", () => {
    let block = createBlockState();
    block = recordAnswer(block, {
      itemId: "w-d-1",
      skill: "writing",
      tier: 2,
      tag: "writing:purpose",
      correct: false,
      selectedIndex: 1,
    });

    const session: DiagnosticSessionState = {
      sessionId: "test",
      userId: "user-1",
      step: "results",
      blocks: { writing: block },
      selfReport: {},
      status: "completed",
      updatedAt: Date.now(),
    };

    const map = buildSkillMapFromSession(session, {
      userId: "user-1",
      profession: "pharmacy",
      targetRegulator: "GPhC",
      targetGrades: {
        listening: "B",
        reading: "B",
        writing: "B",
        speaking: "B",
        single_sitting: false,
      },
    });

    expect(map.diagnostic.writing.weakTags).toContain("writing:purpose");
    expect(map.priority[0]).toBeDefined();
  });
});
