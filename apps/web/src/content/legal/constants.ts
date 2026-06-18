export const LEGAL_ENTITY = "Wisdomwave Hub Ltd";
export const PRODUCT_NAME = "OET Coach";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nika-oet.fun";

/** Monitored — customer support, privacy requests, accessibility. */
export const SUPPORT_EMAIL = "support@nika-oet.fun";

/** Partnerships, product info, reminders (future outbound). */
export const INFO_EMAIL = "info@nika-oet.fun";

/** Automated only — magic links, payments, reminders. Not monitored. */
export const NOREPLY_EMAIL = "noreply@nika-oet.fun";

export const LAST_UPDATED = "18 June 2026";

export const AFFILIATION_LINE =
  "Not affiliated with OET or Cambridge Boxhill Language Assessment.";

/** Short line for hero / materials headers. */
export const CONTENT_DISCLAIMER_SHORT =
  "Educational content for OET preparation and healthcare English — informed by public OET guidance. " +
  AFFILIATION_LINE;

/** Full content & materials disclaimer — footer, About, legal. */
export const CONTENT_DISCLAIMER =
  "Practice tasks, scenarios, and coach notes in OET Coach are original educational materials " +
  "for OET exam preparation and medical English learning. Where we reference official OET " +
  "resources, we link to freely available public guidance on oet.com — we do not host " +
  "copyrighted official test papers or audio on our servers. " +
  AFFILIATION_LINE +
  " This is not medical advice.";

export const SHORT_DISCLAIMER =
  "OET Coach helps you prepare for the Occupational English Test. " +
  AFFILIATION_LINE +
  " This is not medical advice. Confirm exam requirements with your regulator and oet.com.";

export const SIGNUP_DISCLAIMER =
  "OET Coach is an educational tool for English exam preparation. Scenarios are fictional. " +
  "AI feedback is automated and may contain errors — always verify with official OET materials " +
  "and qualified tutors. OET Coach does not guarantee exam results. Not for use in real patient care.";

export const AI_DISCLAIMER =
  "Your writing and speaking practice may be processed by AI services to generate feedback. " +
  "Do not include real patient identifiable information in practice tasks.";

export const SCORE_DISCLAIMER =
  "Mock scores and AI grade estimates are approximate. Only official OET results count for registration.";
