"use client";

import { useState } from "react";

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
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Annotated model — clinical communication markers highlighted · browser TTS playback
      </p>
      <ol className="mt-4 space-y-3">
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
                className="shrink-0 text-xs text-brand-primary hover:underline"
                aria-label={`Play line ${index + 1}`}
              >
                {playingIndex === index ? "▶ …" : "▶ Play"}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
