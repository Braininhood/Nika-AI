import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import { ALL_READING_BLOCKS, normalizeReadingBlock } from "@/content/reading/blocks/registry";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import type { ListeningBlock } from "@/content/listening";
import { normalizeListeningBlock } from "@/content/listening/blocks/registry";
import type { ReadingBlock } from "@/content/reading/types";
import type { RolePlayCard } from "@/content/speaking/types";
import type { WritingScenario } from "@/content/writing/scenarios/types";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";

const caches: {
  writing: WritingScenario[] | null;
  reading: ReadingBlock[] | null;
  listening: ListeningBlock[] | null;
  speaking: RolePlayCard[] | null;
} = {
  writing: null,
  reading: null,
  listening: null,
  speaking: null,
};

export function setActiveWritingScenarios(list: WritingScenario[]): void {
  caches.writing = list;
}

export function setActiveReadingBlocks(list: ReadingBlock[]): void {
  caches.reading = list.map((b) => normalizeReadingBlock(b));
}

export function setActiveListeningBlocks(list: ListeningBlock[]): void {
  caches.listening = list.map((b) => normalizeListeningBlock(b));
}

export function setActiveSpeakingCards(list: RolePlayCard[]): void {
  caches.speaking = list;
}

export function clearActiveContentCaches(): void {
  caches.writing = null;
  caches.reading = null;
  caches.listening = null;
  caches.speaking = null;
}

export function getActiveWritingScenarios(): WritingScenario[] {
  return caches.writing ?? WRITING_SCENARIOS;
}

export function getActiveReadingBlocks(): ReadingBlock[] {
  return caches.reading ?? ALL_READING_BLOCKS;
}

export function getActiveListeningBlocks(): ListeningBlock[] {
  return caches.listening ?? ALL_LISTENING_BLOCKS;
}

export function getActiveSpeakingCards(): RolePlayCard[] {
  return caches.speaking ?? ROLE_PLAY_CARDS;
}
