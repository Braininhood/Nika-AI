import type { OetProfession } from "@/lib/domain/types";
import { getProfessionLabel } from "@/lib/domain/professions";

import { COUNTRY_READING_BLOCKS } from "./countries";
import { COUNTRY_READING_BLOCKS_WAVE2 } from "./countries-wave2";
import { COUNTRY_READING_PART_C_WAVE2 } from "./part-c-countries-wave2";
import { PROFESSION_READING_BLOCKS, professionPartABlock, professionPartABlocksAll } from "./professions";
import { PROFESSION_READING_BLOCKS_WAVE2 } from "./professions-wave2";
import { UNIVERSAL_READING_BLOCKS } from "./universal";
import type { ReadingBlock, ReadingCountryCode, ReadingPart } from "../types";
import { READING_COUNTRY_LABELS } from "../types";
import { filterPoolByDifficulty, pickRotatedItem } from "@/lib/content/rotation";
import { getActiveReadingBlocks } from "@/lib/content/active-content";

export const ALL_READING_BLOCKS: ReadingBlock[] = [
  ...UNIVERSAL_READING_BLOCKS,
  ...COUNTRY_READING_BLOCKS,
  ...COUNTRY_READING_BLOCKS_WAVE2,
  ...COUNTRY_READING_PART_C_WAVE2,
  ...PROFESSION_READING_BLOCKS,
  ...PROFESSION_READING_BLOCKS_WAVE2,
];

const COUNTRY_ALIASES: Record<string, ReadingCountryCode> = {
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

export function normalizeReadingCountry(code?: string): ReadingCountryCode | undefined {
  if (!code) return undefined;
  return COUNTRY_ALIASES[code.trim().toUpperCase()];
}

function sortBlocks(list: ReadingBlock[]): ReadingBlock[] {
  return [...list].sort(
    (a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title),
  );
}

function matchesProfession(block: ReadingBlock, profession?: string): boolean {
  if (block.profession === "all") return true;
  if (!profession) return true;
  return block.profession === profession;
}

export function getReadingBlock(id: string): ReadingBlock | undefined {
  return getActiveReadingBlocks().find((block) => block.id === id);
}

export function blocksForPart(part: ReadingPart): ReadingBlock[] {
  return sortBlocks(getActiveReadingBlocks().filter((block) => block.part === part));
}

/** Country-first, profession-aware ordering — mirrors writing `scenariosForUser`. */
export function blocksForUser(profession?: string, targetCountry?: string): ReadingBlock[] {
  const country = normalizeReadingCountry(targetCountry);
  const eligible = getActiveReadingBlocks().filter((b) => matchesProfession(b, profession));

  if (!country) return sortBlocks(eligible);

  const countryMatch = sortBlocks(eligible.filter((b) => b.countryCode === country));
  const universal = sortBlocks(eligible.filter((b) => b.countryCode === "ALL"));
  const otherLocales = sortBlocks(
    eligible.filter((b) => b.countryCode !== country && b.countryCode !== "ALL"),
  );

  return [...countryMatch, ...universal, ...otherLocales];
}

export function blocksForUserPart(
  part: ReadingPart,
  profession?: string,
  targetCountry?: string,
): ReadingBlock[] {
  return blocksForUser(profession, targetCountry).filter((b) => b.part === part);
}

export function pickPlanReadingBlock(
  profession?: string,
  targetCountry?: string,
  readingGap?: number,
  part?: ReadingPart,
  recentAttemptIds: string[] = [],
): ReadingBlock {
  const list = part
    ? blocksForUserPart(part, profession, targetCountry)
    : blocksForUser(profession, targetCountry);

  const fallback =
    getReadingBlock("r-part-b-001") ??
    blocksForPart("B")[0] ??
    getActiveReadingBlocks()[0]!;

  if (list.length === 0) return fallback;

  const gap = readingGap ?? 1;
  const maxDifficulty = gap >= 2 ? 1 : gap === 1 ? 2 : 3;

  if (part === "A" && profession) {
    const profBlocks = professionPartABlocksAll(profession as OetProfession);
    if (profBlocks.length > 0) {
      const matched = filterPoolByDifficulty(profBlocks, maxDifficulty);
      return pickRotatedItem(matched, recentAttemptIds);
    }
    const profBlock = professionPartABlock(profession as OetProfession);
    if (profBlock) return profBlock;
  }

  const matched = filterPoolByDifficulty(list, maxDifficulty);
  return pickRotatedItem(matched.length ? matched : list, recentAttemptIds);
}

/** @deprecated Use pickPlanReadingBlock */
export function primaryBlockForPart(part: ReadingPart): ReadingBlock {
  return pickPlanReadingBlock(undefined, undefined, 1, part);
}

export function formatReadingTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    "reading:part-a": "Part A speed",
    "reading:part-a-speed": "Part A speed",
    "reading:part-b": "Part B gist",
    "reading:part-b-gist": "Part B gist",
    "reading:part-c": "Part C inference",
    "reading:part-c-inference": "Part C inference",
    "reading:skim": "Skimming",
    "reading:scan": "Scanning",
    "reading:inference": "Inference",
    "reading:vocabulary": "Vocabulary",
  };
  return labels[tag] ?? tag.replace(/^reading:/, "").replace(/-/g, " ");
}

export function partFromWeakTag(tag: string): ReadingPart | null {
  if (tag.includes("part-a")) return "A";
  if (tag.includes("part-b")) return "B";
  if (tag.includes("part-c")) return "C";
  return null;
}

export function blockRoute(part: ReadingPart, blockId: string): string {
  const segment = part === "A" ? "part-a" : part === "B" ? "part-b" : "part-c";
  return `/reading/${segment}/${blockId}`;
}

export function readingCountryLabel(code: ReadingCountryCode | "ALL"): string {
  if (code === "ALL") return "Universal";
  return READING_COUNTRY_LABELS[code];
}

export function blockSummary(block: ReadingBlock): string {
  const prof =
    block.profession === "all"
      ? "All professions"
      : getProfessionLabel(block.profession);
  return `${prof} · ${readingCountryLabel(block.countryCode)}`;
}

export function professionsWithReadingBlocks(): OetProfession[] {
  return PROFESSION_READING_BLOCKS.map((b) => b.profession).filter(
    (p): p is OetProfession => p !== "all",
  );
}

export const PART_A_BLOCKS = ALL_READING_BLOCKS.filter((b) => b.part === "A");
export const PART_B_BLOCKS = ALL_READING_BLOCKS.filter((b) => b.part === "B");
export const PART_C_BLOCKS = ALL_READING_BLOCKS.filter((b) => b.part === "C");
