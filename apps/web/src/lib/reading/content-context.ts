import type { OetProfession } from "@/lib/domain/types";
import type { UserProfile } from "@/lib/domain/types";
import {
  blocksForUser,
  pickPlanReadingBlock,
  type ReadingBlock,
} from "@/content/reading";
import { loadUserProfile } from "@/lib/profile/service";

export interface ReadingContentContext {
  profile: UserProfile | null;
  profession?: OetProfession;
  targetCountry?: string;
  blocks: ReadingBlock[];
  primaryPartA: ReadingBlock;
  primaryPartB: ReadingBlock;
  primaryPartC: ReadingBlock;
}

export async function loadReadingContentContext(
  sessionUserId?: string,
): Promise<ReadingContentContext> {
  const profile = await loadUserProfile(sessionUserId);
  const profession = profile?.profession;
  const targetCountry = profile?.targetCountry;
  const gap = profile?.skillMap?.diagnostic.reading?.gap;

  return {
    profile,
    profession,
    targetCountry,
    blocks: blocksForUser(profession, targetCountry),
    primaryPartA: pickPlanReadingBlock(profession, targetCountry, gap, "A"),
    primaryPartB: pickPlanReadingBlock(profession, targetCountry, gap, "B"),
    primaryPartC: pickPlanReadingBlock(profession, targetCountry, gap, "C"),
  };
}
