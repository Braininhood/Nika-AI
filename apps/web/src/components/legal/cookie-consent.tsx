"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isStudyRoute } from "@/lib/navigation/study-routes";

const STORAGE_KEY = "oet-coach-cookie-consent";

type ConsentState = "pending" | "accepted" | "rejected";

export function CookieConsent() {
  const pathname = usePathname() ?? "/";
  const study = isStudyRoute(pathname);
  const [consent, setConsent] = useState<ConsentState>("pending");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "accepted" || stored === "rejected") {
        setConsent(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    const timer = window.setTimeout(() => setVisible(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const save = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
    setVisible(false);
  };

  if (consent !== "pending" || !visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className={`fixed inset-x-0 z-[60] p-4 sm:p-6 ${
        study
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]"
          : "bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl sm:flex-row sm:items-center sm:gap-6">
        <div className="flex-1">
          <p id="cookie-consent-title" className="font-semibold text-ink">
            Cookies & privacy
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-ink-soft">
            We use essential cookies for sign-in and offline study. See our{" "}
            <Link href="/cookies" className="font-medium text-brand-primary hover:underline">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => save("rejected")}
            className="min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save("accepted")}
            className="min-h-11 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-accent-glow"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

/** Open cookie settings from footer — clears consent to re-show banner. */
export function reopenCookieConsent() {
  try {
    localStorage.removeItem("oet-coach-cookie-consent");
    window.location.reload();
  } catch {
    /* ignore */
  }
}
