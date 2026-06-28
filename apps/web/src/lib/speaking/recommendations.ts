import {
  formatSpeakingTagLabel,
  pickPlanRoleCard,
  roleCardRoute,
  roleCardSummary,
} from "@/content/speaking";
import { recentAttemptScenarioIds } from "@/lib/content/attempt-history";
import { recommendedSpeakingStage } from "@/lib/quiz/engine";
import type { SkillMap } from "@/lib/domain/types";

export interface SpeakingRecommendation {
  id: string;
  kind: "learn" | "practice" | "exam";
  title: string;
  description: string;
  route: string;
  durationMinutes: number;
  rationale?: string;
}

export function speakingStageLabel(skillMap: SkillMap | undefined): string {
  const stage = recommendedSpeakingStage(skillMap);
  if (stage === "learn") return "Foundation";
  if (stage === "practice") return "Building";
  return "Exam timing";
}

export async function primarySpeakingRecommendation(
  skillMap: SkillMap | undefined,
  profession?: string,
  targetCountry?: string,
): Promise<SpeakingRecommendation> {
  const speaking = skillMap?.diagnostic.speaking;
  const weakTags = speaking?.weakTags?.length
    ? speaking.weakTags
    : ["speaking:ice-expectations"];
  const topTag = weakTags[0]!;
  const gap = speaking?.gap;
  const recentIds = await recentAttemptScenarioIds("speaking");
  const card = pickPlanRoleCard(profession, targetCountry, gap, recentIds);
  const stage = recommendedSpeakingStage(skillMap);
  const locale = roleCardSummary(card);

  if (stage === "learn") {
    return {
      id: "speaking-learn",
      kind: "learn",
      title: `Study role card — ${card.cardText.overview.slice(0, 50)}…`,
      description: `Review model dialogue and clinical communication markers. ${locale}.`,
      route: roleCardRoute(card.id),
      durationMinutes: 15,
      rationale: `Nika prioritises ${formatSpeakingTagLabel(topTag)} — start with structure and ICE before recording.`,
    };
  }

  if (stage === "practice") {
    return {
      id: card.id,
      kind: "practice",
      title: `Role-play — ${card.setting}`,
      description: `3-min prep → 5-min recording → checklist + AI feedback. ${locale}.`,
      route: roleCardRoute(card.id),
      durationMinutes: card.prepMinutes + card.durationMinutes + 5,
    };
  }

  return {
    id: "speaking-exam",
    kind: "exam",
    title: "Exam simulation — dual role-play flow",
    description: "Two consecutive role-plays with prep timers — mirrors OET speaking format.",
    route: "/speaking/exam",
    durationMinutes: 20,
  };
}
