import { ALLIED_HEALTH_SAMPLES } from "./allied-health";
import { GRADE_C_SAMPLES } from "./grade-c-samples";
import { NURSING_SAMPLES, MEDICINE_SAMPLES } from "./clinical";
import { PHARMACY_SAMPLES } from "./pharmacy";
import { WAVE2_GRADED_SAMPLES } from "./samples-wave2";
import { WAVE3_GRADED_SAMPLES } from "./samples-wave3";
import { WAVE5_BASELINE_GRADED_SAMPLES } from "./samples-wave5-baseline";
import type { OetProfession } from "@/lib/domain/types";
import { getProfessionLabel } from "@/lib/domain/professions";
import { pickPlanScenario } from "@/content/writing/scenarios";

import type { GradedSampleLetter } from "./types";

export const GRADED_SAMPLE_LETTERS: GradedSampleLetter[] = [
  ...PHARMACY_SAMPLES,
  ...NURSING_SAMPLES,
  ...MEDICINE_SAMPLES,
  ...ALLIED_HEALTH_SAMPLES,
  ...GRADE_C_SAMPLES,
  ...WAVE2_GRADED_SAMPLES,
  ...WAVE3_GRADED_SAMPLES,
  ...WAVE5_BASELINE_GRADED_SAMPLES,
];

/** Grade B flagship sample per profession. */
export const PROFESSION_SAMPLE_IDS: Record<OetProfession, string> = {
  pharmacy: "sample-pharm-referral-b",
  nursing: "sample-nurs-discharge-b",
  medicine: "sample-med-reply-b",
  dentistry: "sample-dent-referral-b",
  physiotherapy: "sample-phys-reply-b",
  occupational_therapy: "sample-ot-discharge-b",
  podiatry: "sample-pod-referral-b",
  optometry: "sample-opt-referral-b",
  dietetics: "sample-diet-advice-b",
  radiography: "sample-rad-referral-b",
  speech_pathology: "sample-sp-referral-b",
  veterinary_science: "sample-vet-referral-b",
};

/** Grade C weak sample per profession (compare with B). */
export const PROFESSION_WEAK_SAMPLE_IDS: Record<OetProfession, string> = {
  pharmacy: "sample-pharm-referral-c",
  nursing: "sample-nurs-discharge-c",
  medicine: "sample-med-reply-c",
  dentistry: "sample-dent-referral-c",
  physiotherapy: "sample-phys-reply-c",
  occupational_therapy: "sample-ot-discharge-c",
  podiatry: "sample-pod-referral-c",
  optometry: "sample-opt-referral-c",
  dietetics: "sample-diet-advice-c",
  radiography: "sample-rad-referral-c",
  speech_pathology: "sample-sp-referral-c",
  veterinary_science: "sample-vet-referral-c",
};

export function getSampleLetter(id: string): GradedSampleLetter | undefined {
  return GRADED_SAMPLE_LETTERS.find((s) => s.id === id);
}

export function samplesForScenario(scenarioId: string): GradedSampleLetter[] {
  return GRADED_SAMPLE_LETTERS.filter((s) => s.scenarioId === scenarioId);
}

export function samplesForProfession(profession: string): GradedSampleLetter[] {
  return GRADED_SAMPLE_LETTERS.filter((s) => s.profession === profession);
}

/** Prefer samples linked to the user's country-matched plan scenario, then other profession samples. */
export function samplesForUser(
  profession?: string,
  targetCountry?: string,
): GradedSampleLetter[] {
  if (!profession) return GRADED_SAMPLE_LETTERS;

  const forProfession = samplesForProfession(profession);
  if (forProfession.length === 0) return GRADED_SAMPLE_LETTERS;

  const primaryScenario = pickPlanScenario(profession, targetCountry);
  const linked = samplesForProfessionSorted(profession).filter(
    (s) => s.scenarioId === primaryScenario.id,
  );
  const other = samplesForProfessionSorted(profession).filter(
    (s) => s.scenarioId !== primaryScenario.id,
  );
  return [...linked, ...other];
}

export function primarySampleForProfession(profession: string): GradedSampleLetter | undefined {
  const id = PROFESSION_SAMPLE_IDS[profession as OetProfession];
  return id ? getSampleLetter(id) : samplesForProfession(profession)[0];
}

export function weakSampleForProfession(profession: string): GradedSampleLetter | undefined {
  const id = PROFESSION_WEAK_SAMPLE_IDS[profession as OetProfession];
  return id ? getSampleLetter(id) : undefined;
}

/** Grade B first, then Grade C, for side-by-side learning. */
export function samplesForProfessionSorted(profession: string): GradedSampleLetter[] {
  const list = samplesForProfession(profession);
  const gradeOrder = { B: 0, A: 0, C: 1 };
  return [...list].sort(
    (a, b) =>
      (gradeOrder[a.estimatedOverall] ?? 2) - (gradeOrder[b.estimatedOverall] ?? 2) ||
      a.title.localeCompare(b.title),
  );
}

export function sampleSummary(sample: GradedSampleLetter): string {
  return `${getProfessionLabel(sample.profession as OetProfession)} · Grade ${sample.estimatedOverall}`;
}

export type { AnnotatedParagraph, CriterionScore, GradedSampleLetter } from "./types";
