"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
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
    <div className="flex flex-col gap-4">
      <CollapsibleSection
        title="Nika live role-play"
        subtitle="Practise this scenario with Nika"
        defaultOpen={false}
        variant="accent"
      >
        <p className="text-sm leading-relaxed text-ink-soft">{preview}</p>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          <li className="flex gap-2">
            <span className="text-forest" aria-hidden>
              ✓
            </span>
            <span>
              Nika voices the {card.interlocutorRole.toLowerCase()} — respond as you would in the exam
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest" aria-hidden>
              ✓
            </span>
            <span>
              {fullLive
                ? "Speak into your mic when it is your turn"
                : "Type your lines if your mic is unavailable"}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest" aria-hidden>
              ✓
            </span>
            <span>Full coaching feedback when you finish the conversation</span>
          </li>
        </ul>
      </CollapsibleSection>
      <button
        type="button"
        disabled={!tts}
        onClick={onStartLive}
        className="w-full min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {tts ? "Start live role-play with Nika →" : "Voice not supported in this browser"}
      </button>
    </div>
  );
}
