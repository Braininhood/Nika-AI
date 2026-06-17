import type { CriterionScore, GradedSampleLetter } from "./types";
import { OET_CRITERIA } from "./types";

export function criterionScores(
  grade: "B" | "C" | "A",
  comments: Partial<Record<(typeof OET_CRITERIA)[number], string>>,
): CriterionScore[] {
  const defaults: Record<"B" | "C" | "A", string> = {
    B: "Meets Grade B expectations for this criterion.",
    C: "Below task requirements for this criterion.",
    A: "Strong performance at Grade A level.",
  };
  return OET_CRITERIA.map((criterion) => ({
    criterion,
    grade,
    comment: comments[criterion] ?? defaults[grade],
  }));
}

export function buildSample(
  base: Omit<GradedSampleLetter, "criterionScores"> & {
    criterionComments?: Partial<Record<(typeof OET_CRITERIA)[number], string>>;
  },
): GradedSampleLetter {
  const { criterionComments, ...rest } = base;
  return {
    ...rest,
    criterionScores: criterionScores(rest.estimatedOverall, criterionComments ?? {}),
  };
}
