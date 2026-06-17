import {
  blockRoute,
  blockSummary,
  formatListeningTagLabel,
  pickPlanListeningBlock,
} from "@/content/listening";
import {
  recommendedListeningPart,
  recommendedListeningStage,
} from "@/lib/quiz/engine";
import type { SkillMap } from "@/lib/domain/types";

export interface ListeningRecommendation {
  id: string;
  kind: "practice" | "exam" | "import";
  title: string;
  description: string;
  route: string;
  durationMinutes: number;
  rationale?: string;
}

export function listeningStageLabel(skillMap: SkillMap | undefined): string {
  const stage = recommendedListeningStage(skillMap);
  if (stage === "learn") return "Foundation";
  if (stage === "practice") return "Building";
  return "Exam timing";
}

export function primaryListeningRecommendation(
  skillMap: SkillMap | undefined,
  profession?: string,
  targetCountry?: string,
): ListeningRecommendation {
  const listening = skillMap?.diagnostic.listening;
  const weakTags = listening?.weakTags?.length
    ? listening.weakTags
    : ["listening:part-b-gist"];
  const topTag = weakTags[0]!;
  const part = recommendedListeningPart(skillMap);
  const gap = listening?.gap;
  const block = pickPlanListeningBlock(profession, targetCountry, gap, part);
  const stage = recommendedListeningStage(skillMap);
  const locale = blockSummary(block);

  if (stage === "learn") {
    return {
      id: "listening-part-a",
      kind: "practice",
      title: `Listening Part A — ${block.title}`,
      description: `Note-completion practice with offline audio. ${locale}.`,
      route: blockRoute("A", pickPlanListeningBlock(profession, targetCountry, gap, "A").id),
      durationMinutes: 12,
      rationale: `Nika prioritises ${formatListeningTagLabel(topTag)} — start with Part A detail and spelling.`,
    };
  }

  if (stage === "practice") {
    return {
      id: `listening-part-${part.toLowerCase()}`,
      kind: "practice",
      title: `Listening Part ${part} — ${block.title}`,
      description: `${locale}. Timed practice — plan updates when you submit.`,
      route: blockRoute(part, block.id),
      durationMinutes: block.durationMinutes,
    };
  }

  return {
    id: "listening-exam",
    kind: "exam",
    title: "Listening exam block — Parts B & C flow",
    description: "Single-question Part B flow plus Part C MCQ set with exam-style audio controls.",
    route: "/listening/exam",
    durationMinutes: 25,
  };
}
