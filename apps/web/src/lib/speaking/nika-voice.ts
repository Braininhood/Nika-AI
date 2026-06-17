/**
 * Nika live voice role-play — browser TTS + STT, free tier (no voice API).
 */

import type { OetAccent } from "@/content/speaking/types";
import type { RolePlayCard } from "@/content/speaking";

export type NikaVoiceSessionState =
  | "idle"
  | "connecting"
  | "nika-speaking"
  | "user-speaking"
  | "thinking"
  | "ended";

export interface NikaVoiceMessage {
  role: "nika" | "user";
  text: string;
  timestamp: number;
}

export interface NikaVoiceConfig {
  roleCardId: string;
  profession: string;
  interlocutorRole: string;
  personaSummary: string;
}

export const MAX_LIVE_TURNS = 8;

export function nikaVoiceAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const hasTts = "speechSynthesis" in window;
  const w = window as Window & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  const hasStt = Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
  return hasTts && hasStt;
}

export function nikaVoiceTtsOnly(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function buildNikaVoicePreview(config: NikaVoiceConfig): string {
  return `Nika plays the ${config.interlocutorRole.toLowerCase()} — ${config.personaSummary}. Use your mic for live turn-taking; Nika responds with voice (browser TTS, free).`;
}

/** Map role-card accent to BCP-47 for STT. */
export function sttLangForAccent(accent?: OetAccent): string {
  const map: Record<OetAccent, string> = {
    UK: "en-GB",
    AU: "en-AU",
    US: "en-US",
    IE: "en-IE",
    NZ: "en-NZ",
    CA: "en-CA",
    mixed: "en-AU",
  };
  return map[accent ?? "AU"] ?? "en-AU";
}

export function accentForTts(accent?: OetAccent): "UK" | "AU" | "US" | "IE" | "NZ" | "CA" {
  if (!accent || accent === "mixed") return "AU";
  return accent;
}

export function buildNikaVoiceConfig(card: RolePlayCard): NikaVoiceConfig {
  return {
    roleCardId: card.id,
    profession: card.profession,
    interlocutorRole: card.interlocutorRole,
    personaSummary: card.hiddenFromCandidate.patientConcerns.join("; ") || card.setting,
  };
}
