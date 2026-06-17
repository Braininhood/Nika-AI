/** User-safe copy — no repo paths, env vars, or vendor internals. */

export const SIGN_IN_UNAVAILABLE =
  "Sign-in is not available right now. Please try again later.";

export const SIGN_IN_DEV_SETUP =
  "Sign-in is not configured for local development. Check your environment setup.";

export function signInNotConfiguredMessage(): string {
  return process.env.NODE_ENV === "development"
    ? SIGN_IN_DEV_SETUP
    : SIGN_IN_UNAVAILABLE;
}
