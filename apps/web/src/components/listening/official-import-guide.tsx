"use client";

import Link from "next/link";

import { OET_PAPER_HUB, OET_SAMPLE_HUB } from "@/content/media/oet-official-samples";

const STEPS = [
  {
    title: "Create a free oet.com account",
    body: "Log in at oet.com — some sample downloads require sign-in.",
    href: "https://oet.com/login",
  },
  {
    title: "Pick your profession (all 12 available)",
    body: "Paper samples: all 12 professions. Computer samples: all 12 professions. Listening MP3 is shared — any one profession pack works for L/R.",
    href: OET_PAPER_HUB,
  },
  {
    title: "Download sample pack files",
    body: "Per sample (1–5): Questions PDF, Answer key PDF, Listening MP3. Writing/Speaking are profession-specific.",
    href: OET_SAMPLE_HUB,
  },
  {
    title: "Import into OET Coach",
    body: "Listening → Import → Browse → select MP3 + PDF + key PDF → tick consent → Import.",
    href: "/listening/import",
  },
  {
    title: "Practice offline",
    body: "Imported MP3 plays as real audio. Answer key enables auto-marking when formats match.",
    href: "/listening/part-a",
  },
];

export function OfficialImportGuide() {
  return (
    <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/20 p-5">
      <h2 className="font-semibold text-ink">Official OET audio (Option B)</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Official OET listening audio cannot be hosted in the app — copyright belongs to OET.
        Download from oet.com and import to your device. Files stay on your phone and are not
        uploaded to our servers.
      </p>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="text-sm">
            <span className="font-semibold text-ink">
              {i + 1}. {step.title}
            </span>
            <p className="mt-0.5 text-ink-soft">{step.body}</p>
            {step.href.startsWith("http") ? (
              <a
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                Open link →
              </a>
            ) : (
              <Link href={step.href} className="text-brand-primary hover:underline">
                Go →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
