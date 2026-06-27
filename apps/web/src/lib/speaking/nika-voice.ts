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
  return `In this role-play Nika is the ${config.interlocutorRole.toLowerCase()}. ${config.personaSummary} Take your turn naturally — Nika listens and replies like a real consultation.`;
}

function formatPersonaConcerns(concerns: string[], fallback: string): string {
  if (concerns.length === 0) return fallback;
  return concerns
    .map((concern) => {
      const trimmed = concern.trim();
      if (!trimmed) return "";
      const sentence = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      return sentence.endsWith(".") ? sentence : `${sentence}.`;
    })
    .filter(Boolean)
    .join(" ");
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
    personaSummary: formatPersonaConcerns(
      card.hiddenFromCandidate.patientConcerns,
      card.setting,
    ),
  };
}
