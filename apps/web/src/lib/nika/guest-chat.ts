/** Logged-out Nika: project FAQ only, max 2 replies per browser session (sessionStorage). */

import { INFO_EMAIL, SUPPORT_EMAIL } from "@/content/legal/constants";

import type { NikaChatResponse } from "./chat";

export const GUEST_MAX_TURNS = 2;
const STORAGE_KEY = "nika-guest-turns";

export const GUEST_WELCOME_TEXT =
  "Hi — I'm **Nika**, your OET study companion. Ask me about **OET Coach** — what it is, how sign-in works, offline study, support contact, or how I can help after you join.\n\nSign in for personalised plans, vocabulary explain/translate, quizzes, and full AI coaching.";

export const GUEST_LOGIN_PROMPT =
  "You've used your **2 preview questions** for this visit.\n\n**Sign in or create a free account** for personalised study plans, vocabulary help, regulator guidance, and unlimited coaching from me.\n\n[Get started →](/login)";

export const GUEST_SIGN_IN_FOR_FEATURE =
  "That needs a **signed-in account** — I can explain terms, build your study plan, and coach all four OET skills once you're in.\n\n[Sign in or sign up →](/login) (free magic link or Google)";

const PROJECT_FAQ: { pattern: RegExp; reply: string }[] = [
  {
    pattern:
      /\b(your\s+name|who\s+are\s+you|what\s+are\s+you|what\s+(is|do)\s+you\s+do|what\s+you\s+do|introduce\s+yourself)\b/i,
    reply:
      "I'm **Nika** — your OET study companion in OET Coach. I help healthcare professionals prepare for the OET exam with adaptive daily plans, vocabulary coaching, regulator guidance, and practice across Listening, Reading, Writing, and Speaking.\n\n**Sign in** for personalised coaching, or email human support at **support@nika-oet.fun**.",
  },
  {
    pattern:
      /\b(contact|support|help\s+desk|email\s+you|reach\s+you|talk\s+to|customer\s+service|get\s+in\s+touch|how\s+to\s+contact)\b/i,
    reply: `**Human support:** [${SUPPORT_EMAIL}](mailto:${SUPPORT_EMAIL}) — account help, bugs, privacy, accessibility.\n\n**Info & partnerships:** [${INFO_EMAIL}](mailto:${INFO_EMAIL})\n\nAutomated sign-in emails come from **noreply@nika-oet.fun** — that inbox is not monitored.`,
  },
  {
    pattern:
      /\b(what is|tell me about|explain|about)\b.{0,50}\b(oet coach|this app|the app|platform|website|web\s*site|this\s+site)\b/i,
    reply:
      "**OET Coach** (nika-oet.fun) is personalised OET exam preparation for healthcare professionals — adaptive daily plans, all four skills, offline PWA, and me (Nika) as your AI study coach.\n\nSign in to start with a diagnostic and your own Skill Map.",
  },
  {
    pattern: /\b(who is|what is)\b.{0,20}\bnika\b/i,
    reply:
      "I'm **Nika** — your OET study companion. I help with exam format, regulator requirements (GPhC, GMC, NMC, etc.), vocabulary, and a plan that adapts after every quiz.\n\nSign in to unlock personalised coaching.",
  },
  {
    pattern: /\b(sign\s*up|sign\s*in|log\s*in|register|get started|create an account|magic link|google)\b/i,
    reply:
      "Tap **Get started** or open [Sign in](/login) — use a **magic link** to your email or **Google**. No password needed.\n\nAfter onboarding you'll get a diagnostic, daily plan, and full access to me.",
  },
  {
    pattern: /\b(offline|pwa|install|phone|tablet|without internet)\b/i,
    reply:
      "OET Coach works **offline** as a PWA — install from your browser on phone or tablet. Plans, flashcards, and imported listening audio stay on your device; AI coaching needs internet.\n\nSign in to sync progress securely.",
  },
  {
    pattern: /\b(free|cost|price|pay|subscription)\b/i,
    reply:
      "Create an account to explore the platform. Core study features are built for accessible prep — sign in to see your plan and daily AI coaching quota.\n\n[Get started →](/login)",
  },
  {
    pattern: /\b(profession|nursing|pharmacy|medicine|dentist|physio|12)\b/i,
    reply:
      "We support **12 healthcare professions** — pharmacy, nursing, medicine, dentistry, physiotherapy, and more — with scenarios matched to your **regulator** and destination country.\n\nSign in and pick yours during onboarding.",
  },
  {
    pattern:
      /\b(how (does|do)|how it works|features?|what can you do|what do you offer|what can i do)\b/i,
    reply:
      "**How it works:** sign in → onboarding → short diagnostic → adaptive daily plan → practice all four OET skills → mock exams when ready.\n\nI adapt silently after every quiz. **Sign in** to start — preview chat is limited to 2 questions.",
  },
  {
    pattern: /\b(oet|exam|listening|reading|writing|speaking|mock|diagnostic)\b/i,
    reply:
      "OET Coach covers **Listening, Reading, Writing, and Speaking** with timed modes, profession-specific content, vocabulary tools, and mock exams.\n\nSign in for a personalised path based on your diagnostic — I can't build your plan until you're logged in.",
  },
];

