import type { OetProfession } from "@/lib/domain/types";
import {
  letterTypesForProfession,
  type LetterTypeModule,
} from "@/content/writing/letter-types";
import { drillsForProfession, type ContentDrill } from "@/content/writing/drills";
import {
  pickPlanScenario,
  scenariosForUser,
  type WritingScenario,
} from "@/content/writing/scenarios";
import {
  primarySampleForProfession,
  samplesForUser,
  weakSampleForProfession,
  type GradedSampleLetter,
} from "@/content/writing/sample-letters";
import type { UserProfile } from "@/lib/domain/types";
import { loadUserProfile } from "@/lib/profile/service";

export interface WritingContentContext {
  profile: UserProfile | null;
  profession?: OetProfession;
  targetCountry?: string;
  scenarios: WritingScenario[];
  samples: GradedSampleLetter[];
  primarySample?: GradedSampleLetter;
  weakSample?: GradedSampleLetter;
  primaryScenario: WritingScenario;
  letterTypes: LetterTypeModule[];
  drills: ContentDrill[];
}

export async function loadWritingContentContext(
  sessionUserId?: string,
): Promise<WritingContentContext> {
  const profile = await loadUserProfile(sessionUserId);
  const profession = profile?.profession;
  const targetCountry = profile?.targetCountry;
  const scenarios = scenariosForUser(profession, targetCountry);
  const primaryScenario = pickPlanScenario(
    profession,
    targetCountry,
    profile?.skillMap?.diagnostic.writing?.gap,
  );

  return {
    profile,
    profession,
    targetCountry,
    scenarios,
    samples: samplesForUser(profession, targetCountry),
    primarySample: profession ? primarySampleForProfession(profession) : undefined,
    weakSample: profession ? weakSampleForProfession(profession) : undefined,
    primaryScenario,
    letterTypes: letterTypesForProfession(profession ?? ""),
    drills: drillsForProfession(profession),
  };
}
