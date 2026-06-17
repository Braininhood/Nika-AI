import { accuracyToBand } from "@/lib/quiz/engine";
import { gradeIndex } from "@/lib/domain/grades";
import type { OetGrade, OetSkill, TargetGrades } from "@/lib/domain/types";

import {
  applyListeningResult,
  applyReadingResult,
  applySpeakingResult,
} from "@/lib/quiz/engine";
import { applyWritingResult } from "@/lib/adaptive/skill-map";
import {
  failedSkillsFromMock,
  mockMeetsTarget,
  nextReadinessAfterMock,
} from "@/lib/adaptive/readiness";
import { generatePersonalCourse } from "@/lib/adaptive/personal-course";
import type { MockSkillResult } from "@/lib/adaptive/types";
import { db } from "@/lib/db";
import type { MockAttemptRecord, ReadinessStateRecord } from "@/lib/db/types";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";

import { MOCK_SKILL_ORDER } from "./build-mock";

export { MOCK_SKILL_ORDER };

export interface MockSubmitInput {
  mockId: string;
  skillResults: Partial<Record<OetSkill, MockSkillResult>>;
}

export interface MockSubmitResult {
  passed: boolean;
  failedSkills: OetSkill[];
  readinessState: string;
  consecutivePasses: number;
  nikaMessage: string;
  skillMapUpdated: boolean;
}

function estBandFromResult(result: MockSkillResult): OetGrade {
  return result.estBand;
}

export function scoreMockFromResults(
  skillResults: Partial<Record<OetSkill, MockSkillResult>>,
  targetGrades: TargetGrades,
): { passed: boolean; failedSkills: OetSkill[]; grades: Partial<Record<OetSkill, OetGrade>> } {
  const grades: Partial<Record<OetSkill, OetGrade>> = {};
  for (const skill of MOCK_SKILL_ORDER) {
    const r = skillResults[skill];
    if (r) grades[skill] = estBandFromResult(r);
  }
  const passed = mockMeetsTarget(grades, targetGrades);
  const failedSkills = failedSkillsFromMock(grades, targetGrades);
  return { passed, failedSkills, grades };
}

function adaptSkillMapOnMockFail(
  skillMap: import("@/lib/domain/types").SkillMap,
  failedSkills: OetSkill[],
  skillResults: Partial<Record<OetSkill, MockSkillResult>>,
): import("@/lib/domain/types").SkillMap {
  let updated = { ...skillMap };

  for (const skill of failedSkills) {
    const result = skillResults[skill];
    if (!result) continue;
    const weakTags = [`${skill}:mock-fail`];
    const accuracy = result.accuracy ?? gradeIndex(result.estBand) / 5;

    if (skill === "writing") {
      updated = applyWritingResult(updated, { purpose: accuracy }, weakTags);
    } else if (skill === "reading") {
      updated = applyReadingResult(updated, accuracy, weakTags, []);
    } else if (skill === "listening") {
      updated = applyListeningResult(updated, accuracy, weakTags, []);
    } else if (skill === "speaking") {
      updated = applySpeakingResult(updated, accuracy, weakTags, []);
    }
  }

  return updated;
}

export async function submitMockAttempt(input: MockSubmitInput): Promise<MockSubmitResult> {
  const profile = await loadUserProfile();
  if (!profile?.skillMap || !profile.targetGrades) {
    throw new Error("Complete diagnostic and onboarding before submitting a mock.");
  }

  const { passed, failedSkills } = scoreMockFromResults(
    input.skillResults,
    profile.targetGrades,
  );

  const existing = await db.mockAttempts.get(input.mockId);
  const now = Date.now();

  const record: MockAttemptRecord = {
    id: input.mockId,
    userId: profile.id,
    type: "full",
    status: "completed",
    skillResults: input.skillResults,
    passed,
    failedSkills,
    startedAt: existing?.startedAt ?? now,
    completedAt: now,
  };
  await db.mockAttempts.put(record);

  const readinessRow = await db.readinessState.get(profile.id);
  const currentPasses = readinessRow?.consecutiveMockPasses ?? 0;
  const allGatesMet = readinessRow?.allGatesMet ?? false;
  const { state, consecutivePasses } = nextReadinessAfterMock(passed, currentPasses, allGatesMet);

  const readiness: ReadinessStateRecord = {
    userId: profile.id,
    state,
    consecutiveMockPasses: consecutivePasses,
    lastMockAt: now,
    lastMockPassed: passed,
    failedSkillsFromLastMock: passed ? [] : failedSkills,
    updatedAt: now,
  };
  await db.readinessState.put(readiness);

  let skillMapUpdated = false;
  if (!passed) {
    const adapted = adaptSkillMapOnMockFail(profile.skillMap, failedSkills, input.skillResults);
    await saveSkillMap(adapted);
    skillMapUpdated = true;
    window.dispatchEvent(new CustomEvent("oet-skill-map-updated"));
  }

  const course = generatePersonalCourse(profile, profile.skillMap, (readinessRow?.courseVersion ?? 0) + 1);
  await db.personalCourses.put({
    userId: profile.id,
    version: course.version,
    snapshot: course as unknown as Record<string, unknown>,
    generatedAt: now,
  });

  const { nikaReadinessMessage } = await import("@/lib/adaptive/readiness");
  const nikaMessage = nikaReadinessMessage(
    state,
    [],
    consecutivePasses,
    passed ? [] : failedSkills,
  );

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  return {
    passed,
    failedSkills,
    readinessState: state,
    consecutivePasses,
    nikaMessage,
    skillMapUpdated,
  };
}

/** Derive mock skill result from a practice attempt score. */
export function mockResultFromAccuracy(
  skill: OetSkill,
  accuracy: number,
  attemptId?: string,
): MockSkillResult {
  const estBand = accuracyToBand(accuracy);
  return {
    skill,
    estBand,
    passed: gradeIndex(estBand) >= gradeIndex("B"),
    attemptId,
    accuracy,
  };
}

export async function getActiveMockSession(): Promise<MockAttemptRecord | undefined> {
  const profile = await loadUserProfile();
  if (!profile) return undefined;
  const inProgress = await db.mockAttempts
    .where("userId")
    .equals(profile.id)
    .filter((m) => m.status === "in_progress")
    .first();
  return inProgress;
}

export async function startMockSession(mockId: string): Promise<MockAttemptRecord> {
  const profile = await loadUserProfile();
  if (!profile) throw new Error("Sign in required");

  const existing = await getActiveMockSession();
  if (existing) return existing;

  const record: MockAttemptRecord = {
    id: mockId,
    userId: profile.id,
    type: "full",
    status: "in_progress",
    skillResults: {},
    passed: false,
    failedSkills: [],
    startedAt: Date.now(),
  };
  await db.mockAttempts.put(record);
  return record;
}

export async function recordMockSkillCompletion(
  mockId: string,
  skill: OetSkill,
  result: MockSkillResult,
): Promise<void> {
  const record = await db.mockAttempts.get(mockId);
  if (!record) return;
  await db.mockAttempts.put({
    ...record,
    skillResults: { ...record.skillResults, [skill]: result },
  });
}
