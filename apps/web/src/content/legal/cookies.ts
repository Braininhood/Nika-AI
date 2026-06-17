import type { LegalSection } from "@/components/legal/legal-document";
import { LAST_UPDATED } from "./constants";

export const cookieSections: LegalSection[] = [
  {
    id: "what",
    title: "What are cookies?",
    body: [
      "Cookies are small text files stored on your device. We also use similar technologies such as local storage for preferences and offline study data.",
    ],
  },
  {
    id: "essential",
    title: "Essential cookies & storage",
    body: [
      "Authentication session — keeps you signed in.",
      "Security tokens — protects your account.",
      "Service worker cache — enables offline study.",
      "Local storage on your device — profile, drafts, and progress.",
      "These are necessary for the service and do not require consent under GDPR.",
    ],
  },
  {
    id: "optional",
    title: "Optional cookies",
    body: [
      "Analytics — helps us understand feature usage (only if you accept).",
      "Theme preference — remembers light/dark mode choice.",
    ],
  },
  {
    id: "manage",
    title: "Managing preferences",
    body: [
      "Use the cookie banner to accept or reject optional cookies.",
      "Change your mind anytime via the Cookie settings link in the footer.",
      "You can also clear cookies in your browser settings — note this may sign you out.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party cookies",
    body: [
      "Google OAuth may set cookies during sign-in — governed by Google's policy.",
      "We do not use advertising trackers.",
    ],
  },
  {
    id: "updated",
    title: "Updates",
    body: [`Last updated: ${LAST_UPDATED}.`],
  },
];
