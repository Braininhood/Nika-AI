"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  speechSynthesisSupported,
  speakTranscript,
  stopSpeaking,
} from "@/lib/media/browser-tts";

type DiagnosticListenPlayerProps = {
  script: string;
};

export function DiagnosticListenPlayer({ script }: DiagnosticListenPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const cancelRef = useRef({ cancelled: false });
  const supported = speechSynthesisSupported();

  useEffect(() => {
    return () => {
      cancelRef.current.cancelled = true;
      stopSpeaking();
    };
  }, [script]);

  const play = useCallback(async () => {
    if (!supported || playing) return;
    cancelRef.current.cancelled = false;
    setPlaying(true);
    try {
      await speakTranscript(script, {
        accent: "UK",
        rate: 0.9,
        signal: cancelRef.current,
        onEnd: () => {
          setPlaying(false);
          setPlayed(true);
        },
      });
    } catch {
      setPlaying(false);
    }
  }, [playing, script, supported]);

  const stop = () => {
    cancelRef.current.cancelled = true;
    stopSpeaking();
    setPlaying(false);
  };

  if (!supported) {
    return (
      <p className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-ink-soft">
        Audio not supported in this browser — read the question text carefully.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-3">
      <p className="text-xs font-medium text-brand-primary">Listen first — like the real OET</p>
      <p className="mt-1 text-xs text-ink-soft">
        Play the clip, then choose your answer. You can replay before submitting.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void play()}
          disabled={playing}
          className="min-h-11 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
        >
          {playing ? "Playing…" : played ? "Replay audio" : "Play audio"}
        </button>
        {playing && (
          <button
            type="button"
            onClick={stop}
            className="min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
