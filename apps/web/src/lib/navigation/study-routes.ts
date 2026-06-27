/** Paths that use the signed-in study shell (compact header, bottom nav, auth guards). */
export const STUDY_ROUTE_PREFIXES = [
  "/dashboard",
  "/study",
  "/today-tip",
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

export function isStudyRoute(pathname: string): boolean {
  return STUDY_ROUTE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
