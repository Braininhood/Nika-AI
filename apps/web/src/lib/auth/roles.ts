import type { Session, User } from "@supabase/supabase-js";

/** Post-auth home for platform admin (Supabase app_metadata.role = admin). */
export const ADMIN_HOME_PATH = "/admin";

/** Learner study home — admins must not use this. */
export const LEARNER_HOME_PATH = "/dashboard";

export function getUserRole(user: User | null | undefined): "admin" | "learner" {
  const role = user?.app_metadata?.role;
  return role === "admin" ? "admin" : "learner";
}

export function isAdminUser(user: User | null | undefined): boolean {
  return getUserRole(user) === "admin";
}

/** True when the session was created via Google OAuth (admin must not use this). */
export function sessionUsedGoogle(session: Session): boolean {
  const user = session.user;
  if (user.identities?.some((i) => i.provider === "google")) return true;
  const provider = user.app_metadata?.provider as string | undefined;
  return provider === "google";
}

/** Optional UX hint — set NEXT_PUBLIC_ADMIN_EMAIL in web env (same email as SQL grant). */
export function isKnownAdminEmail(email: string): boolean {
  const configured = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
  if (!configured) return false;
  return email.trim().toLowerCase() === configured;
}

const STUDY_ROUTE_PREFIXES = [
  "/dashboard",
  "/study",
  "/nika",
  "/progress",
  "/profile",
  "/diagnostic",
  "/onboarding",
  "/writing",
  "/reading",
  "/listening",
  "/speaking",
  "/mock",
  "/course",
  "/materials",
  "/vocabulary",
] as const;

export function isLearnerStudyPath(pathname: string): boolean {
  return STUDY_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
