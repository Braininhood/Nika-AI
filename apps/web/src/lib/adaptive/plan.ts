import { buildDailyPlan } from "@/lib/plan/build-daily-plan";
import { loadRotationContext } from "@/lib/content/rotation-context";
import { dueFlashcardCount } from "@/lib/quiz/flashcards";
import type { UserProfile } from "@/lib/domain/types";
import type { DailyPlan } from "@/lib/plan/types";

import { loadReadinessStatus } from "./service";

export async function buildAdaptiveDailyPlan(profile: UserProfile | null): Promise<DailyPlan> {
  const [readiness, flashcardsDue, rotation] = await Promise.all([
    profile?.skillMap ? loadReadinessStatus() : Promise.resolve(null),
    dueFlashcardCount(),
    loadRotationContext(),
  ]);

  return buildDailyPlan({
    profession: profile?.profession,
    targetCountry: profile?.targetCountry,
    skillMap: profile?.skillMap,
    readiness,
    flashcardsDue,
    rotation,
  });
}
