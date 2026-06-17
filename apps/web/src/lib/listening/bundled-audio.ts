import type { ListeningAccent, ListeningBlock, ListeningPart } from "@/content/listening/types";

/** Base tone (Hz) per accent — distinct demo placeholders until studio recordings ship. */
const ACCENT_BASE_FREQUENCY: Record<ListeningAccent, number> = {
  UK: 330,
  AU: 360,
  US: 400,
  IE: 340,
  NZ: 370,
  CA: 390,
  mixed: 420,
};

const PART_FREQUENCY_OFFSET: Record<ListeningPart, number> = {
  A: 0,
  B: 20,
  C: 40,
};

export function bundledAudioPathForAccentPart(
  accent: ListeningAccent,
  part: ListeningPart,
): string {
  return `audio/accent-${accent.toLowerCase()}-part-${part.toLowerCase()}.wav`;
}

/** Resolve pack-relative path — explicit block path wins, else accent × part default. */
export function bundledAudioPathForBlock(block: Pick<ListeningBlock, "bundledAudioPath" | "accent" | "part">): string {
  return block.bundledAudioPath ?? bundledAudioPathForAccentPart(block.accent, block.part);
}

export function demoFrequencyForBlock(block: Pick<ListeningBlock, "accent" | "part">): number {
  const base = ACCENT_BASE_FREQUENCY[block.accent] ?? 400;
  return base + (PART_FREQUENCY_OFFSET[block.part] ?? 0);
}
