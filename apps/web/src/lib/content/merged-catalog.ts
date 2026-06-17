import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import type { ListeningBlock } from "@/content/listening";
import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import type { ReadingBlock } from "@/content/reading/types";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import type { RolePlayCard } from "@/content/speaking/types";
import type { WritingScenario } from "@/content/writing/scenarios/types";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";
import { fetchLearnerCatalog, type ContentSkill } from "@/lib/admin/content-api";

import {
  clearActiveContentCaches,
  setActiveListeningBlocks,
  setActiveReadingBlocks,
  setActiveSpeakingCards,
  setActiveWritingScenarios,
} from "./active-content";

type CatalogResponse = Awaited<ReturnType<typeof fetchLearnerCatalog>>;

let fetchCache: Partial<Record<ContentSkill, CatalogResponse>> = {};

function mergeById<T extends { id: string }>(
  staticItems: T[],
  catalog: CatalogResponse,
  customTypes: string[],
): T[] {
  const disabled = new Set(catalog.disabledIds);
  const fromBundled = catalog.bundled
    .filter((b) => !disabled.has(b.externalId))
    .map((b) => b.payload as unknown as T);
  const fromCustom = catalog.custom
    .filter((c) => c.isActive && customTypes.includes(c.itemType))
    .map((c) => c.payload as unknown as T);
  const ids = new Set([...fromBundled, ...fromCustom].map((i) => i.id));
  const fromStatic = staticItems.filter((s) => !disabled.has(s.id) && !ids.has(s.id));
  return [...fromBundled, ...fromCustom, ...fromStatic];
}

async function loadCatalog(accessToken: string, skill: ContentSkill): Promise<CatalogResponse> {
  if (!fetchCache[skill]) {
    fetchCache[skill] = await fetchLearnerCatalog(accessToken, skill);
  }
  return fetchCache[skill]!;
}

export async function mergedWritingScenarios(accessToken?: string): Promise<WritingScenario[]> {
  if (!accessToken) return WRITING_SCENARIOS;
  try {
    const catalog = await loadCatalog(accessToken, "writing");
    return mergeById(WRITING_SCENARIOS, catalog, ["scenario"]);
  } catch {
    return WRITING_SCENARIOS;
  }
}

export async function mergedReadingBlocks(accessToken?: string): Promise<ReadingBlock[]> {
  if (!accessToken) return ALL_READING_BLOCKS;
  try {
    const catalog = await loadCatalog(accessToken, "reading");
    return mergeById(ALL_READING_BLOCKS, catalog, ["reading_block", "block"]);
  } catch {
    return ALL_READING_BLOCKS;
  }
}

export async function mergedListeningBlocks(accessToken?: string): Promise<ListeningBlock[]> {
  if (!accessToken) return ALL_LISTENING_BLOCKS;
  try {
    const catalog = await loadCatalog(accessToken, "listening");
    return mergeById(ALL_LISTENING_BLOCKS, catalog, ["listening_block", "block"]);
  } catch {
    return ALL_LISTENING_BLOCKS;
  }
}

export async function mergedSpeakingCards(accessToken?: string): Promise<RolePlayCard[]> {
  if (!accessToken) return ROLE_PLAY_CARDS;
  try {
    const catalog = await loadCatalog(accessToken, "speaking");
    return mergeById(ROLE_PLAY_CARDS, catalog, ["role_card"]);
  } catch {
    return ROLE_PLAY_CARDS;
  }
}

/** Load all four skill catalogs into active-content caches (learners). */
export async function warmContentCatalog(accessToken?: string): Promise<void> {
  if (!accessToken) {
    clearActiveContentCaches();
    return;
  }
  try {
    const [writing, reading, listening, speaking] = await Promise.all([
      mergedWritingScenarios(accessToken),
      mergedReadingBlocks(accessToken),
      mergedListeningBlocks(accessToken),
      mergedSpeakingCards(accessToken),
    ]);
    setActiveWritingScenarios(writing);
    setActiveReadingBlocks(reading);
    setActiveListeningBlocks(listening);
    setActiveSpeakingCards(speaking);
  } catch {
    clearActiveContentCaches();
  }
}

export function clearContentCatalogCache(): void {
  fetchCache = {};
  clearActiveContentCaches();
}
