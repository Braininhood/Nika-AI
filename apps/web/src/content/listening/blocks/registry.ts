import type { ListeningAccent, ListeningBlock, ListeningPart } from "../types";
import { ACCENT_LISTENING_BLOCKS } from "./accents";
import { ACCENT_LISTENING_BLOCKS_WAVE3 } from "./accents-wave3";
import { ACCENT_LISTENING_BLOCKS_WAVE4 } from "./accents-wave4";
import { UNIVERSAL_LISTENING_BLOCKS } from "./universal";
import { filterPoolByDifficulty, pickRotatedItem } from "@/lib/content/rotation";
import { getActiveListeningBlocks } from "@/lib/content/active-content";

export const ALL_LISTENING_BLOCKS: ListeningBlock[] = [
  ...UNIVERSAL_LISTENING_BLOCKS,
  ...ACCENT_LISTENING_BLOCKS,
  ...ACCENT_LISTENING_BLOCKS_WAVE3,
  ...ACCENT_LISTENING_BLOCKS_WAVE4,
];

function sortBlocks(list: ListeningBlock[]): ListeningBlock[] {
  return [...list].sort(
    (a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title),
  );
}

export function getListeningBlock(id: string): ListeningBlock | undefined {
  const block = getActiveListeningBlocks().find((b) => b.id === id);
  return block ? normalizeListeningBlock(block) : undefined;
}

/** Ensure catalog merges never drop embedded questions, note fields, or audio paths. */
export function normalizeListeningBlock(block: ListeningBlock): ListeningBlock {
  const staticBlock = ALL_LISTENING_BLOCKS.find((b) => b.id === block.id);
  const staticQuestions = staticBlock?.questions ?? [];
  const mergedQuestions = block.questions?.length ? block.questions : staticQuestions;

  return {
    ...staticBlock,
    ...block,
    questions: mergedQuestions.length ? mergedQuestions : [],
    noteFields: block.noteFields?.length
      ? block.noteFields
      : (staticBlock?.noteFields ?? []),
    noteTemplate: block.noteTemplate ?? staticBlock?.noteTemplate,
    transcript: block.transcript ?? staticBlock?.transcript ?? "",
    bundledAudioPath: block.bundledAudioPath ?? staticBlock?.bundledAudioPath,
    durationMinutes: block.durationMinutes ?? staticBlock?.durationMinutes ?? 12,
    difficulty: block.difficulty ?? staticBlock?.difficulty ?? 2,
    tags: block.tags?.length ? block.tags : (staticBlock?.tags ?? []),
    accent: block.accent ?? staticBlock?.accent ?? "UK",
  };
}

export function listeningQuestionCount(block: ListeningBlock): number {
  return normalizeListeningBlock(block).questions.length;
}

export function blocksForPart(part: ListeningPart): ListeningBlock[] {
  return sortBlocks(
    getActiveListeningBlocks()
      .filter((block) => block.part === part)
      .map(normalizeListeningBlock),
  );
}

/** Accent rotation — spread UK · AU · US · IE · NZ · CA across practice. */
export function blocksForUser(_profession?: string, _targetCountry?: string): ListeningBlock[] {
  return sortBlocks(getActiveListeningBlocks().map(normalizeListeningBlock));
}

export function blocksForAccent(accent: ListeningAccent): ListeningBlock[] {
  return sortBlocks(
    getActiveListeningBlocks().filter((b) => b.accent === accent || b.accent === "mixed"),
  );
}

export function accentsInCatalog(): ListeningAccent[] {
  const set = new Set<ListeningAccent>();
  for (const b of getActiveListeningBlocks()) {
    if (b.accent) set.add(b.accent);
  }
  return [...set].sort();
}

export function blocksForUserPart(part: ListeningPart): ListeningBlock[] {
  return blocksForUser().filter((b) => b.part === part).map(normalizeListeningBlock);
}

export function pickPlanListeningBlock(
  _profession?: string,
  _targetCountry?: string,
  listeningGap?: number,
  part?: ListeningPart,
  recentAttemptIds: string[] = [],
): ListeningBlock {
  const list = part ? blocksForUserPart(part) : blocksForUser();
  const fallback = getListeningBlock("l-part-b-001") ?? getActiveListeningBlocks()[0]!;
  if (list.length === 0) return fallback;

  const gap = listeningGap ?? 1;
  const maxDifficulty = gap >= 2 ? 1 : gap === 1 ? 2 : 3;
  const matched = filterPoolByDifficulty(list, maxDifficulty);
  return pickRotatedItem(matched, recentAttemptIds);
}

export function blockRoute(part: ListeningPart, blockId: string): string {
  return `/listening/part-${part.toLowerCase()}/${blockId}`;
}

export function blockSummary(block: ListeningBlock): string {
  const accent =
    block.accent === "mixed"
      ? "Mixed accents"
      : `${block.accent ?? "UK"} accent`;
  const questionCount = listeningQuestionCount(block);
  return `${accent} · ${questionCount} Q`;
}

export function formatListeningTagLabel(tag: string): string {
  const map: Record<string, string> = {
    "listening:part-a": "Part A note completion",
    "listening:part-a-detail": "Part A specific detail",
    "listening:part-b": "Part B workplace extracts",
    "listening:part-b-gist": "Part B gist & purpose",
    "listening:part-c": "Part C extended speech",
    "listening:part-c-inference": "Part C inference & attitude",
    "listening:spelling": "Spelling & drug names",
  };
  return map[tag] ?? tag.replace("listening:", "").replace(/-/g, " ");
}

export function partFromWeakTag(tag: string): ListeningPart | undefined {
  if (tag.includes("part-a")) return "A";
  if (tag.includes("part-b")) return "B";
  if (tag.includes("part-c")) return "C";
  return undefined;
}

export function listeningBlockCount(): number {
  return ALL_LISTENING_BLOCKS.length;
}

export function totalListeningQuestionCount(): number {
  return getActiveListeningBlocks().reduce(
    (sum, b) => sum + listeningQuestionCount(b),
    0,
  );
}
