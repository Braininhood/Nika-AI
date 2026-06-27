"use client";

import { useState } from "react";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { secondaryActionCompactClassName } from "@/components/ui/secondary-action-button";
import type { ModelDialogueLine } from "@/content/speaking";

interface ModelDialoguePanelProps {
  lines: ModelDialogueLine[];
  title?: string;
}

export function ModelDialoguePanel({ lines, title = "Model dialogue" }: ModelDialoguePanelProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const speakLine = (line: string, index: number) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.lang = "en-AU";
    utterance.onend = () => setPlayingIndex(null);
    setPlayingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const speakerLabel = (speaker: ModelDialogueLine["speaker"]) => {
    if (speaker === "candidate") return "You";
    if (speaker === "carer") return "Carer";
    return "Patient";
  };

  return (
    <CollapsibleSection
      title={title}
      subtitle="Grade B example — tap Play on any line"
      defaultOpen={false}
    >
      <ol className="space-y-3">
        {lines.map((line, index) => (
          <li
            key={index}
            className={`rounded-xl p-3 text-sm ${
              line.speaker === "candidate"
                ? "border border-brand-primary/20 bg-brand-accent-soft/20"
                : "bg-surface-muted/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase text-ink-soft">
                  {speakerLabel(line.speaker)}
                </p>
                <p className="mt-1 text-ink">{line.line}</p>
                {line.annotation && (
                  <p className="mt-1 text-xs text-brand-primary">↳ {line.annotation}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => speakLine(line.line, index)}
                className={secondaryActionCompactClassName}
                aria-label={`Play line ${index + 1}`}
              >
                {playingIndex === index ? "▶ …" : "▶ Play"}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </CollapsibleSection>
  );
}
