const HANDLED_CODE_KEY = "oet.auth.callback.handled-code";

export function readHandledAuthCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(HANDLED_CODE_KEY);
}

export function markAuthCodeHandled(code: string): void {
  sessionStorage.setItem(HANDLED_CODE_KEY, code);
}

export function clearHandledAuthCode(): void {
  sessionStorage.removeItem(HANDLED_CODE_KEY);
}

import type { Session } from "@supabase/supabase-js";

import { syncSessionToLocalUser } from "@/lib/auth/sync-session-user";
import {
  ADMIN_HOME_PATH,
  isAdminUser,
  LEARNER_HOME_PATH,
  sessionUsedGoogle,
} from "@/lib/auth/roles";
import {
  hasSkillMap,
  isProfileComplete,
  loadUserProfile,
} from "@/lib/profile/service";

/** Remove OAuth query params immediately so remounts cannot re-exchange the same code. */
export function stripAuthCallbackParams(): string | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (url.search || url.hash.includes("access_token")) {
    window.history.replaceState({}, "", "/auth/callback");
  }
  return code;
}

export async function resolvePostAuthRedirect(session: Session): Promise<string> {
  if (isAdminUser(session.user)) {
    if (sessionUsedGoogle(session)) {
      return "/login?error=admin_magic_link_only";
    }
    return ADMIN_HOME_PATH;
  }

  await syncSessionToLocalUser(session);
  const profile = await loadUserProfile(session.user.id);
  if (!isProfileComplete(profile)) return "/onboarding";
  if (!hasSkillMap(profile)) return "/diagnostic";
  return LEARNER_HOME_PATH;
}
