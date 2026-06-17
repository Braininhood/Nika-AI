const RATE_LIMIT_PATTERNS = [
  "email rate limit exceeded",
  "over_email_send_rate_limit",
  "rate limit",
];

/** Default Supabase free-tier OTP window (override in Dashboard → Auth → Rate Limits). */
export const DEFAULT_EMAIL_RATE_LIMIT_MINUTES = 60;

export function isEmailRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return RATE_LIMIT_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function formatAuthError(
  message: string,
  options?: { suggestGoogle?: boolean },
): string {
  if (isEmailRateLimitError(message)) {
    const base =
      `Too many magic-link emails were sent recently. ` +
      `Wait about ${DEFAULT_EMAIL_RATE_LIMIT_MINUTES} minutes, then try again`;
  const suggestGoogle = options?.suggestGoogle ?? true;
  return suggestGoogle
    ? `${base} — or use Continue with Google below.`
    : `${base}.`;
  }
  return message;
}

const OTP_COOLDOWN_MS = 60_000;
const OTP_STORAGE_KEY = "oet-coach-otp-cooldown";

export function getOtpCooldownRemainingMs(email: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { email: string; until: number };
    if (data.email.toLowerCase() !== email.toLowerCase()) return 0;
    return Math.max(0, data.until - Date.now());
  } catch {
    return 0;
  }
}

export function setOtpCooldown(email: string, ms = OTP_COOLDOWN_MS): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    OTP_STORAGE_KEY,
    JSON.stringify({ email: email.toLowerCase(), until: Date.now() + ms }),
  );
}

export function formatCooldown(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}
