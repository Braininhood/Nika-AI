"use client";

import type { RolePlayCard } from "@/content/speaking";
import { nikaVoiceAvailable, nikaVoiceTtsOnly, buildNikaVoicePreview, buildNikaVoiceConfig } from "@/lib/speaking/nika-voice";

interface NikaVoicePreviewProps {
  card: RolePlayCard;
  onStartLive: () => void;
}

export function NikaVoicePreview({ card, onStartLive }: NikaVoicePreviewProps) {
  const tts = nikaVoiceTtsOnly();
  const fullLive = nikaVoiceAvailable();
  const preview = buildNikaVoicePreview(buildNikaVoiceConfig(card));

  return (
    <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/25 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
        Nika live voice · free
      </p>
      <h3 className="mt-1 font-semibold text-ink">Speak with Nika in real time</h3>
      <p className="mt-2 text-sm text-ink-soft">{preview}</p>
      <ul className="mt-3 space-y-1 text-xs text-ink-soft">
        <li>✓ Nika speaks with a warm female voice (browser TTS — $0)</li>
        <li>✓ You respond by mic{fullLive ? "" : " or typing"}</li>
        <li>✓ Smarter replies when you are online</li>
      </ul>
      <button
        type="button"
        disabled={!tts}
        onClick={onStartLive}
        className="mt-4 w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40 sm:w-auto"
      >
        {tts ? "Start live role-play with Nika →" : "Voice not supported in this browser"}
      </button>
    </section>
  );
}
