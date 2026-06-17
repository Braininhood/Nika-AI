import type { LegalSection } from "@/components/legal/legal-document";
import { LEGAL_ENTITY, PRODUCT_NAME, SUPPORT_EMAIL, LAST_UPDATED } from "./constants";

export const termsSections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement",
    body: [
      `By using ${PRODUCT_NAME}, you agree to these Terms of Service with ${LEGAL_ENTITY}. If you do not agree, do not use the service.`,
    ],
  },
  {
    id: "service",
    title: "The service",
    body: [
      `${PRODUCT_NAME} provides personalised OET (Occupational English Test) preparation including diagnostics, adaptive study plans, practice tasks, offline PWA access, and AI-assisted feedback through Nika.`,
      "The service is educational only. It is not affiliated with, endorsed by, or connected to OET or Cambridge Boxhill Language Assessment.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    body: [
      "You must provide accurate account information and keep credentials secure.",
      "You are responsible for activity under your account.",
      "We may suspend accounts that violate these terms or abuse the service.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: [
      "Use the platform only for lawful exam preparation.",
      "Do not upload copyrighted OET materials to our servers (local import on your device is your responsibility).",
      "Do not attempt to reverse-engineer, scrape, or overload our systems.",
      "Do not include real patient identifiable information in practice content.",
    ],
  },
  {
    id: "ai-content",
    title: "AI-generated content",
    body: [
      "Nika and AI feedback are automated and may contain errors.",
      "Always verify guidance against official OET materials and qualified tutors.",
      "Mock scores and grade estimates are approximate — only official OET results count.",
      "We do not guarantee exam results or registration outcomes.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: [
      `Platform design, Nika character, and original content are owned by ${LEGAL_ENTITY}.`,
      "You retain ownership of your writing and recordings. You grant us a licence to process them solely to provide feedback and progress tracking.",
    ],
  },
  {
    id: "availability",
    title: "Availability",
    body: [
      "We aim for high availability but do not guarantee uninterrupted access.",
      "Offline features depend on your device storage and prior sync.",
      "We may update or discontinue features with reasonable notice.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: [
      "To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from use of the service.",
      "Our total liability is limited to the amount you paid us in the 12 months before the claim (or zero for free tiers).",
      "Nothing in these terms excludes liability that cannot be excluded under applicable law.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    body: [
      "You may delete your account at any time from Profile settings.",
      "We may terminate access for breach of these terms.",
      "Upon termination, server-held data is deleted per our Privacy Policy.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    body: [
      "These terms are governed by the laws of England and Wales.",
      `Contact: ${SUPPORT_EMAIL}. Last updated: ${LAST_UPDATED}.`,
    ],
  },
];
