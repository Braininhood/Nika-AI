import { roleCardsForUser } from "@/content/speaking";
import { loadUserProfile } from "@/lib/profile/service";
import type { SkillMap, UserProfile } from "@/lib/domain/types";

export interface SpeakingContentContext {
  profile: UserProfile | null;
  skillMap?: SkillMap;
  profession?: string;
  targetCountry?: string;
  cards: ReturnType<typeof roleCardsForUser>;
}

export async function loadSpeakingContentContext(
  userId?: string,
): Promise<SpeakingContentContext> {
  const profile = await loadUserProfile(userId);
  const profession = profile?.profession;
  const targetCountry = profile?.targetCountry;
  const cards = roleCardsForUser(profession, targetCountry);

  return {
    profile,
    skillMap: profile?.skillMap,
    profession,
    targetCountry,
    cards,
  };
}
