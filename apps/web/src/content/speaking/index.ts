import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";
import { COUNTRY_LABELS, type ScenarioCountryCode } from "@/content/writing/scenarios/types";
import { filterPoolByDifficulty, pickRotatedItem } from "@/lib/content/rotation";
import { getActiveSpeakingCards } from "@/lib/content/active-content";

import { ALLIED_HEALTH_SPEAKING_CARDS } from "./allied-health";
import { COUNTRY_WAVE2_SPEAKING } from "./country-wave2";
import { ACCENT_SPEAKING_CARDS } from "./accent-wave4";
import { COUNTRY_WAVE3_SPEAKING } from "./country-wave3";
import { MEDICINE_ROLE_CARDS } from "./medicine";
import { NURSING_ROLE_CARDS } from "./nursing";
import { PHARMACY_ROLE_CARDS } from "./pharmacy";
import type { RolePlayCard } from "./types";

export const ROLE_PLAY_CARDS: RolePlayCard[] = [
  ...PHARMACY_ROLE_CARDS,
  ...NURSING_ROLE_CARDS,
  ...MEDICINE_ROLE_CARDS,
  ...ALLIED_HEALTH_SPEAKING_CARDS,
  ...COUNTRY_WAVE2_SPEAKING,
  ...COUNTRY_WAVE3_SPEAKING,
  ...ACCENT_SPEAKING_CARDS,
];

function sortCards(list: RolePlayCard[]): RolePlayCard[] {
  return [...list].sort(
    (a, b) => a.difficulty - b.difficulty || a.cardText.overview.localeCompare(b.cardText.overview),
  );
}

export function getRoleCard(id: string): RolePlayCard | undefined {
  return getActiveSpeakingCards().find((c) => c.id === id);
}

export function roleCardsForProfession(profession: string): RolePlayCard[] {
  return sortCards(getActiveSpeakingCards().filter((c) => c.profession === profession));
}

export function roleCardsForUser(profession?: string, targetCountry?: string): RolePlayCard[] {
  const all = getActiveSpeakingCards();
  if (!profession) return sortCards(all);

  const forProfession = roleCardsForProfession(profession);
  if (forProfession.length === 0) return sortCards(all);

  const country = normalizeSpeakingCountry(targetCountry);
  if (!country) return forProfession;

  const localized = sortCards(forProfession.filter((c) => c.countryCode === country));
  const other = sortCards(forProfession.filter((c) => c.countryCode !== country));
  return [...localized, ...other];
}

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

export function normalizeSpeakingCountry(code?: string): ScenarioCountryCode | undefined {
  if (!code) return undefined;
  return COUNTRY_ALIASES[code.trim().toUpperCase()];
}

/** Pick best role card for today's plan — country-first, difficulty matched, rotation-aware. */
export function pickPlanRoleCard(
  profession?: string,
  targetCountry?: string,
  speakingGap?: number,
  recentAttemptIds: string[] = [],
): RolePlayCard {
  const list = roleCardsForUser(profession, targetCountry);
  const fallback = getRoleCard("s-pharm-001") ?? list[0] ?? getActiveSpeakingCards()[0]!;
  if (list.length === 0) return fallback;

  const gap = speakingGap ?? 1;
  const maxDifficulty = gap >= 2 ? 1 : gap === 1 ? 2 : 3;
  const matched = filterPoolByDifficulty(list, maxDifficulty);
  return pickRotatedItem(matched, recentAttemptIds);
}

export function roleCardRoute(id: string): string {
  return `/speaking/practice/${id}`;
}

export function formatSpeakingTagLabel(tag: string): string {
  const part = tag.includes(":") ? tag.split(":")[1] : tag;
  return part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function roleCardSummary(card: RolePlayCard): string {
  return `${getProfessionLabel(card.profession)} · ${COUNTRY_LABELS[card.countryCode]} · ${card.setting}`;
}

export function roleCardCount(): number {
  return ROLE_PLAY_CARDS.length;
}

export function professionsWithRoleCards(): OetProfession[] {
  return [...new Set(ROLE_PLAY_CARDS.map((c) => c.profession))];
}

export type { ModelDialogueLine, RolePlayCard } from "./types";
