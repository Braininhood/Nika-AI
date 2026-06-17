import type { StudyGoal, TargetGrades } from "@/lib/domain/types";
import type { LocalUser } from "@/lib/db/types";

/** Shape of GET /api/v1/profile/me (snake_case). */
export interface RemoteProfile {
  id: string;
  email?: string | null;
  profession?: string | null;
  target_country?: string | null;
  target_regulator?: string | null;
  target_grades?: TargetGrades | null;
  onboarding_complete?: boolean;
  exam_date?: string | null;
  study_goal?: StudyGoal | null;
  ai_consent?: boolean;
  ai_consent_at?: string | null;
}

/** Merge server profile into Dexie user — remote wins when a field is present. */
export function mergeRemoteProfileIntoLocal(
  local: LocalUser,
  remote: RemoteProfile,
): LocalUser {
  const merged: LocalUser = {
    ...local,
    updatedAt: Date.now(),
  };

  if (remote.email) merged.email = remote.email;
  if (remote.profession) merged.profession = remote.profession;
  if (remote.target_country) merged.targetCountry = remote.target_country;
  if (remote.target_regulator) merged.targetRegulator = remote.target_regulator;
  if (remote.target_grades) merged.targetGrades = remote.target_grades;

  if (remote.onboarding_complete) {
    merged.onboardingComplete = true;
  }

  if (remote.study_goal) {
    merged.studyGoal = remote.study_goal;
  }

  if (remote.exam_date) {
    merged.examDate = remote.exam_date;
  } else if (remote.exam_date === null) {
    merged.examDate = undefined;
  }

  return merged;
}
