import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocument } from "@/components/legal/legal-document";
import { NikaAvatar } from "@/components/nika/nika-avatar";
import {
  CONTENT_DISCLAIMER,
  AI_DISCLAIMER,
  LEGAL_ENTITY,
  PRODUCT_NAME,
  SCORE_DISCLAIMER,
  SHORT_DISCLAIMER,
  SIGNUP_DISCLAIMER,
} from "@/content/legal/constants";

export const metadata: Metadata = {
  title: "About",
  description: `About ${PRODUCT_NAME} — personalised OET preparation by ${LEGAL_ENTITY}.`,
};

const aboutSections = [
  {
    id: "mission",
    title: "Our mission",
    body: [
      `${PRODUCT_NAME} is created by ${LEGAL_ENTITY} to help healthcare professionals prepare for the Occupational English Test with calm, personalised guidance.`,
      "We believe exam prep should feel encouraging, not overwhelming — with a clear next step every day and a companion who grows alongside you.",
    ],
  },
  {
    id: "nika",
    title: "Meet Nika",
    body: [
      "Nika is a European dragon — a wise, warm guardian who embodies our AI tutor. She welcomes new learners, explains the platform, builds individual study plans, and celebrates your progress.",
      "Nika's visual form grows from hatchling to guardian as your skills improve — a mirror of your journey, not vanity points.",
    ],
  },
  {
    id: "not-affiliated",
    title: "Independence",
    body: [
      `${PRODUCT_NAME} is not affiliated with, endorsed by, or connected to OET or Cambridge Boxhill Language Assessment.`,
      "We use publicly available OET guidance and official resource links to ground our content. Always confirm registration requirements with your regulator and oet.com.",
    ],
  },
  {
    id: "disclaimers",
    title: "Important disclaimers",
    body: [CONTENT_DISCLAIMER, SHORT_DISCLAIMER, SIGNUP_DISCLAIMER, AI_DISCLAIMER, SCORE_DISCLAIMER],
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="border-b border-border bg-surface/60">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 sm:py-16">
          <NikaAvatar size="xl" state="greeting" glow={0.7} />
          <div>
            <p className="text-sm font-medium text-brand-primary">{LEGAL_ENTITY}</p>
            <p className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">
              Your OET study companion
            </p>
            <p className="mx-auto mt-3 max-w-lg text-ink-soft">
              Professional, adaptive OET preparation — on any device, at any resolution, with
              offline support built in.
            </p>
          </div>
        </div>
      </div>
      <LegalDocument
        title="About OET Coach"
        subtitle={`Created by ${LEGAL_ENTITY}.`}
        sections={aboutSections}
      >
        <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Regulatory links</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
            <li>
              <a
                href="https://oet.com/test/who-recognises-oet"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-primary hover:underline"
              >
                Who recognises OET (oet.com)
              </a>
            </li>
            <li>
              <Link href="/contact" className="font-medium text-brand-primary hover:underline">
                Contact {LEGAL_ENTITY}
              </Link>
            </li>
          </ul>
        </section>
      </LegalDocument>
    </>
  );
}
