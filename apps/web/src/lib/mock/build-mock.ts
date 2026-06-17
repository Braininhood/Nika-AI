import { pickPlanListeningBlock } from "@/content/listening";
import { pickPlanReadingBlock } from "@/content/reading";
import { pickPlanRoleCard } from "@/content/speaking";
import { pickPlanScenario } from "@/content/writing/scenarios";
import type { OetSkill, SkillMap, UserProfile } from "@/lib/domain/types";

export interface MockSection {
  skill: OetSkill;
  title: string;
  route: string;
  durationMinutes: number;
  instructions: string;
}

export interface FullMockBlueprint {
  id: string;
  sections: MockSection[];
  totalMinutes: number;
  regulatorLabel: string;
}

const MOCK_SKILL_ORDER: OetSkill[] = ["listening", "reading", "writing", "speaking"];

export function buildFullMockBlueprint(
  profile: UserProfile,
  skillMap: SkillMap,
): FullMockBlueprint {
  const profession = profile.profession;
  const country = profile.targetCountry;
  const listening = pickPlanListeningBlock(profession, country, skillMap.diagnostic.listening.gap, "B");
  const reading = pickPlanReadingBlock(profession, country, skillMap.diagnostic.reading.gap, "B");
  const writing = pickPlanScenario(profession, country, skillMap.diagnostic.writing.gap);
  const speaking = pickPlanRoleCard(profession, country, skillMap.diagnostic.speaking.gap);

  const sections: MockSection[] = [
    {
      skill: "listening",
      title: "Listening — Parts A, B & C",
      route: `/listening/exam?mock=1`,
      durationMinutes: 40,
      instructions: "Complete all listening parts under exam timing. No pausing between sections.",
    },
    {
      skill: "reading",
      title: `Reading — ${reading.title}`,
      route: `/reading/exam?mock=1`,
      durationMinutes: 60,
      instructions: "Part A (15 min lock) then Parts B & C (45 min). Strict timers apply.",
    },
    {
      skill: "writing",
      title: writing.meta.title,
      route: `/writing/exam/${writing.id}?mock=1`,
      durationMinutes: 45,
      instructions: "5 min reading case notes, then 40 min writing. No AI hints until submit.",
    },
    {
      skill: "speaking",
      title: speaking.cardText.overview.slice(0, 60),
      route: `/speaking/${speaking.id}?mock=1`,
      durationMinutes: 20,
      instructions: "Dual role-play: prep timer, record both roles, submit checklist.",
    },
  ];

  return {
    id: crypto.randomUUID(),
    sections,
    totalMinutes: sections.reduce((s, x) => s + x.durationMinutes, 0),
    regulatorLabel: profile.targetRegulator ?? "your regulator",
  };
}

export { MOCK_SKILL_ORDER };