/** Vocabulary / personalised coaching — requires sign-in. */
const SIGNED_IN_ONLY =
  /\b(translate|meaning|mean|vocab|ibuprofen|paracetamol|naproxen|quiz|assessment|my plan|study plan|skill map|gphc|gmc|nmc|regulator|feedback|writing feedback)\b|[-–—]\s*(mean|means|translate)\s*\??\s*$/i;

const GREETING = /^(hi|hello|hey|good\s+(morning|afternoon|evening)|thanks|thank you)\b/i;

export function getGuestTurnCount(): number {
  if (typeof sessionStorage === "undefined") return 0;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function incrementGuestTurnCount(): number {
  const next = getGuestTurnCount() + 1;
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, String(next));
  }
  return next;
}

export function isGuestLimitReached(): boolean {
  return getGuestTurnCount() >= GUEST_MAX_TURNS;
}

export function guestWelcomeMessage() {
  return {
    id: "welcome" as const,
    role: "nika" as const,
    text: GUEST_WELCOME_TEXT,
  };
}

export function guestLimitMessage() {
  return {
    id: "guest-limit",
    role: "nika" as const,
    text: GUEST_LOGIN_PROMPT,
    refused: true,
  };
}

function matchProjectFaq(message: string): string | null {
  const text = message.trim();
  for (const { pattern, reply } of PROJECT_FAQ) {
    if (pattern.test(text)) return reply;
  }
  if (GREETING.test(text)) {
    return `Hello! Ask me about **OET Coach**, sign-in, offline study, or contact **${SUPPORT_EMAIL}**. For vocabulary and your personal plan, **sign in** first.`;
  }
  return null;
}

/** Reply for logged-out users (no API, no Dexie history). */
export function guestNikaReply(message: string): NikaChatResponse {
  if (isGuestLimitReached()) {
    return {
      reply: GUEST_LOGIN_PROMPT,
      refused: true,
      sources: [],
      provider: "guest_limit",
    };
  }

  const text = message.trim();

  if (SIGNED_IN_ONLY.test(text)) {
    incrementGuestTurnCount();
    return {
      reply: GUEST_SIGN_IN_FOR_FEATURE,
      refused: true,
      sources: [],
      provider: "guest_gate",
    };
  }

  const faq = matchProjectFaq(text);
  if (faq) {
    const turns = incrementGuestTurnCount();
    const suffix =
      turns >= GUEST_MAX_TURNS
        ? `\n\n_${GUEST_MAX_TURNS} preview questions used — [sign in](/login) for full coaching._`
        : `\n\n_${GUEST_MAX_TURNS - turns} preview question${GUEST_MAX_TURNS - turns === 1 ? "" : "s"} left this session._`;
    return {
      reply: faq + suffix,
      refused: false,
      sources: [],
      provider: "guest_faq",
    };
  }

  incrementGuestTurnCount();
  return {
    reply:
      `I can answer **general questions about OET Coach** while you're logged out — try “What is OET Coach?”, “Who are you?”, “How do I sign in?”, or “How do I contact support?”\n\nHuman help: **${SUPPORT_EMAIL}**. For vocabulary and your study plan, **[sign in](/login)** first.`,
    refused: true,
    sources: [],
    provider: "guest_scope",
  };
}
