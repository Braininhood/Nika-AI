import type { SupabaseClient } from "@supabase/supabase-js";

interface ProfilePatch {
  profession?: string;
  target_country?: string;
  target_regulator?: string;
  target_grades?: Record<string, unknown>;
  onboarding_completed_at?: string;
  exam_date?: string | null;
  study_goal?: "training" | "exam_prep" | null;
  updated_at?: string;
}

/** Best-effort Supabase profile sync — Dexie remains the offline source of truth. */
export async function updateSupabaseProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfilePatch,
): Promise<void> {
  const updatedAt = patch.updated_at ?? new Date().toISOString();

  const { error: fullError } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: updatedAt })
    .eq("id", userId);

  if (!fullError) return;

  const { error: minimalError } = await supabase
    .from("profiles")
    .update({
      profession: patch.profession,
      target_country: patch.target_country,
      updated_at: updatedAt,
    })
    .eq("id", userId);

  if (minimalError) {
    console.warn("Profile sync skipped:", minimalError.message);
  }
}
