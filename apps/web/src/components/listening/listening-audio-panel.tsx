"use client";

import { useEffect, useState } from "react";

import { AudioPlayer } from "@/components/listening/audio-player";
import { TranscriptSpeechPlayer } from "@/components/listening/transcript-speech-player";
import type { ListeningBlock } from "@/content/listening";
import { bundledAudioPathForBlock, demoFrequencyForBlock } from "@/lib/listening/bundled-audio";
import { resolveBundledAudioUrl, resolveImportAudioUrl } from "@/lib/media/pack-downloader";

const MIN_USEFUL_AUDIO_SEC = 8;

interface ListeningAudioPanelProps {
  block: ListeningBlock;
  examMode?: boolean;
  importAudioId?: string;
}

export function ListeningAudioPanel({
  block,
  examMode = false,
  importAudioId,
}: ListeningAudioPanelProps) {
  const [mode, setMode] = useState<"loading" | "mp3" | "narration">("loading");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      let url: string | null = null;

      if (importAudioId) {
        url = await resolveImportAudioUrl(importAudioId);
      } else {
        const audioPath = bundledAudioPathForBlock(block);
        url = await resolveBundledAudioUrl(audioPath, {
          allowPlaceholder: true,
          placeholderFrequencyHz: demoFrequencyForBlock(block),
        });
      }

      if (cancelled) return;

      if (url) {
        const duration = await measureAudioDuration(url);
        if (!cancelled && duration >= MIN_USEFUL_AUDIO_SEC) {
          objectUrl = url;
          setAudioUrl(url);
          setMode("mp3");
          return;
        }
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      }

      setAudioUrl(null);
      setMode("narration");
    })();

    return () => {
      cancelled = true;
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [block.accent, block.part, block.bundledAudioPath, importAudioId]);

  if (mode === "loading") {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-soft">
        Loading audio…
      </div>
    );
  }

  if (mode === "mp3" && audioUrl) {
    return (
      <AudioPlayer
        src={audioUrl}
        label={
          importAudioId
            ? "Imported audio"
            : `${block.accent} accent · offline pack audio`
        }
        examMode={examMode}
      />
    );
  }

  return (
    <TranscriptSpeechPlayer
      transcript={block.transcript}
      accent={block.accent}
      label={`${block.accent} accent · practice narration`}
      examMode={examMode}
    />
  );
}

function measureAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}
