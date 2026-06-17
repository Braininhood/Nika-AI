import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Install app",
  description: "Install OET Coach on your phone or tablet for offline OET study.",
};

const IOS_STEPS = [
  "Open oetcoach.app in Safari (not Chrome on iOS).",
  "Tap the Share button at the bottom of the screen.",
  'Scroll down and tap "Add to Home Screen".',
  'Tap "Add" — the OET Coach icon appears on your home screen.',
  "Open from the icon for full-screen standalone mode and offline study.",
] as const;

const ANDROID_STEPS = [
  "Open OET Coach in Chrome.",
  'Tap "Install" in the banner at the top, or open the menu (⋮) → "Install app".',
  "Confirm install — the app opens like a native app with offline support.",
] as const;

export default function InstallGuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium text-brand-primary">PWA install</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-ink">Install OET Coach</h1>
      <p className="mt-3 text-ink-soft">
        Add the app to your home screen for faster access, full-screen study, and offline practice
        after your first visit.
      </p>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">iPhone & iPad (Safari)</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Apple does not show an automatic install banner. Follow these steps:
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink">
          {IOS_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Android (Chrome)</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-ink">
          {ANDROID_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface-muted p-6 text-sm text-ink-soft">
        <h2 className="font-semibold text-ink">After install</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Sign in once while online — your profile syncs across devices.</li>
          <li>Visit study areas while online so content caches for offline use.</li>
          <li>Listening packs: download from Listening → Packs before going offline.</li>
        </ul>
      </section>

      <p className="mt-8 text-center text-sm text-ink-soft">
        <Link href="/dashboard" className="font-medium text-brand-primary hover:underline">
          Continue to dashboard
        </Link>
      </p>
    </div>
  );
}
