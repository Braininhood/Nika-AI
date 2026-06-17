import { describe, expect, it } from "vitest";

import { classifyQuestion, REFUSAL_HINT } from "@/lib/nika/topic-guard";

describe("nika topic guard", () => {
  it("allows OET format questions", () => {
    expect(classifyQuestion("How long is Reading Part A?").verdict).toBe("allowed");
  });

  it("allows regulator questions", () => {
    expect(classifyQuestion("GPhC OET requirements").verdict).toBe("allowed");
  });

  it("refuses life topics", () => {
    expect(classifyQuestion("What's the weather today?").verdict).toBe("refused");
  });

  it("refuses unknown general topics", () => {
    expect(classifyQuestion("Who won the world cup?").verdict).toBe("refused");
  });

  it("allows mix task requests", () => {
    expect(classifyQuestion("what about mix tasks?").verdict).toBe("allowed");
  });
});
