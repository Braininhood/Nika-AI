import type { OetProfession, SkillMap, StudyGoal, TargetGrades, UserProfile } from "@/lib/domain/types";
import { apiUrl } from "@/lib/api/base-url";
import { apiGet } from "@/lib/api/typed";
import { getTargetGrades } from "@/lib/domain/requirements";
import { db, getActiveUser } from "@/lib/db";
import type { LocalUser, SkillMapRecord } from "@/lib/db/types";
import {
  mergeRemoteProfileIntoLocal,
  type RemoteProfile,
} from "@/lib/profile/merge-remote-profile";
import { createClient } from "@/lib/supabase/client";
import { updateSupabaseProfile } from "@/lib/supabase/profile-sync";

function localToProfile(user: LocalUser, skillMap?: SkillMap): UserProfile {
  return {
    id: user.id,
    email: user.email,
    profession: user.profession as OetProfession | undefined,
    targetCountry: user.targetCountry,
    targetRegulator: user.targetRegulator,
    targetGrades: user.targetGrades,
    onboardingComplete: user.onboardingComplete ?? false,
    examDate: user.examDate,
    studyGoal: user.studyGoal,
    nativeLanguage: user.nativeLanguage,
    isGuest: user.isGuest,
    skillMap,
  };
}

export async function loadUserProfile(sessionUserId?: string): Promise<UserProfile | null> {
  let user: LocalUser | undefined;

  if (sessionUserId) {
    user = await db.users.get(sessionUserId);
  }
  if (!user) {
    user = await getActiveUser();
  }
  if (!user) return null;

  const skillRecord = await db.skillMaps.get(user.id);
  const skillMap = skillRecord?.snapshot as SkillMap | undefined;

  return localToProfile(user, skillMap);
}

/** Persist Dexie user without dropping profile fields (used on sign-in). */
export async function persistLocalUser(user: LocalUser): Promise<void> {
  await db.users.put({ ...user, updatedAt: Date.now() });
}

/**
 * Pull profile from API after login and merge into Dexie.
 * Best-effort — returns local user unchanged when offline or profile missing.
 */
export async function hydrateProfileFromApi(
  userId: string,
  accessToken: string,
): Promise<LocalUser | null> {
  const local = await db.users.get(userId);
  if (!local) return null;

  try {
    const remote = await apiGet<RemoteProfile>("/api/v1/profile/me", accessToken);
    const merged = mergeRemoteProfileIntoLocal(local, remote);
    await db.users.put(merged);
    return merged;
  } catch {
    return local;
  }
}

/** Pull latest skill map snapshot from API into Dexie (cross-device restore). */
export async function hydrateSkillMapFromApi(
  userId: string,
  accessToken: string,
): Promise<SkillMap | null> {
  try {
    const remote = await apiGet<{ skill_map: SkillMap | null; computed_at?: string }>(
      "/api/v1/profile/me/skill-map",
      accessToken,
    );
    if (!remote.skill_map || typeof remote.skill_map !== "object") return null;

    const computedAt = remote.computed_at ? Date.parse(remote.computed_at) : Date.now();
    const record: SkillMapRecord = {
      userId,
      snapshot: remote.skill_map as unknown as Record<string, unknown>,
      computedAt: Number.isFinite(computedAt) ? computedAt : Date.now(),
    };
    await db.skillMaps.put(record);
    return remote.skill_map;
  } catch {
    return null;
  }
}

async function pushProfileToCloud(local: LocalUser, accessToken: string): Promise<void> {
  if (!local.onboardingComplete || !local.profession || !local.targetRegulator) return;

  const grades = local.targetGrades ?? getTargetGrades(local.targetRegulator);
  try {
    await fetch(apiUrl("/api/v1/profile/me"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profession: local.profession,
        target_country: local.targetCountry,
        target_regulator: local.targetRegulator,
        target_grades: grades,
        onboarding_complete: true,
        study_goal: local.studyGoal ?? "training",
        exam_date: local.examDate ?? null,
      }),
    });
  } catch {
    // Offline — retried on next automatic sync
  }
}

async function pushSkillMapToCloud(
  skillMap: SkillMap,
  accessToken: string,
): Promise<void> {
  try {
    await fetch(apiUrl("/api/v1/profile/me/skill-map"), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ skill_map: skillMap }),
    });
  } catch {
    // Offline — retried on next automatic sync
  }
}

