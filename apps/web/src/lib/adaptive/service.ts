import { buildReadinessStatus, evaluateReadinessGates } from "@/lib/adaptive/readiness";
import { generatePersonalCourse } from "@/lib/adaptive/personal-course";
import { computeSkillAttemptStats } from "@/lib/adaptive/skill-stats";
import type { PersonalCourse, ReadinessStatus } from "@/lib/adaptive/types";
import { db } from "@/lib/db";
import type { PersonalCourseRecord, ReadinessStateRecord } from "@/lib/db/types";
import { loadUserProfile } from "@/lib/profile/service";
import { createClient } from "@/lib/supabase/client";

export async function loadReadinessStatus(
  accessToken?: string,
): Promise<ReadinessStatus | null> {
  const profile = await loadUserProfile();
  if (!profile?.skillMap) return null;

  const attempts = await db.attempts.toArray();
  const stats = computeSkillAttemptStats(attempts);
  const diagSession = await db.diagnosticSessions.get(profile.id);
  const lastDiagnosticAt = diagSession?.updatedAt ?? null;

  const readinessRow = await db.readinessState.get(profile.id);
  const mocks = await db.mockAttempts
    .where("userId")
    .equals(profile.id)
    .filter((m) => m.status === "completed")
    .toArray();
  const lastMock = mocks.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];

  const gates = evaluateReadinessGates(profile.skillMap, stats, lastDiagnosticAt);
  const allGatesMet = gates.filter((g) => g.id !== "rediagnostic").every((g) => g.met);

  if (readinessRow) {
    await db.readinessState.put({
      ...readinessRow,
      allGatesMet,
      updatedAt: Date.now(),
    });
  }

  const status = buildReadinessStatus({
    skillMap: profile.skillMap,
    stats,
    consecutiveMockPasses: readinessRow?.consecutiveMockPasses ?? 0,
    lastDiagnosticAt,
    lastMock,
    forcedState:
      readinessRow?.state === "exam_ready" &&
      (readinessRow.consecutiveMockPasses ?? 0) >= 2
        ? "exam_ready"
        : undefined,
  });

  if (accessToken) {
    const { fetchMlReadinessPrediction } = await import("@/lib/adaptive/readiness-api");
    const mlPrediction = await fetchMlReadinessPrediction(accessToken);
    if (mlPrediction) return { ...status, mlPrediction };
  }

  return status;
}

export async function ensureReadinessRecord(): Promise<ReadinessStateRecord | null> {
  const profile = await loadUserProfile();
  if (!profile) return null;

  const existing = await db.readinessState.get(profile.id);
  if (existing) return existing;

  const row: ReadinessStateRecord = {
    userId: profile.id,
    state: "studying",
    consecutiveMockPasses: 0,
    allGatesMet: false,
    updatedAt: Date.now(),
  };
  await db.readinessState.put(row);
  return row;
}

export async function loadPersonalCourse(): Promise<PersonalCourse | null> {
  const profile = await loadUserProfile();
  if (!profile?.skillMap) return null;

  const record = await db.personalCourses.get(profile.id);
  if (record?.snapshot) {
    return record.snapshot as unknown as PersonalCourse;
  }

  const course = generatePersonalCourse(profile, profile.skillMap);
  await db.personalCourses.put({
    userId: profile.id,
    version: course.version,
    snapshot: course as unknown as Record<string, unknown>,
    generatedAt: Date.now(),
  });
  return course;
}

/** Called after any skill attempt — refresh readiness gates + regenerate course. */
export async function refreshAdaptiveState(accessToken?: string): Promise<void> {
  const profile = await loadUserProfile();
  if (!profile?.skillMap) return;

  await ensureReadinessRecord();
  const status = await loadReadinessStatus(accessToken);
  if (!status) return;

  const readinessRow = await db.readinessState.get(profile.id);
  const consecutivePasses = status.consecutiveMockPasses;
  const examReady = consecutivePasses >= 2;

  if (readinessRow && readinessRow.state !== "exam_ready") {
    const newState =
      examReady
        ? "exam_ready"
        : consecutivePasses === 1
          ? "mock_pass_pending"
          : status.allGatesMet
            ? "mock_eligible"
            : "studying";

    await db.readinessState.put({
      ...readinessRow,
      state: newState,
      consecutiveMockPasses: consecutivePasses,
      allGatesMet: status.allGatesMet,
      updatedAt: Date.now(),
    });
  }

  if (accessToken && (examReady || consecutivePasses >= 1)) {
    const { recordTrainingOutcome } = await import("@/lib/adaptive/readiness-api");
    void recordTrainingOutcome(accessToken, {
      examReady,
      consecutiveMockPasses: consecutivePasses,
    });
  } else if (examReady || consecutivePasses >= 1) {
    const supabase = createClient();
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
    const token = data.session?.access_token;
    if (token) {
      const { recordTrainingOutcome } = await import("@/lib/adaptive/readiness-api");
      void recordTrainingOutcome(token, {
        examReady,
        consecutiveMockPasses: consecutivePasses,
      });
    }
  }

  const course = generatePersonalCourse(
    profile,
    profile.skillMap,
    (readinessRow?.courseVersion ?? 0) + 1,
  );
  const courseRecord: PersonalCourseRecord = {
    userId: profile.id,
    version: course.version,
    snapshot: course as unknown as Record<string, unknown>,
    generatedAt: Date.now(),
  };
  await db.personalCourses.put(courseRecord);

  if (readinessRow) {
    await db.readinessState.put({
      ...readinessRow,
      courseVersion: course.version,
      updatedAt: Date.now(),
    });
  }

  window.dispatchEvent(new CustomEvent("oet-adaptive-updated"));
}
