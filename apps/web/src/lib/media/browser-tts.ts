/** Browser Speech Synthesis — free, no API keys. Used for listening narration + Nika voice. */

import type { ListeningAccent } from "@/content/listening/types";

const ACCENT_VOICE_HINTS: Record<string, string[]> = {
  UK: ["en-gb", "british", "uk english"],
  AU: ["en-au", "australian"],
  US: ["en-us", "american"],
  IE: ["en-ie", "irish"],
  NZ: ["en-nz", "new zealand"],
  CA: ["en-ca", "canadian"],
  mixed: ["en-gb", "en-au", "en"],
};

/** Known female system voices (Windows, macOS, Chrome, Edge). */
const FEMALE_VOICE_HINTS = [
  "female",
  "zira",
  "samantha",
  "karen",
  "hazel",
  "sonia",
  "libby",
  "jenny",
  "aria",
  "victoria",
  "moira",
  "fiona",
  "tessa",
  "susan",
  "heather",
  "serena",
  "natasha",
  "emma",
  "lisa",
  "kate",
  "olivia",
  "sara",
  "michelle",
  "laura",
  "anna",
  "alice",
  "maria",
];

const MALE_VOICE_HINTS = [
  "male",
  "david",
  "mark",
  "james",
  "daniel",
  "guy",
  "ryan",
  "thomas",
  "george",
  "richard",
  "lee",
  "gordon",
];

export type VoiceProfile = "default" | "nika";

export function speechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Chrome/Edge often need a poll — voiceschanged may not fire on first load. */
export function waitForVoices(timeoutMs = 2500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!speechSynthesisSupported()) {
      resolve([]);
      return;
    }
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }

    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      const voices = synth.getVoices();
      if (voices.length > 0 || Date.now() >= deadline) {
        synth.removeEventListener("voiceschanged", tick);
        resolve(voices);
        return;
      }
      requestAnimationFrame(tick);
    };

    synth.addEventListener("voiceschanged", tick);
    tick();
  });
}

function voiceScore(
  voice: SpeechSynthesisVoice,
  accentHints: string[],
  profile: VoiceProfile,
): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  for (const hint of accentHints) {
    if (lang.includes(hint) || name.includes(hint)) score += 12;
  }

  if (!lang.startsWith("en")) score -= 40;

  if (profile === "nika") {
    if (FEMALE_VOICE_HINTS.some((h) => name.includes(h))) score += 60;
    if (MALE_VOICE_HINTS.some((h) => name.includes(h))) score -= 45;
    if (name.includes("google") && name.includes("female")) score += 55;
  }

  if (voice.default && profile === "default") score += 3;

  return score;
}

export function pickVoiceForAccent(
  accent: ListeningAccent = "UK",
  profile: VoiceProfile = "default",
): SpeechSynthesisVoice | null {
  if (!speechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const key = accent === "mixed" ? "mixed" : accent;
  const hints = ACCENT_VOICE_HINTS[key] ?? ACCENT_VOICE_HINTS.UK!;

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const voice of voices) {
    const score = voiceScore(voice, hints, profile);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  if (best && profile === "nika" && bestScore < 10) {
    const anyFemale = voices.find((v) =>
      FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h)),
    );
    if (anyFemale) return anyFemale;
  }

  return best ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

/** Nika — warm female English voice (browser-dependent). */
export function pickNikaVoice(accent: ListeningAccent = "AU"): SpeechSynthesisVoice | null {
  return pickVoiceForAccent(accent, "nika");
}

function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (parts ?? [trimmed]).map((p) => p.trim()).filter(Boolean);
}

function speakChunk(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
  pitch: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("speech_error"));
    synth.speak(utterance);
    synth.resume();
  });
}

export interface SpeakOptions {
  accent?: ListeningAccent;
  rate?: number;
  /** `nika` = female companion voice; `default` = accent-matched narration */
  voiceProfile?: VoiceProfile;
  onStart?: () => void;
  onEnd?: () => void;
  signal?: { cancelled: boolean };
}

/** Speak full transcript in sentence chunks — reliable on Windows Chrome/Edge. */
export async function speakTranscript(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!speechSynthesisSupported()) {
    throw new Error("unsupported");
  }

  const chunks = chunkText(text);
  if (!chunks.length) throw new Error("empty");

  await waitForVoices();
  const profile = options.voiceProfile ?? "default";
  const voice = pickVoiceForAccent(options.accent ?? "UK", profile);
  const rate = options.rate ?? (profile === "nika" ? 0.94 : 0.92);
  const pitch = profile === "nika" ? 1.08 : 1;
  const synth = window.speechSynthesis;

  synth.cancel();
  await new Promise((r) => setTimeout(r, 50));

  options.onStart?.();

  try {
    for (const chunk of chunks) {
      if (options.signal?.cancelled) break;
      await speakChunk(chunk, voice, rate, pitch);
    }
  } finally {
    options.onEnd?.();
  }
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}
