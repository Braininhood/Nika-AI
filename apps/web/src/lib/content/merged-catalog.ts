import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import type { ListeningBlock } from "@/content/listening";
import { normalizeListeningBlock } from "@/content/listening/blocks/registry";
import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import { normalizeReadingBlock } from "@/content/reading/blocks/registry";
import type { ReadingBlock } from "@/content/reading/types";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import type { RolePlayCard } from "@/content/speaking/types";
import type { WritingScenario } from "@/content/writing/scenarios/types";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";
import { isValidWritingScenario } from "@/lib/content/writing-scenario-guard";
import { fetchLearnerCatalog, type ContentSkill } from "@/lib/admin/content-api";

import {
  clearActiveContentCaches,
  setActiveListeningBlocks,
  setActiveReadingBlocks,
  setActiveSpeakingCards,
  setActiveWritingScenarios,
} from "./active-content";

type CatalogResponse = Awaited<ReturnType<typeof fetchLearnerCatalog>>;

const CATALOG_FAIL_COOLDOWN_MS = 5 * 60_000;

let fetchCache: Partial<Record<ContentSkill, CatalogResponse>> = {};
const catalogFailedAt: Partial<Record<ContentSkill, number>> = {};
let warmInFlight: Promise<void> | null = null;
let lastWarmToken: string | null = null;

function mergeById<T extends { id: string }>(
  staticItems: T[],
  catalog: CatalogResponse | null,
  customTypes: string[],
): T[] {
  if (!catalog) return staticItems;
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

function mergeWritingScenariosValidated(
  staticItems: WritingScenario[],
  catalog: CatalogResponse | null,
): WritingScenario[] {
  const merged = mergeById(staticItems, catalog, ["scenario"]);
  const byId = new Map<string, WritingScenario>();

  for (const item of staticItems) {
    if (isValidWritingScenario(item)) byId.set(item.id, item);
  }

  for (const item of merged) {
    if (isValidWritingScenario(item)) {
      byId.set(item.id, item);
    } else if (typeof item === "object" && item && "id" in item) {
      const id = String((item as { id: string }).id);
      const fallback = staticItems.find((s) => s.id === id);
      if (isValidWritingScenario(fallback)) byId.set(id, fallback);
    }
  }

  return [...byId.values()];
}

function mergeListeningBlocksValidated(
  staticItems: ListeningBlock[],
  catalog: CatalogResponse | null,
): ListeningBlock[] {
  const merged = mergeById(staticItems, catalog, ["listening_block", "block"]);
  const byId = new Map<string, ListeningBlock>();

  for (const item of staticItems) {
    byId.set(item.id, normalizeListeningBlock(item));
  }

  for (const item of merged) {
    const normalized = normalizeListeningBlock(item);
    if (normalized.questions.length > 0) {
      byId.set(normalized.id, normalized);
    } else {
      const fallback = staticItems.find((s) => s.id === normalized.id);
      if (fallback) byId.set(fallback.id, normalizeListeningBlock(fallback));
    }
  }

  return [...byId.values()];
}

function mergeReadingBlocksValidated(
  staticItems: ReadingBlock[],
  catalog: CatalogResponse | null,
): ReadingBlock[] {
  const merged = mergeById(staticItems, catalog, ["reading_block", "block"]);
  return merged.map((b) => normalizeReadingBlock(b));
}

async function loadCatalog(
  accessToken: string,
  skill: ContentSkill,
): Promise<CatalogResponse | null> {
  if (fetchCache[skill]) return fetchCache[skill]!;

  const failedAt = catalogFailedAt[skill];
  if (failedAt && Date.now() - failedAt < CATALOG_FAIL_COOLDOWN_MS) {
    return null;
  }

  try {
    fetchCache[skill] = await fetchLearnerCatalog(accessToken, skill);
    return fetchCache[skill]!;
  } catch {
    catalogFailedAt[skill] = Date.now();
    return null;
  }
}

export async function mergedWritingScenarios(accessToken?: string): Promise<WritingScenario[]> {
  if (!accessToken) return WRITING_SCENARIOS.filter(isValidWritingScenario);
  const catalog = await loadCatalog(accessToken, "writing");
  return mergeWritingScenariosValidated(WRITING_SCENARIOS, catalog);
}

export async function mergedReadingBlocks(accessToken?: string): Promise<ReadingBlock[]> {
  if (!accessToken) return ALL_READING_BLOCKS.map(normalizeReadingBlock);
  const catalog = await loadCatalog(accessToken, "reading");
  return mergeReadingBlocksValidated(ALL_READING_BLOCKS, catalog);
}

export async function mergedListeningBlocks(accessToken?: string): Promise<ListeningBlock[]> {
  if (!accessToken) return ALL_LISTENING_BLOCKS.map(normalizeListeningBlock);
  const catalog = await loadCatalog(accessToken, "listening");
  return mergeListeningBlocksValidated(ALL_LISTENING_BLOCKS, catalog);
}

export async function mergedSpeakingCards(accessToken?: string): Promise<RolePlayCard[]> {
  if (!accessToken) return ROLE_PLAY_CARDS;
  const catalog = await loadCatalog(accessToken, "speaking");
  return mergeById(ROLE_PLAY_CARDS, catalog, ["role_card"]);
}

/** Load all four skill catalogs into active-content caches (learners). */
export async function warmContentCatalog(accessToken?: string): Promise<void> {
  if (!accessToken) {
    clearActiveContentCaches();
    lastWarmToken = null;
    return;
  }

  if (warmInFlight && lastWarmToken === accessToken) {
    return warmInFlight;
  }

  lastWarmToken = accessToken;
  warmInFlight = (async () => {
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
  })().finally(() => {
    warmInFlight = null;
  });

  return warmInFlight;
}

export function clearContentCatalogCache(): void {
  fetchCache = {};
  for (const key of Object.keys(catalogFailedAt) as ContentSkill[]) {
    delete catalogFailedAt[key];
  }
  lastWarmToken = null;
  clearActiveContentCaches();
}
