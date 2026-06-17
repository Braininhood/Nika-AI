import { gradeIndex } from "@/lib/domain/grades";
import type { OetGrade, OetSkill, SkillMap, TargetGrades } from "@/lib/domain/types";
import type { MockAttemptRecord } from "@/lib/db/types";

import {
  minSessionsPerWeakSkillMet,
  skillStableAtTarget,
  skillTrendDown,
} from "./skill-stats";
import type { ReadinessGate, ReadinessState, ReadinessStatus, SkillAttemptStats } from "./types";

export const CONSECUTIVE_PASSES_REQUIRED = 2;
export const REDIAGNOSTIC_INTERVAL_DAYS = 14;
const CRITICAL_TAG_CLEAR_DAYS = 7;
const MIN_SESSIONS_PER_WEAK = 3;
const STABILITY_LAST_N = 3;

const SKILLS: OetSkill[] = ["listening", "reading", "writing", "speaking"];

export function mockMeetsTarget(
  skillGrades: Partial<Record<OetSkill, OetGrade>>,
  targetGrades: TargetGrades,
): boolean {
  return SKILLS.every((skill) => {
    const band = skillGrades[skill];
    if (!band) return false;
    return gradeIndex(band) >= gradeIndex(targetGrades[skill]);
  });
}

export function failedSkillsFromMock(
  skillGrades: Partial<Record<OetSkill, OetGrade>>,
  targetGrades: TargetGrades,
): OetSkill[] {
  return SKILLS.filter((skill) => {
    const band = skillGrades[skill];
    if (!band) return true;
    return gradeIndex(band) < gradeIndex(targetGrades[skill]);
  });
}

export function evaluateReadinessGates(
  skillMap: SkillMap,
  stats: SkillAttemptStats,
  lastDiagnosticAt: number | null,
): ReadinessGate[] {
  const weakSkills = SKILLS.filter((s) => skillMap.diagnostic[s].gap > 0);

  const volumeMet = minSessionsPerWeakSkillMet(skillMap, stats, MIN_SESSIONS_PER_WEAK);
  const bandsMet = SKILLS.every((s) =>
    skillMap.diagnostic[s].gap === 0 || skillStableAtTarget(s, skillMap, stats, STABILITY_LAST_N),
  );
  const noCriticalOpen = !weakSkills.some((s) => skillMap.diagnostic[s].gap >= 2);
  const stableTrend = !SKILLS.some((s) => skillTrendDown(s, stats));

  const daysSinceDiag =
    lastDiagnosticAt != null
      ? Math.floor((Date.now() - lastDiagnosticAt) / (24 * 60 * 60 * 1000))
      : null;

  return [
    {
      id: "min_volume",
      label: "Practice volume",
      met: volumeMet,
      detail: volumeMet
        ? `≥${MIN_SESSIONS_PER_WEAK} sessions on each weak skill`
        : `Complete ≥${MIN_SESSIONS_PER_WEAK} practice sessions per weak skill`,
    },
    {
      id: "skill_bands",
      label: "Skills at target",
      met: bandsMet,
      detail: bandsMet
        ? `Last ${STABILITY_LAST_N} practice blocks at or above target`
        : `Need ${STABILITY_LAST_N} consecutive practice blocks at target per weak skill`,
    },
    {
      id: "no_critical",
      label: "No critical gaps",
      met: noCriticalOpen,
      detail: noCriticalOpen
        ? "No skill more than 1 grade below target"
        : "Close large gaps (2+ grades) before a mock",
    },
    {
      id: "stability",
      label: "Stable performance",
      met: stableTrend,
      detail: stableTrend
        ? "No downward trend on priority skills"
        : "Recent attempts show a dip — keep practising",
    },
    {
      id: "rediagnostic",
      label: "Diagnostic freshness",
      met: daysSinceDiag == null || daysSinceDiag <= REDIAGNOSTIC_INTERVAL_DAYS,
      detail:
        daysSinceDiag == null
          ? "Complete placement test first"
          : daysSinceDiag <= REDIAGNOSTIC_INTERVAL_DAYS
            ? `Last diagnostic ${daysSinceDiag} day(s) ago`
            : `Re-diagnostic recommended (${daysSinceDiag} days since last)`,
    },
  ];
}

export function computeReadinessState(
  consecutivePasses: number,
  allGatesMet: boolean,
  lastMockPassed: boolean | null,
): ReadinessState {
  if (consecutivePasses >= CONSECUTIVE_PASSES_REQUIRED) return "exam_ready";
  if (consecutivePasses === 1) return "mock_pass_pending";
  if (allGatesMet) return "mock_eligible";
  return "studying";
}

export function nikaReadinessMessage(
  state: ReadinessState,
  gates: ReadinessGate[],
  consecutivePasses: number,
  failedSkills: OetSkill[],
): string {
  if (state === "exam_ready") {
    return "You've passed two practice tests at your target level. You're ready to book OET when you feel confident.";
  }
  if (state === "mock_pass_pending") {
    return `Great — 1 of ${CONSECUTIVE_PASSES_REQUIRED} mocks passed at target. One more timed practice test to confirm exam readiness.`;
  }
  if (state === "mock_eligible") {
    return "You're performing consistently at your target level. Ready for a timed OET practice test?";
  }
  if (failedSkills.length) {
    const list = failedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
    return `Your last mock showed ${list} needs more work. I've updated your plan — let's focus there, then try again.`;
  }
  const unmet = gates.filter((g) => !g.met && g.id !== "rediagnostic");
  if (unmet.length) {
    return `Keep going — ${unmet[0]!.label.toLowerCase()} is the next milestone before a full mock.`;
  }
  return "Your plan adapts after every attempt. Complete today's focus areas to unlock a mock test.";
}

export function buildReadinessStatus(input: {
  skillMap: SkillMap;
  stats: SkillAttemptStats;
  consecutiveMockPasses: number;
  lastDiagnosticAt: number | null;
  lastMock?: MockAttemptRecord | null;
  forcedState?: ReadinessState;
}): ReadinessStatus {
  const gates = evaluateReadinessGates(input.skillMap, input.stats, input.lastDiagnosticAt);
  const allGatesMet = gates.filter((g) => g.id !== "rediagnostic").every((g) => g.met);
  const state =
    input.forcedState ??
    computeReadinessState(input.consecutiveMockPasses, allGatesMet, input.lastMock?.passed ?? null);

  const daysSinceDiagnostic =
    input.lastDiagnosticAt != null
      ? Math.floor((Date.now() - input.lastDiagnosticAt) / (24 * 60 * 60 * 1000))
      : null;

  const failedSkills = (input.lastMock?.failedSkills ?? []) as OetSkill[];

  return {
    state,
    consecutiveMockPasses: input.consecutiveMockPasses,
    gates,
    allGatesMet,
    nikaMessage: nikaReadinessMessage(state, gates, input.consecutiveMockPasses, failedSkills),
    failedSkillsFromLastMock: failedSkills,
    rediagnosticDue:
      daysSinceDiagnostic != null && daysSinceDiagnostic >= REDIAGNOSTIC_INTERVAL_DAYS,
    daysSinceDiagnostic,
  };
}

export function nextReadinessAfterMock(
  passed: boolean,
  currentPasses: number,
  allGatesMet: boolean,
): { state: ReadinessState; consecutivePasses: number } {
  if (passed) {
    const consecutivePasses = currentPasses + 1;
    const state = computeReadinessState(consecutivePasses, allGatesMet, true);
    return { state, consecutivePasses };
  }
  return { state: "studying", consecutivePasses: 0 };
}
