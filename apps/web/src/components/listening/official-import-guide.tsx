"use client";

import Link from "next/link";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { OET_PAPER_HUB, OET_SAMPLE_HUB } from "@/content/media/oet-official-samples";

const STEPS = [
  {
    title: "Sign in at oet.com",
    body: "Create an account if you need one — sample downloads are on the official site.",
    href: "https://oet.com/login",
  },
  {
    title: "Choose your profession",
    body: "Paper and computer sample packs cover all 12 professions. Listening audio is shared across professions.",
    href: OET_PAPER_HUB,
  },
  {
    title: "Download your sample pack",
    body: "Each pack includes question PDFs, answer keys, and listening MP3 where applicable.",
    href: OET_SAMPLE_HUB,
  },
  {
    title: "Import into OET Coach",
    body: "Listening → Import → select your MP3, question PDF, and answer key.",
    href: "/listening/import",
  },
  {
    title: "Practise with real audio",
    body: "Imported files play on your device. Matching answer keys enable automatic marking.",
    href: "/listening/part-a",
  },
];

export function OfficialImportGuide() {
  return (
    <CollapsibleSection
      title="Import official OET listening"
      subtitle="Use real sample-test audio from oet.com on your device"
      defaultOpen={false}
      variant="accent"
    >
      <p className="text-sm text-ink-soft">
        Download official listening files from oet.com, then import them here for timed practice with
        auto-marking when your answer key matches.
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
    </CollapsibleSection>
  );
}
