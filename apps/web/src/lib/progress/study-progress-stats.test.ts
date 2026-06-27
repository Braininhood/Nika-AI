import { describe, expect, it } from "vitest";

import { estimateAttemptMinutes } from "@/lib/progress/study-progress-stats";
import type { AttemptRecord } from "@/lib/db/types";
import {
  computeStudyStreak,
  pluralDays,
  startOfDay,
} from "@/lib/progress/study-streak";

function attempt(partial: Partial<AttemptRecord> & Pick<AttemptRecord, "skill">): AttemptRecord {
  return {
    id: "a1",
    scoreRaw: {},
    createdAt: Date.now(),
    synced: false,
    ...partial,
  };
}

describe("computeStudyStreak", () => {
  it("counts consecutive days with attempts", () => {
    const today = startOfDay(Date.now());
    const streak = computeStudyStreak([today, today - 86_400_000], {});
    expect(streak).toBe(2);
  });

  it("counts tracked minutes without attempts", () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const streak = computeStudyStreak([], { [todayKey]: 15 });
    expect(streak).toBe(1);
  });

  it("ignores tracked minutes below threshold", () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const streak = computeStudyStreak([], { [todayKey]: 5 });
    expect(streak).toBe(0);
  });
});

describe("pluralDays", () => {
  it("uses singular for one day", () => {
    expect(pluralDays(1)).toBe("1 day");
    expect(pluralDays(3)).toBe("3 days");
  });
});

describe("estimateAttemptMinutes", () => {
  it("estimates writing from word count", () => {
    expect(
      estimateAttemptMinutes(
        attempt({ skill: "writing", scoreRaw: { wordCount: 200 } }),
      ),
    ).toBe(45);
  });

  it("estimates speaking from duration", () => {
    expect(
      estimateAttemptMinutes(
        attempt({ skill: "speaking", scoreRaw: { durationSeconds: 300 } }),
      ),
    ).toBe(5);
  });

  it("estimates reading quiz from question count", () => {
    expect(
      estimateAttemptMinutes(
        attempt({ skill: "reading", scoreRaw: { total: 10 } }),
      ),
    ).toBe(15);
  });
});