/** Two-way profile + skill-map sync — runs automatically on sign-in and reconnect. */
export async function syncAccountWithCloud(
  userId: string,
  accessToken: string,
): Promise<LocalUser | null> {
  const local = await db.users.get(userId);
  if (!local) return null;

  let remote: RemoteProfile | null = null;
  try {
    remote = await apiGet<RemoteProfile>("/api/v1/profile/me", accessToken);
  } catch {
    // Offline or profile row missing — push local if we have data
  }

  const merged = remote ? mergeRemoteProfileIntoLocal(local, remote) : local;
  await db.users.put(merged);

  const remoteComplete = Boolean(
    remote?.onboarding_complete && remote.profession && remote.target_regulator,
  );
  const localComplete = Boolean(
    merged.onboardingComplete && merged.profession && merged.targetRegulator,
  );
  if (localComplete && !remoteComplete) {
    await pushProfileToCloud(merged, accessToken);
  }

  const localSkill = await db.skillMaps.get(userId);
  let remoteSkill: { skill_map: SkillMap | null; computed_at?: string } | null = null;
  try {
    remoteSkill = await apiGet<{ skill_map: SkillMap | null; computed_at?: string }>(
      "/api/v1/profile/me/skill-map",
      accessToken,
    );
  } catch {
    // No cloud snapshot yet
  }

  if (remoteSkill?.skill_map && !localSkill) {
    const computedAt = remoteSkill.computed_at
      ? Date.parse(remoteSkill.computed_at)
      : Date.now();
    await db.skillMaps.put({
      userId,
      snapshot: remoteSkill.skill_map as unknown as Record<string, unknown>,
      computedAt: Number.isFinite(computedAt) ? computedAt : Date.now(),
    });
  } else if (localSkill && !remoteSkill?.skill_map) {
    await pushSkillMapToCloud(localSkill.snapshot as unknown as SkillMap, accessToken);
  } else if (localSkill && remoteSkill?.skill_map) {
    const remoteAt = remoteSkill.computed_at ? Date.parse(remoteSkill.computed_at) : 0;
    if (localSkill.computedAt > remoteAt) {
      await pushSkillMapToCloud(localSkill.snapshot as unknown as SkillMap, accessToken);
    } else if (remoteAt > localSkill.computedAt) {
      await db.skillMaps.put({
        userId,
        snapshot: remoteSkill.skill_map as unknown as Record<string, unknown>,
        computedAt: remoteAt,
      });
    }
  }

  return merged;
}

export interface SaveOnboardingInput {
  profession: OetProfession;
  targetCountry: string;
  targetRegulator: string;
  targetGrades: TargetGrades;
  studyGoal: StudyGoal;
  examDate?: string | null;
}

export async function saveOnboarding(
  input: SaveOnboardingInput,
  accessToken?: string,
): Promise<UserProfile> {
  const user = await getActiveUser();
  if (!user) throw new Error("Sign in required");

  const updated: LocalUser = {
    ...user,
    profession: input.profession,
    targetCountry: input.targetCountry,
    targetRegulator: input.targetRegulator,
    targetGrades: input.targetGrades,
    onboardingComplete: true,
    studyGoal: input.studyGoal,
    examDate: input.examDate?.trim() ? input.examDate.trim() : undefined,
    updatedAt: Date.now(),
  };

  await db.users.put(updated);

  const supabase = createClient();
  if (supabase && accessToken) {
    await updateSupabaseProfile(supabase, user.id, {
      profession: input.profession,
      target_country: input.targetCountry,
      target_regulator: input.targetRegulator,
      target_grades: input.targetGrades as unknown as Record<string, unknown>,
      onboarding_completed_at: new Date().toISOString(),
      study_goal: input.studyGoal,
      exam_date: input.examDate?.trim() || null,
    });

    try {
      await fetch(apiUrl("/api/v1/profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profession: input.profession,
          target_country: input.targetCountry,
          target_regulator: input.targetRegulator,
          target_grades: input.targetGrades,
          onboarding_complete: true,
          study_goal: input.studyGoal,
          exam_date: input.examDate?.trim() || null,
        }),
      });
    } catch {
      // Offline — Dexie is source of truth until sync
    }
  }

  return localToProfile(updated);
}

export async function saveExamDate(
  examDate: string | null,
  accessToken?: string,
): Promise<UserProfile> {
  const user = await getActiveUser();
  if (!user) throw new Error("Sign in required");

  const updated: LocalUser = {
    ...user,
    examDate: examDate ?? undefined,
    updatedAt: Date.now(),
  };
  await db.users.put(updated);

  const supabase = createClient();
  if (supabase) {
    await updateSupabaseProfile(supabase, user.id, {
      exam_date: examDate,
      updated_at: new Date().toISOString(),
    });
  }

  if (accessToken) {
    try {
      await fetch(apiUrl("/api/v1/profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exam_date: examDate }),
      });
    } catch {
      // Offline — Dexie is source of truth until sync
    }
  }

  const skillRecord = await db.skillMaps.get(user.id);
  return localToProfile(updated, skillRecord?.snapshot as SkillMap | undefined);
}

