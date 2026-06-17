import type { ScenarioCountryCode } from "@/content/writing/scenarios/types";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import { samplesForScenario } from "@/content/writing/sample-letters";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";
import { PROFESSIONS } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";

const OET_COUNTRIES: ScenarioCountryCode[] = ["UK", "AU", "US", "IE", "NZ", "CA"];

export interface ProfessionSkillCoverage {
  profession: OetProfession;
  count: number;
  countries: ScenarioCountryCode[];
  missingCountries: ScenarioCountryCode[];
}

export function writingCoverageMatrix(): ProfessionSkillCoverage[] {
  return PROFESSIONS.map(({ code }) => {
    const items = WRITING_SCENARIOS.filter((s) => s.profession === code);
    const countries = [...new Set(items.map((s) => s.meta.countryCode))];
    const missingCountries = OET_COUNTRIES.filter((c) => !countries.includes(c));
    return { profession: code, count: items.length, countries, missingCountries };
  });
}

export function speakingCoverageMatrix(): ProfessionSkillCoverage[] {
  return PROFESSIONS.map(({ code }) => {
    const items = ROLE_PLAY_CARDS.filter((c) => c.profession === code);
    const countries = [...new Set(items.map((c) => c.countryCode))];
    const missingCountries = OET_COUNTRIES.filter((c) => !countries.includes(c));
    return { profession: code, count: items.length, countries, missingCountries };
  });
}

export function totalMissingCountrySlots(matrix: ProfessionSkillCoverage[]): number {
  return matrix.reduce((sum, row) => sum + row.missingCountries.length, 0);
}

export function allProfessionsPresent(): boolean {
  return (
    writingCoverageMatrix().every((r) => r.count > 0) &&
    speakingCoverageMatrix().every((r) => r.count > 0)
  );
}

export function fullCountryMatrixComplete(matrix: ProfessionSkillCoverage[]): boolean {
  return matrix.every((r) => r.missingCountries.length === 0 && r.count >= OET_COUNTRIES.length);
}

export function writingScenarioCount(): number {
  return WRITING_SCENARIOS.length;
}

export function speakingCardCount(): number {
  return ROLE_PLAY_CARDS.length;
}

function scenarioHasGradedPair(scenarioId: string): boolean {
  const samples = samplesForScenario(scenarioId);
  const hasStrong = samples.some(
    (s) => s.estimatedOverall === "B" || s.estimatedOverall === "A",
  );
  const hasWeak = samples.some((s) => s.estimatedOverall === "C");
  return hasStrong && hasWeak;
}

export function scenariosWithGradedPair(): number {
  return WRITING_SCENARIOS.filter((s) => scenarioHasGradedPair(s.id)).length;
}

export function allScenariosHaveGradedPair(): boolean {
  return WRITING_SCENARIOS.every((s) => scenarioHasGradedPair(s.id));
}
