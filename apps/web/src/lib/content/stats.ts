import { ALL_LISTENING_BLOCKS, listeningBlockCount, totalListeningQuestionCount } from "@/content/listening";
import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import { readingBlockCount, totalReadingQuestionCount } from "@/content/reading";
import { ROLE_PLAY_CARDS } from "@/content/speaking";
import { WRITING_SCENARIOS } from "@/content/writing/scenarios";

export interface SkillContentStats {
  skill: "writing" | "reading" | "listening" | "speaking";
  label: string;
  items: number;
  questions?: number;
  adminPath: string;
}

export function contentStatsBySkill(): SkillContentStats[] {
  return [
    {
      skill: "writing",
      label: "Writing scenarios",
      items: WRITING_SCENARIOS.length,
      adminPath: "/admin/scenarios",
    },
    {
      skill: "reading",
      label: "Reading blocks",
      items: readingBlockCount(),
      questions: totalReadingQuestionCount(),
      adminPath: "/admin/content/reading",
    },
    {
      skill: "listening",
      label: "Listening blocks",
      items: listeningBlockCount(),
      questions: totalListeningQuestionCount(),
      adminPath: "/admin/content/listening",
    },
    {
      skill: "speaking",
      label: "Speaking role cards",
      items: ROLE_PLAY_CARDS.length,
      adminPath: "/admin/content/speaking",
    },
  ];
}

export function readingBlocksByPart(): Record<"A" | "B" | "C", number> {
  return {
    A: ALL_READING_BLOCKS.filter((b) => b.part === "A").length,
    B: ALL_READING_BLOCKS.filter((b) => b.part === "B").length,
    C: ALL_READING_BLOCKS.filter((b) => b.part === "C").length,
  };
}

export function listeningBlocksByPart(): Record<"A" | "B" | "C", number> {
  return {
    A: ALL_LISTENING_BLOCKS.filter((b) => b.part === "A").length,
    B: ALL_LISTENING_BLOCKS.filter((b) => b.part === "B").length,
    C: ALL_LISTENING_BLOCKS.filter((b) => b.part === "C").length,
  };
}
