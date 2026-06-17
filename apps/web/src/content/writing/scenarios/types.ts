import type { OetProfession } from "@/lib/domain/types";

export type ScenarioCountryCode = "UK" | "AU" | "US" | "IE" | "NZ" | "CA";

export interface CaseNote {
  id: string;
  date?: string;
  text: string;
  relevant: boolean;
}

export interface WritingScenario {
  id: string;
  profession: OetProfession;
  difficulty: 1 | 2 | 3;
  meta: {
    title: string;
    letterType: string;
    readerRole: string;
    readerName?: string;
    estimatedWordCount: number;
    /** Primary locale flavour for names, roles, and health-system context */
    countryCode: ScenarioCountryCode;
  };
  taskSheet: {
    instruction: string;
    bulletPoints: string[];
  };
  caseNotes: CaseNote[];
  assessorGuide: {
    purposeStatement: string;
    mustInclude: string[];
    shouldOmit: string[];
  };
}

export const COUNTRY_LABELS: Record<ScenarioCountryCode, string> = {
  UK: "United Kingdom",
  AU: "Australia",
  US: "United States",
  IE: "Ireland",
  NZ: "New Zealand",
  CA: "Canada",
};
