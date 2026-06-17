import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_ENTITY, PRODUCT_NAME, SUPPORT_EMAIL } from "@/content/legal/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${LEGAL_ENTITY} about ${PRODUCT_NAME}.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium text-brand-primary">Support</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-ink-soft">
          Questions about {PRODUCT_NAME}, your data, or accessibility? We&apos;re here to help.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-ink">{LEGAL_ENTITY}</h2>
          <p className="mt-2 text-sm text-ink-soft">Creator of {PRODUCT_NAME}</p>
          <p className="mt-4">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-base font-medium text-brand-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-ink">Data & privacy requests</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            To access, export, or delete your personal data, email us from your registered
            account address. See our{" "}
            <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            for full details on your GDPR rights.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-ink">Accessibility</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            We aim for WCAG 2.1 AA compliance. Report barriers via email — include the page URL
            and assistive technology you use.
          </p>
        </section>
      </div>
    </div>
  );
}
