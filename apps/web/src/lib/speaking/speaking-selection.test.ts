import { describe, expect, it } from "vitest";

import { PROFESSIONS } from "@/lib/domain/professions";
import {
  pickPlanRoleCard,
  roleCardCount,
  roleCardsForProfession,
  roleCardsForUser,
  professionsWithRoleCards,
} from "@/content/speaking";

describe("speaking role card registry", () => {
  it("has at least 6 cards per profession (84 total after wave4)", () => {
    expect(roleCardCount()).toBeGreaterThanOrEqual(84);
    for (const { code } of PROFESSIONS) {
      const cards = roleCardsForProfession(code);
      expect(cards.length, `${code} should have ≥2 role cards`).toBeGreaterThanOrEqual(2);
    }
  });

  it("covers all 12 OET professions", () => {
    expect(professionsWithRoleCards().length).toBe(12);
  });

  it("pickPlanRoleCard respects profession and gap", () => {
    const pharmacyEasy = pickPlanRoleCard("pharmacy", "AU", 2);
    expect(pharmacyEasy.profession).toBe("pharmacy");
    expect(pharmacyEasy.countryCode).toBe("AU");

    const vetPractice = pickPlanRoleCard("veterinary_science", "NZ", 1);
    expect(vetPractice.profession).toBe("veterinary_science");
    expect(vetPractice.difficulty).toBeLessThanOrEqual(2);
  });

  it("roleCardsForUser prefers target country", () => {
    const auFirst = roleCardsForUser("pharmacy", "AU");
    expect(auFirst[0]?.countryCode).toBe("AU");

    const ieFirst = roleCardsForUser("nursing", "IE");
    expect(ieFirst.some((c) => c.countryCode === "IE")).toBe(true);
  });
});
