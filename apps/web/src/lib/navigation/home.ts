/** Site root — marketing (guest) or welcome-back (signed in). Header logo always uses this. */
export const SITE_ROOT_PATH = "/";

/** Signed-in study home — dashboard (matches bottom nav “Home”). */
export const APP_HOME_PATH = "/dashboard";

/** @deprecated use SITE_ROOT_PATH */
export const PUBLIC_HOME_PATH = SITE_ROOT_PATH;

export function logoHref(): string {
  return SITE_ROOT_PATH;
}

export function studyHomeHref(): string {
  return APP_HOME_PATH;
}
