import {
  blockRoute,
  blockSummary,
  formatReadingTagLabel,
  pickPlanReadingBlock,
} from "@/content/reading";
import {
  recommendedReadingPart,
  recommendedReadingStage,
} from "@/lib/quiz/engine";
import type { SkillMap } from "@/lib/domain/types";

export interface ReadingRecommendation {
  id: string;
  kind: "quiz" | "practice" | "exam";
  title: string;
  description: string;
  route: string;
  durationMinutes: number;
  rationale?: string;
}

export function readingStageLabel(skillMap: SkillMap | undefined): string {
  const stage = recommendedReadingStage(skillMap);
  if (stage === "learn") return "Foundation";
  if (stage === "practice") return "Building";
  return "Exam timing";
}

export function primaryReadingRecommendation(
  skillMap: SkillMap | undefined,
  profession?: string,
  targetCountry?: string,
): ReadingRecommendation {
  const reading = skillMap?.diagnostic.reading;
  const weakTags = reading?.weakTags?.length ? reading.weakTags : ["reading:part-b-gist"];
  const topTag = weakTags[0]!;
  const part = recommendedReadingPart(skillMap);
  const gap = reading?.gap;
  const block = pickPlanReadingBlock(profession, targetCountry, gap, part);
  const stage = recommendedReadingStage(skillMap);
  const locale = blockSummary(block);

  if (stage === "learn") {
    return {
      id: "reading-quiz",
      kind: "quiz",
      title: `Adaptive reading quiz — ${formatReadingTagLabel(topTag)}`,
      description: `Five questions matched to your weak tags and ${locale}. Wrong answers become flashcards.`,
      route: "/reading/quiz",
      durationMinutes: 10,
      rationale: `Nika prioritises ${formatReadingTagLabel(topTag)} for your destination and profession.`,
    };
  }

  if (stage === "practice") {
    return {
      id: `reading-part-${part.toLowerCase()}`,
      kind: "practice",
      title: `Reading Part ${part} — ${block.title}`,
      description: `${locale}. Timed practice — plan updates when you submit.`,
      route: blockRoute(part, block.id),
      durationMinutes: block.durationMinutes,
    };
  }

  return {
    id: "reading-exam",
    kind: "exam",
    title: `Reading exam block — Parts B & C timing`,
    description: "45-minute combined timer with locale-matched passages when available.",
    route: "/reading/exam",
    durationMinutes: 45,
  };
}
