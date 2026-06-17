import {
  primarySampleForProfession,
  samplesForScenario,
  weakSampleForProfession,
  type GradedSampleLetter,
} from "@/content/writing/sample-letters";
import { recommendedWritingStage } from "@/lib/adaptive/skill-map";
import type { SkillMap } from "@/lib/domain/types";
import type { WritingContentContext } from "@/lib/writing/content-context";

export interface WritingRecommendation {
  id: string;
  title: string;
  description: string;
  route: string;
  kind: "learn" | "sample" | "drill" | "guided" | "practice" | "exam" | "progress";
  durationMinutes?: number;
}

/** Single best next step from profile, skill map, and content context. */
export function primaryWritingRecommendation(
  ctx: WritingContentContext,
): WritingRecommendation {
  const stage = recommendedWritingStage(ctx.profile?.skillMap);
  const scenario = ctx.primaryScenario;
  const scenarioSample = gradeBSampleForScenario(scenario.id);
  const professionSample =
    ctx.profession ? primarySampleForProfession(ctx.profession) : undefined;

  if (stage === "learn") {
    const sample = scenarioSample ?? professionSample;
    if (sample) {
      const weak = ctx.profession ? weakSampleForProfession(ctx.profession) : undefined;
      return {
        id: "read-sample",
        kind: "sample",
        title: `Study Grade B sample — ${sample.title}`,
        description: weak
          ? "Read the model letter, then compare with the Grade C weak sample."
          : "Read assessor annotations before your next attempt.",
        route: `/writing/learn/samples/${sample.id}`,
        durationMinutes: 10,
      };
    }
    return {
      id: "drills",
      kind: "drill",
      title: "Content-selection drills",
      description: "Train Purpose and Content without writing a full letter.",
      route: "/writing/learn/drills",
      durationMinutes: 10,
    };
  }

  if (stage === "guided") {
    return {
      id: "guided",
      kind: "guided",
      title: `Guided wizard — ${scenario.meta.title}`,
      description: "Step through purpose, body facts, and closing with hints.",
      route: `/writing/guided/${scenario.id}`,
      durationMinutes: 20,
    };
  }

  const gap = ctx.profile?.skillMap?.diagnostic.writing?.gap ?? 1;
  if (stage === "practice" && gap === 0) {
    return {
      id: "exam",
      kind: "exam",
      title: `Exam timing — ${scenario.meta.title}`,
      description: "5 minutes reading notes, 40 minutes writing, no hints.",
      route: `/writing/exam/${scenario.id}`,
      durationMinutes: 45,
    };
  }

  return {
    id: "practice",
    kind: "practice",
    title: `Practice — ${scenario.meta.title}`,
    description: "Full case notes and letter with checklist + AI feedback.",
    route: `/writing/practice/${scenario.id}`,
    durationMinutes: 25,
  };
}

export function gradeBSampleForScenario(scenarioId: string): GradedSampleLetter | undefined {
  return samplesForScenario(scenarioId).find((s) => s.estimatedOverall === "B");
}

export function writingStageLabel(skillMap?: SkillMap): string {
  const stage = recommendedWritingStage(skillMap);
  if (stage === "learn") return "Foundation — Learn";
  if (stage === "guided") return "Building — Guided";
  return "Ready — Practice";
}
