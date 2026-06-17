import type { Session } from "@supabase/supabase-js";

import { db } from "@/lib/db";
import type { LocalUser } from "@/lib/db/types";
import {
  mergeGuestProfileOnSignIn,
  persistLocalUser,
  syncAccountWithCloud,
} from "@/lib/profile/service";

/** Mirror Supabase session into Dexie, then hydrate profile from API. */
export async function syncSessionToLocalUser(
  session: Session,
): Promise<LocalUser> {
  await mergeGuestProfileOnSignIn(session.user.id, session.access_token);

  const existing = await db.users.get(session.user.id);
  const local: LocalUser = {
    ...(existing ?? {
      id: session.user.id,
      isGuest: false,
      updatedAt: Date.now(),
    }),
    email: session.user.email ?? existing?.email,
    profession: existing?.profession,
    targetCountry: existing?.targetCountry,
    targetRegulator: existing?.targetRegulator,
    targetGrades: existing?.targetGrades,
    onboardingComplete: existing?.onboardingComplete,
    studyGoal: existing?.studyGoal,
    examDate: existing?.examDate,
    isGuest: false,
    updatedAt: Date.now(),
  };

  await persistLocalUser(local);

  return (await syncAccountWithCloud(session.user.id, session.access_token)) ?? local;
}
