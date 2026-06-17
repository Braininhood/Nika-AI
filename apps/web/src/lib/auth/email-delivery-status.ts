/** How sign-in (magic link) emails are delivered — set via env after Resend/SMTP setup. */
export type AuthEmailDelivery = "default" | "branded";

export function authEmailDelivery(): AuthEmailDelivery {
  const raw = process.env.NEXT_PUBLIC_AUTH_EMAIL_DELIVERY?.toLowerCase();
  return raw === "branded" ? "branded" : "default";
}

export function isBrandedAuthEmail(): boolean {
  return authEmailDelivery() === "branded";
}
