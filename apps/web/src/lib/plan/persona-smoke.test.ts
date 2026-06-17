/**
 * Persona A matrix — training-only users across professions and OET destination countries.
 * Verifies profession-scoped plan/content; flags country fallback when no local scenario exists.
 */
import { describe, expect, it } from "vitest";

import { getLessonForProfession } from "@/content/writing/lessons";
import {
  primarySampleForProfession,
  weakSampleForProfession,
} from "@/content/writing/sample-letters";
import {
  pickPlanScenario,
  scenariosForUser,
} from "@/content/writing/scenarios";
import { getRegulatorsForProfession } from "@/lib/domain/requirements";
import type { OetProfession } from "@/lib/domain/types";
import { resolveStudyGoal, shouldShowExamCountdown } from "@/lib/exam/countdown";
import { buildDailyPlan } from "@/lib/plan/build-daily-plan";

interface PersonaCase {
  label: string;
  profession: OetProfession;
  country: string;
  regulator: string;
  /** When set, pickPlanScenario should prefer this scenario country. */
  expectScenarioCountry?: "UK" | "AU" | "US" | "IE" | "NZ" | "CA";
  expectIdPrefix: string;
}

const TRAINING_PERSONAS: PersonaCase[] = [
  {
    label: "Nursing · Australia",
    profession: "nursing",
    country: "AU",
    regulator: "AHPRA",
    expectScenarioCountry: "AU",
    expectIdPrefix: "w-nurs-",
  },
  {
    label: "Nursing · UK",
    profession: "nursing",
    country: "UK",
    regulator: "NMC",
    expectScenarioCountry: "UK",
    expectIdPrefix: "w-nurs-",
  },
  {
    label: "Nursing · USA (fallback scenarios)",
    profession: "nursing",
    country: "US",
    regulator: "US_NURSING",
    expectIdPrefix: "w-nurs-",
  },
  {
    label: "Nursing · Ireland (fallback scenarios)",
    profession: "nursing",
    country: "IE",
    regulator: "NMBI",
    expectIdPrefix: "w-nurs-",
  },
  {
    label: "Medicine · USA",
    profession: "medicine",
    country: "US",
    regulator: "ECFMG",
    expectScenarioCountry: "US",
    expectIdPrefix: "w-med-",
  },
  {
    label: "Medicine · Ireland (fallback scenarios)",
    profession: "medicine",
    country: "IE",
    regulator: "MEDICAL_COUNCIL_IE",
    expectIdPrefix: "w-med-",
  },
  {
    label: "Medicine · UK",
    profession: "medicine",
    country: "UK",
    regulator: "GMC",
    expectScenarioCountry: "UK",
    expectIdPrefix: "w-med-",
  },
  {
    label: "Pharmacy · Ireland",
    profession: "pharmacy",
    country: "IE",
    regulator: "OTHER",
    expectScenarioCountry: "IE",
    expectIdPrefix: "w-pharm-",
  },
  {
    label: "Pharmacy · UK",
    profession: "pharmacy",
    country: "UK",
    regulator: "GPhC",
    expectScenarioCountry: "UK",
    expectIdPrefix: "w-pharm-",
  },
  {
    label: "Physiotherapy · UK",
    profession: "physiotherapy",
    country: "UK",
    regulator: "HCPC",
    expectScenarioCountry: "UK",
    expectIdPrefix: "w-phys-",
  },
  {
    label: "Physiotherapy · USA (fallback)",
    profession: "physiotherapy",
    country: "US",
    regulator: "OTHER",
    expectIdPrefix: "w-phys-",
  },
  {
    label: "Dentistry · Australia",
    profession: "dentistry",
    country: "AU",
    regulator: "AHPRA",
    expectScenarioCountry: "AU",
    expectIdPrefix: "w-dent-",
  },
  {
    label: "Podiatry · Canada (fallback — no CA podiatry scenario yet)",
    profession: "podiatry",
    country: "CA",
    regulator: "OTHER",
    expectIdPrefix: "w-pod-",
  },
  {
    label: "Optometry · USA",
    profession: "optometry",
    country: "US",
    regulator: "OTHER",
    expectScenarioCountry: "US",
    expectIdPrefix: "w-opt-",
  },
];