export async function saveStudyGoal(
  studyGoal: StudyGoal,
  accessToken?: string,
): Promise<UserProfile> {
  const user = await getActiveUser();
  if (!user) throw new Error("Sign in required");

  const updated: LocalUser = {
    ...user,
    studyGoal,
    updatedAt: Date.now(),
  };
  await db.users.put(updated);

  const supabase = createClient();
  if (supabase) {
    await updateSupabaseProfile(supabase, user.id, {
      study_goal: studyGoal,
      updated_at: new Date().toISOString(),
    });
  }

  if (accessToken) {
    try {
      await fetch(apiUrl("/api/v1/profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ study_goal: studyGoal }),
      });
    } catch {
      // Offline — Dexie is source of truth until sync
    }
  }

  const skillRecord = await db.skillMaps.get(user.id);
  return localToProfile(updated, skillRecord?.snapshot as SkillMap | undefined);
}

export async function saveNativeLanguage(
  nativeLanguage: string,
  accessToken?: string,
): Promise<UserProfile> {
  const user = await getActiveUser();
  if (!user) throw new Error("Sign in required");

  const updated: LocalUser = {
    ...user,
    nativeLanguage: nativeLanguage.toUpperCase().split("-")[0],
    updatedAt: Date.now(),
  };
  await db.users.put(updated);

  if (accessToken) {
    try {
      await fetch(apiUrl("/api/v1/profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ native_language: updated.nativeLanguage }),
      });
    } catch {
      /* offline */
    }
  }

  const skillRecord = await db.skillMaps.get(user.id);
  return localToProfile(updated, skillRecord?.snapshot as SkillMap | undefined);
}

export async function saveSkillMap(skillMap: SkillMap, accessToken?: string): Promise<void> {
  const user = await getActiveUser();
  if (!user) return;

  const existing = await db.skillMaps.get(user.id);
  const previous = existing?.snapshot as SkillMap | undefined;

  const record: SkillMapRecord = {
    userId: user.id,
    snapshot: skillMap as unknown as Record<string, unknown>,
    computedAt: Date.now(),
  };
  await db.skillMaps.put(record);

  const { emitNikaMilestonesFromSkillMapUpdate } = await import("@/lib/nika/milestone-store");
  emitNikaMilestonesFromSkillMapUpdate(user.id, previous, skillMap);

  let token = accessToken;
  if (!token) {
    const supabase = createClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }
  }

  if (token) {
    await pushSkillMapToCloud(skillMap, token);
  }

  void import("@/lib/progress/badge-store").then(({ afterStudyActivity }) => afterStudyActivity());
}

export async function mergeGuestProfileOnSignIn(
  authedUserId: string,
  accessToken: string,
): Promise<void> {
  const guest = await db.users.filter((u) => u.isGuest === true).first();
  if (!guest) return;

  const authedProfile: LocalUser = {
    id: authedUserId,
    email: undefined,
    profession: guest.profession,
    targetCountry: guest.targetCountry,
    targetRegulator: guest.targetRegulator,
    targetGrades: guest.targetGrades,
    onboardingComplete: guest.onboardingComplete,
    studyGoal: guest.studyGoal,
    examDate: guest.examDate,
    isGuest: false,
    updatedAt: Date.now(),
  };

  await db.users.put(authedProfile);

  const guestSkillMap = await db.skillMaps.get(guest.id);
  if (guestSkillMap) {
    await db.skillMaps.put({
      ...guestSkillMap,
      userId: authedUserId,
    });
    await db.skillMaps.delete(guest.id);
  }

  await db.users.delete(guest.id);

  if (guest.onboardingComplete && guest.profession && guest.targetRegulator) {
    const grades = guest.targetGrades ?? getTargetGrades(guest.targetRegulator);
    try {
      await fetch(apiUrl("/api/v1/profile/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profession: guest.profession,
          target_country: guest.targetCountry,
          target_regulator: guest.targetRegulator,
          target_grades: grades,
          onboarding_complete: true,
          study_goal: guest.studyGoal ?? "training",
          exam_date: guest.examDate ?? null,
          guest_id: guest.id,
        }),
      });
    } catch {
      // Will sync when online
    }
  }
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(
    profile?.onboardingComplete &&
      profile.profession &&
      profile.targetRegulator &&
      profile.targetGrades,
  );
}

export function hasSkillMap(profile: UserProfile | null): boolean {
  return Boolean(profile?.skillMap);
}
