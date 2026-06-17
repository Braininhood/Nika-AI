import type { SkillMap, UserProfile } from "@/lib/domain/types";
import { getRegulator, formatTargetGradesSummary } from "@/lib/domain/requirements";
import { getProfessionLabel } from "@/lib/domain/professions";

export interface NikaUserContext {
  profession?: string;
  professionLabel?: string;
  regulator?: string;
  regulatorLabel?: string;
  country?: string;
  nativeLanguage?: string;
  targetGradesSummary?: string;
  skillMap?: SkillMap;
  prioritySkill?: string;
  weakTags: string[];
}

export function buildNikaContext(profile: UserProfile | null): NikaUserContext {
  const regulator = profile?.targetRegulator;
  const reg = regulator ? getRegulator(regulator) : undefined;

  const skillMap = profile?.skillMap;
  const priority = skillMap?.priority?.[0];
  const weakTags: string[] = [];

  if (skillMap && priority) {
    const diag = skillMap.diagnostic[priority];
    if (diag?.weakTags?.length) weakTags.push(...diag.weakTags.slice(0, 3));
  }

  return {
    profession: profile?.profession,
    professionLabel: profile?.profession
      ? getProfessionLabel(profile.profession)
      : undefined,
    regulator,
    regulatorLabel: reg?.label,
    country: profile?.targetCountry,
    nativeLanguage: profile?.nativeLanguage,
    targetGradesSummary: profile?.targetGrades
      ? formatTargetGradesSummary(profile.targetGrades)
      : undefined,
    skillMap,
    prioritySkill: priority,
    weakTags,
  };
}
