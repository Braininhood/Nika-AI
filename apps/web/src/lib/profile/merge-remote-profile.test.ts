import { describe, expect, it } from "vitest";

import type { LocalUser } from "@/lib/db/types";
import { mergeRemoteProfileIntoLocal } from "@/lib/profile/merge-remote-profile";
import { resolveStudyGoal, shouldShowExamCountdown } from "@/lib/exam/countdown";

const baseLocal: LocalUser = {
  id: "user-1",
  email: "nurse@example.com",
  profession: "pharmacy",
  targetCountry: "UK",
  targetRegulator: "GPhC",
  isGuest: false,
  updatedAt: 1,
};

describe("mergeRemoteProfileIntoLocal", () => {
  it("overwrites local profession and regulator from server", () => {
    const merged = mergeRemoteProfileIntoLocal(baseLocal, {
      id: "user-1",
      profession: "nursing",
      target_country: "AU",
      target_regulator: "NMBA",
      target_grades: {
        listening: "B",
        reading: "B",
        writing: "B",
        speaking: "B",
        single_sitting: false,
      },
      onboarding_complete: true,
      study_goal: "training",
      exam_date: null,
    });

    expect(merged.profession).toBe("nursing");
    expect(merged.targetCountry).toBe("AU");
    expect(merged.targetRegulator).toBe("NMBA");
    expect(merged.onboardingComplete).toBe(true);
    expect(merged.studyGoal).toBe("training");
    expect(merged.examDate).toBeUndefined();
  });

  it("preserves local fields when server omits them", () => {
    const merged = mergeRemoteProfileIntoLocal(
      { ...baseLocal, studyGoal: "exam_prep", examDate: "2026-09-15" },
      { id: "user-1", study_goal: "training" },
    );

    expect(merged.profession).toBe("pharmacy");
    expect(merged.studyGoal).toBe("training");
    expect(merged.examDate).toBe("2026-09-15");
  });

  it("clears exam date when server sends null", () => {
    const merged = mergeRemoteProfileIntoLocal(
      { ...baseLocal, examDate: "2026-09-15", studyGoal: "exam_prep" },
      { id: "user-1", exam_date: null, study_goal: "training" },
    );

    expect(merged.examDate).toBeUndefined();
    expect(merged.studyGoal).toBe("training");
  });
});

describe("training-only nursing profile helpers", () => {
  it("defaults to training without exam date", () => {
    expect(resolveStudyGoal({ studyGoal: "training" })).toBe("training");
    expect(shouldShowExamCountdown({ studyGoal: "training", examDate: undefined })).toBe(false);
  });

  it("hides countdown for training even if legacy exam date exists", () => {
    expect(
      shouldShowExamCountdown({ studyGoal: "training", examDate: "2026-12-01" }),
    ).toBe(false);
  });

  it("shows countdown only for exam_prep with date", () => {
    expect(
      shouldShowExamCountdown({ studyGoal: "exam_prep", examDate: "2026-12-01" }),
    ).toBe(true);
  });
});
