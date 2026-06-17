import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";
import type { ContentSkill } from "@/lib/admin/content-api";

export interface BundledContentRef {
  externalId: string;
  title: string;
}

/** Static TS catalog entries for admin enable/disable toggles. */
export function bundledStaticItems(skill: ContentSkill): BundledContentRef[] {
  switch (skill) {
    case "writing":
      return WRITING_SCENARIOS.map((s) => ({
        externalId: s.id,
        title: s.meta.title,
      }));
    case "reading":
      return ALL_READING_BLOCKS.map((b) => ({
        externalId: b.id,
        title: b.title,
      }));
    case "listening":
      return ALL_LISTENING_BLOCKS.map((b) => ({
        externalId: b.id,
        title: b.title,
      }));
    case "speaking":
      return ROLE_PLAY_CARDS.map((c) => ({
        externalId: c.id,
        title: c.cardText.overview,
      }));
    default:
      return [];
  }
}
