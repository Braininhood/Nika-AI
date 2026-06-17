"use client";

import { reopenCookieConsent } from "@/components/legal";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={reopenCookieConsent}
      className="mt-4 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
    >
      Change cookie preferences
    </button>
  );
}
