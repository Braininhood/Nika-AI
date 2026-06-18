"use client";

import Link from "next/link";

import { CONTENT_DISCLAIMER, INFO_EMAIL, LEGAL_ENTITY, PRODUCT_NAME, SHORT_DISCLAIMER, SUPPORT_EMAIL } from "@/content/legal/constants";
import { NikaAvatar } from "@/components/nika/nika-avatar";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-forest-deep text-[#F6F1E8]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <NikaAvatar size="md" glow={0.6} />
              <div>
                <p className="font-display text-xl font-bold text-brand-accent-glow">
                  {PRODUCT_NAME}
                </p>
                <p className="text-sm text-[#C9BBA8]">Created by {LEGAL_ENTITY}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#C9BBA8]">
              Personalised OET preparation for healthcare professionals — adaptive plans,
              offline study, and Nika, your AI study companion.
            </p>
            <p className="mt-3 text-sm">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-brand-accent-glow hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              <span className="text-[#9A8B7A]"> · </span>
              <a
                href={`mailto:${INFO_EMAIL}`}
                className="font-medium text-[#C9BBA8] hover:text-brand-accent-glow hover:underline"
              >
                {INFO_EMAIL}
              </a>
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent-soft">
              Legal & support
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-[#E7DECF] transition hover:text-brand-accent-glow"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 rounded-xl border border-[#3C6B4F]/50 bg-[#21402F]/60 p-4 text-xs leading-relaxed text-[#C9BBA8]">
          {CONTENT_DISCLAIMER}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#9A8B7A]">{SHORT_DISCLAIMER}</p>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#3C6B4F]/40 pt-6 text-xs text-[#9A8B7A] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {LEGAL_ENTITY}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function CompactLegalFooter() {
  return (
    <footer className="border-t border-border px-4 py-4 text-center text-xs text-ink-soft">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 overflow-safe">
        © {new Date().getFullYear()}{" "}
        <Link href="/about" className="hover:text-brand-primary hover:underline">
          {LEGAL_ENTITY}
        </Link>
        {" · "}
        <Link href="/privacy" className="hover:text-brand-primary hover:underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-brand-primary hover:underline">
          Terms
        </Link>
      </p>
    </footer>
  );
}
