import { getRoleCard, roleCardsForUser, type RolePlayCard } from "@/content/speaking";
import { OET_SPEAKING } from "@/lib/exam/oet-counts";
import { createSelectionSeed, shuffleWithSeed } from "@/lib/quiz/shuffle-seed";

export interface SpeakingExamSet {
  cards: RolePlayCard[];
}

/** Two distinct role-play cards — real OET speaking format. */
export function assembleSpeakingExam(
  profession?: string,
  targetCountry?: string,
  seed = createSelectionSeed(),
  count: number = OET_SPEAKING.rolePlays,
): SpeakingExamSet {
  const pool = shuffleWithSeed(roleCardsForUser(profession, targetCountry), seed);
  const cards: RolePlayCard[] = [];
  const used = new Set<string>();

  for (const item of pool) {
    if (cards.length >= count) break;
    if (used.has(item.id)) continue;
    used.add(item.id);
    cards.push(item);
  }

  while (cards.length < count && pool.length > 0) {
    const fallback = getRoleCard(pool[cards.length % pool.length]!.id);
    if (fallback && !used.has(fallback.id)) {
      used.add(fallback.id);
      cards.push(fallback);
    } else break;
  }

  return { cards };
}
