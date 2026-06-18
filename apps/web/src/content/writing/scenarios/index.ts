import {
  DENTISTRY_SCENARIOS,
  DIETETICS_SCENARIOS,
  OCCUPATIONAL_THERAPY_SCENARIOS,
  OPTOMETRY_SCENARIOS,
  PHYSIOTHERAPY_SCENARIOS,
  PODIATRY_SCENARIOS,
  RADIOGRAPHY_SCENARIOS,
  SPEECH_PATHOLOGY_SCENARIOS,
  VETERINARY_SCENARIOS,
} from "./allied-health";
import { COUNTRY_WAVE2_SCENARIOS } from "./country-wave2";
import { COUNTRY_WAVE3_SCENARIOS } from "./country-wave3";
import { MEDICINE_SCENARIOS } from "./medicine";
import { NURSING_SCENARIOS } from "./nursing";
import { PHARMACY_SCENARIOS } from "./pharmacy";
import type { OetProfession } from "@/lib/domain/types";
import { getProfessionLabel } from "@/lib/domain/professions";
import { filterPoolByDifficulty, pickRotatedItem } from "@/lib/content/rotation";
import { getActiveWritingScenarios } from "@/lib/content/active-content";
import {
  isValidWritingScenario,
  scenarioSortTitle,
} from "@/lib/content/writing-scenario-guard";

import {
  COUNTRY_LABELS,
  type ScenarioCountryCode,
  type WritingScenario,
} from "./types";

export const WRITING_SCENARIOS: WritingScenario[] = [
  ...PHARMACY_SCENARIOS,
  ...NURSING_SCENARIOS,
  ...MEDICINE_SCENARIOS,
  ...COUNTRY_WAVE2_SCENARIOS,
  ...COUNTRY_WAVE3_SCENARIOS,
  ...DENTISTRY_SCENARIOS,
  ...PHYSIOTHERAPY_SCENARIOS,
  ...OCCUPATIONAL_THERAPY_SCENARIOS,
  ...PODIATRY_SCENARIOS,
  ...OPTOMETRY_SCENARIOS,
  ...DIETETICS_SCENARIOS,
  ...RADIOGRAPHY_SCENARIOS,
  ...SPEECH_PATHOLOGY_SCENARIOS,
  ...VETERINARY_SCENARIOS,
];

const COUNTRY_ALIASES: Record<string, ScenarioCountryCode> = {
  UK: "UK",
  GB: "UK",
  AU: "AU",
  AUS: "AU",
  US: "US",
  USA: "US",
  IE: "IE",
  IRL: "IE",
  NZ: "NZ",
  CA: "CA",
};

export function normalizeScenarioCountry(code?: string): ScenarioCountryCode | undefined {
  if (!code) return undefined;
  const upper = code.trim().toUpperCase();
  return COUNTRY_ALIASES[upper];
}

function sortScenarios(list: WritingScenario[]): WritingScenario[] {
  return [...list]
    .filter(isValidWritingScenario)
    .sort(
      (a, b) => a.difficulty - b.difficulty || scenarioSortTitle(a).localeCompare(scenarioSortTitle(b)),
    );
}

export function getScenario(id: string): WritingScenario | undefined {
  return getActiveWritingScenarios().find((s) => s.id === id);
}

export function scenariosForProfession(profession: string): WritingScenario[] {
  return sortScenarios(getActiveWritingScenarios().filter((s) => s.profession === profession));
}

/** Prefer scenarios matching the user's target country, then show others for the same profession. */
export function scenariosForUser(
  profession?: string,
  targetCountry?: string,
): WritingScenario[] {
  const all = getActiveWritingScenarios();
  if (!profession) return sortScenarios(all);

  const forProfession = scenariosForProfession(profession);
  if (forProfession.length === 0) return sortScenarios(all);

  const country = normalizeScenarioCountry(targetCountry);
  if (!country) return forProfession;

  const localized = sortScenarios(forProfession.filter((s) => s.meta.countryCode === country));
  const other = sortScenarios(forProfession.filter((s) => s.meta.countryCode !== country));
  return [...localized, ...other];
}

/** Pick the best scenario for today's plan — country-first, difficulty matched, rotation-aware. */
export function pickPlanScenario(
  profession?: string,
  targetCountry?: string,
  writingGap?: number,
  recentAttemptIds: string[] = [],
): WritingScenario {
  const list = scenariosForUser(profession, targetCountry);
  const fallback = getScenario("w-pharm-001") ?? list[0] ?? getActiveWritingScenarios()[0];
  if (list.length === 0) return fallback;

  const gap = writingGap ?? 1;
  const maxDifficulty = gap >= 2 ? 1 : gap === 1 ? 2 : 3;
  const matched = filterPoolByDifficulty(list, maxDifficulty);
  return pickRotatedItem(matched, recentAttemptIds);
}

export function formatWeakTagLabel(tag: string): string {
  const part = tag.includes(":") ? tag.split(":")[1] : tag;
  return part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function letterTypeLabel(letterType: string): string {
  return letterType.charAt(0).toUpperCase() + letterType.slice(1);
}

export function scenarioCountryLabel(code: ScenarioCountryCode): string {
  return COUNTRY_LABELS[code];
}

export function professionsWithScenarios(): OetProfession[] {
  return [...new Set(WRITING_SCENARIOS.map((s) => s.profession))];
}

export function scenarioSummary(scenario: WritingScenario): string {
  return `${getProfessionLabel(scenario.profession)} · ${scenarioCountryLabel(scenario.meta.countryCode)}`;
}

export type { CaseNote, ScenarioCountryCode, WritingScenario } from "./types";
export { COUNTRY_LABELS } from "./types";