describe("OET destination countries in onboarding", () => {
  it("offers USA and Ireland regulators for nursing", () => {
    const codes = getRegulatorsForProfession("nursing").map((r) => r.code);
    expect(codes).toContain("NMC");
    expect(codes).toContain("AHPRA");
    expect(codes).toContain("NMBI");
    expect(codes).toContain("US_NURSING");
    expect(codes).toContain("NCNZ");
    expect(codes).toContain("NNAS");
  });

  it("offers USA and Ireland regulators for medicine", () => {
    const codes = getRegulatorsForProfession("medicine").map((r) => r.code);
    expect(codes).toContain("ECFMG");
    expect(codes).toContain("MEDICAL_COUNCIL_IE");
    expect(codes).toContain("GMC");
    expect(codes).toContain("MCNZ");
    expect(codes).toContain("MCC");
  });
});

describe.each(TRAINING_PERSONAS)("Persona A — $label", (persona) => {
  it("training mode hides exam countdown", () => {
    expect(resolveStudyGoal({ studyGoal: "training" })).toBe("training");
    expect(shouldShowExamCountdown({ studyGoal: "training" })).toBe(false);
  });

  it("plan scenario matches profession", () => {
    const scenario = pickPlanScenario(persona.profession, persona.country, 1);
    expect(scenario.profession).toBe(persona.profession);
    expect(scenario.id.startsWith(persona.expectIdPrefix)).toBe(true);
    if (persona.expectScenarioCountry) {
      expect(scenario.meta.countryCode).toBe(persona.expectScenarioCountry);
    }
  });

  it("scenario list is profession-scoped and country-aware", () => {
    const list = scenariosForUser(persona.profession, persona.country);
    expect(list.every((s) => s.profession === persona.profession)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    if (persona.expectScenarioCountry) {
      expect(list[0].meta.countryCode).toBe(persona.expectScenarioCountry);
    }
  });

  it("daily plan routes stay in profession namespace", () => {
    const plan = buildDailyPlan({
      profession: persona.profession,
      targetCountry: persona.country,
      skillMap: {
        userId: "test",
        profession: persona.profession,
        targetRegulator: persona.regulator,
        targetGrades: {
          listening: "B",
          reading: "B",
          writing: "B",
          speaking: "B",
          single_sitting: false,
        },
        priority: ["writing"],
        estimatedWeeksToTarget: 8,
        computedAt: new Date().toISOString(),
        diagnostic: {
          writing: { estBand: "C+", gap: 1, weakTags: ["writing:purpose"] },
          listening: { estBand: "B", gap: 0, weakTags: [] },
          reading: { estBand: "B", gap: 0, weakTags: [] },
          speaking: { estBand: "B", gap: 0, weakTags: [] },
        },
      },
    });

    expect(plan.primaryScenarioId?.startsWith(persona.expectIdPrefix)).toBe(true);
    for (const item of plan.items) {
      if (item.route.includes("w-pharm-001")) {
        expect.fail(`Plan must not hardcode pharmacy for ${persona.label}`);
      }
    }
  });

  it("has Grade B and C samples plus profession lesson examples", () => {
    const strong = primarySampleForProfession(persona.profession);
    const weak = weakSampleForProfession(persona.profession);
    expect(strong?.profession).toBe(persona.profession);
    expect(weak?.profession).toBe(persona.profession);
    expect(strong?.estimatedOverall).toBe("B");
    expect(weak?.estimatedOverall).toBe("C");

    const lesson = getLessonForProfession("w-lesson-purpose", persona.profession);
    expect(lesson?.goodExample).toBeTruthy();
    if (persona.profession !== "pharmacy") {
      expect(lesson?.goodExample).not.toMatch(/amlodipine/i);
    }
  });
});

describe("Persona A — pharmacy lesson examples stay pharmacy-specific", () => {
  it("pharmacy purpose lesson mentions pharmacy context", () => {
    const lesson = getLessonForProfession("w-lesson-purpose", "pharmacy");
    expect(lesson?.goodExample).toMatch(/amlodipine|pharmacy|BP/i);
  });
});
