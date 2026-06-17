import type { LegalSection } from "@/components/legal/legal-document";
import { LEGAL_ENTITY, PRODUCT_NAME, SUPPORT_EMAIL, LAST_UPDATED } from "./constants";

export const privacySections: LegalSection[] = [
  {
    id: "intro",
    title: "Introduction",
    body: [
      `${LEGAL_ENTITY} ("we", "us") operates ${PRODUCT_NAME}, an English exam preparation platform for healthcare professionals. This Privacy Policy explains how we collect, use, and protect your personal data under UK GDPR and EU GDPR.`,
      `Data controller: ${LEGAL_ENTITY}. Contact: ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    body: [
      "Account data: email address and authentication identifiers when you sign in (magic link or Google OAuth).",
      "Profile data: profession, target country, regulator, study goals, and optional exam date.",
      "Learning data: diagnostic results, skill map, practice attempts, writing drafts, quiz answers, and progress metrics.",
      "AI interaction data: messages to Nika and AI-generated feedback on writing and speaking practice.",
      "Technical data: device type, browser, approximate usage logs, and service-worker cache for offline use.",
      "We do not collect real patient health records. All clinical scenarios are fictional.",
    ],
  },
  {
    id: "lawful-basis",
    title: "Lawful basis",
    body: [
      "Contract: providing the study platform you sign up for.",
      "Consent: optional features such as AI processing and analytics cookies.",
      "Legitimate interest: security, fraud prevention, and improving the learning experience.",
    ],
  },
  {
    id: "ai-processing",
    title: "AI processing",
    body: [
      "Writing and speaking text may be sent to trusted AI providers to generate feedback.",
      "We configure providers so your content is not used to train public models where we can opt out.",
      "Do not include identifiable patient information in practice tasks.",
    ],
  },
  {
    id: "storage",
    title: "Storage & retention",
    body: [
      "Server data is hosted in the EU where configured.",
      "Imported OET audio/PDF files stay on your device — we never upload them to our servers.",
      "Practice attempts are retained for up to 12 months unless you delete your account sooner.",
      "Local study data on your device remains until you clear site data or uninstall the app.",
    ],
  },
  {
    id: "sharing",
    title: "Sharing with processors",
    body: [
      "We use trusted processors for authentication, hosting, and AI feedback.",
      "Each processor has a Data Processing Agreement where required.",
      "We do not sell your personal data.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "Access, rectify, or erase your data.",
      "Export your data in a portable format (available from Profile).",
      "Withdraw consent for optional processing.",
      "Lodge a complaint with your supervisory authority (e.g. ICO in the UK).",
      `To exercise rights, email ${SUPPORT_EMAIL}.`,
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "Essential cookies support authentication and security.",
      "Optional analytics cookies require your consent — see our Cookie Policy.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "OET Coach is designed for adult healthcare professionals. We do not knowingly collect data from anyone under 16.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    body: [`Last updated: ${LAST_UPDATED}. We will notify registered users of material changes via email or in-app notice.`],
  },
];
