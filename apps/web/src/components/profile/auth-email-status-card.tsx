"use client";

import Link from "next/link";

import { authEmailDelivery } from "@/lib/auth/email-delivery-status";

export function AuthEmailStatusCard() {
  const delivery = authEmailDelivery();

  if (delivery === "branded") {
    return (
      <section
        className="rounded-2xl border border-success/30 bg-success/10 p-5 text-sm"
        aria-label="Sign-in email status"
      >
        <h2 className="font-semibold text-ink">Sign-in email</h2>
        <p className="mt-2 text-ink-soft">
          Magic-link emails are sent from <strong className="text-ink">OET Coach</strong>.
          Check your inbox and spam folder if a link does not arrive within a few minutes.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm"
      aria-label="Sign-in email status"
    >
      <h2 className="font-semibold text-ink">Sign-in email</h2>
      <p className="mt-2 text-ink-soft">
        Magic-link emails may come from our sign-in provider rather than OET Coach directly —
        the link is still safe to use. Check spam if you do not see it within a few minutes.
      </p>
      <p className="mt-2 text-ink-soft">
        Tip: <strong className="text-ink">Continue with Google</strong> on the sign-in page avoids
        waiting for email.{" "}
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          Sign-in page →
        </Link>
      </p>
    </section>
  );
}
