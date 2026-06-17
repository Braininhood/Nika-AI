"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ListeningAccent } from "@/content/listening/types";
import {
  speakTranscript,
  speechSynthesisSupported,
  stopSpeaking,
  waitForVoices,
} from "@/lib/media/browser-tts";

interface TranscriptSpeechPlayerProps {
  transcript: string;
  accent?: ListeningAccent;
  label?: string;
  examMode?: boolean;
  onEnded?: () => void;
}

export function TranscriptSpeechPlayer({
  transcript,
  accent = "UK",
  label,
  examMode = false,
  onEnded,
}: TranscriptSpeechPlayerProps) {
  const [voicesReady, setVoicesReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef({ cancelled: false });

  useEffect(() => {
    if (!speechSynthesisSupported()) return;
    void waitForVoices().then((voices) => {
      setVoicesReady(voices.length > 0);
      if (voices.length === 0) {
        setError("No speech voices found. Try Chrome/Edge or import an MP3.");
      }
    });
    return () => {
      cancelRef.current.cancelled = true;
      stopSpeaking();
    };
  }, []);

  const stop = useCallback(() => {
    cancelRef.current.cancelled = true;
    stopSpeaking();
    setPlaying(false);
  }, []);

  const play = useCallback(async () => {
    if (!speechSynthesisSupported()) {
      setError("Speech not supported. Import an MP3 on the Import page.");
      return;
    }
    if (!transcript.trim()) {
      setError("No transcript for this block.");
      return;
    }
    if (examMode && playedOnce) {
      setError("Exam mode: audio can only be played once.");
      return;
    }

    cancelRef.current = { cancelled: false };
    setError(null);
    setPlaying(true);

    try {
      await speakTranscript(transcript, {
        accent,
        signal: cancelRef.current,
        onEnd: () => {
          setPlaying(false);
          if (!cancelRef.current.cancelled) {
            setPlayedOnce(true);
            onEnded?.();
          }
        },
      });
    } catch {
      setPlaying(false);
      setError(
        "Could not play narration. Use Chrome or Edge, allow sound, or import official MP3.",
      );
    }
  }, [accent, examMode, onEnded, playedOnce, transcript]);

  if (!speechSynthesisSupported()) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 p-4 text-sm text-ink-soft">
        Browser narration unavailable. Import your official MP3 on the Import page.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {label && <p className="text-xs font-semibold uppercase text-brand-primary">{label}</p>}
      <p className="mt-1 text-xs text-ink-soft">
        Practice narration reads the consultation script aloud ({accent} voice). For official OET
        audio, use Import.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void (playing ? stop() : play())}
          disabled={!voicesReady || !transcript.trim() || (examMode && playedOnce && !playing)}
          className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
        >
          {playing ? "Stop" : playedOnce && examMode ? "Played" : "Play consultation"}
        </button>
        {examMode && <span className="text-xs text-ink-soft">Exam mode · one play</span>}
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
