import type { Session } from "@supabase/supabase-js";

import { db } from "@/lib/db";
import type { LocalUser } from "@/lib/db/types";
import {
  mergeGuestProfileOnSignIn,
  persistLocalUser,
  syncAccountWithCloud,
} from "@/lib/profile/service";

const MIN_SYNC_INTERVAL_MS = 30_000;

let syncInFlight: Promise<LocalUser> | null = null;
let lastSyncAt = 0;
let lastSyncUserId: string | null = null;

async function runSync(session: Session): Promise<LocalUser> {
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

/** Mirror Supabase session into Dexie, then hydrate profile from API. */
export async function syncSessionToLocalUser(
  session: Session,
  options?: { force?: boolean },
): Promise<LocalUser> {
  const force = options?.force ?? false;
  const now = Date.now();
  const sameUser = lastSyncUserId === session.user.id;

  if (syncInFlight) return syncInFlight;

  if (!force && sameUser && now - lastSyncAt < MIN_SYNC_INTERVAL_MS) {
    const cached = await db.users.get(session.user.id);
    if (cached) return cached;
  }

  syncInFlight = runSync(session)
    .then((user) => {
      lastSyncAt = Date.now();
      lastSyncUserId = session.user.id;
      return user;
    })
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}
