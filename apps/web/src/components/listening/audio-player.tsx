"use client";

import { useEffect, useRef, useState } from "react";

import { revokeBlobUrl } from "@/lib/media/opfs";

interface AudioPlayerProps {
  src: string | null;
  label?: string;
  examMode?: boolean;
  onEnded?: () => void;
}

export function AudioPlayer(props: AudioPlayerProps) {
  if (!props.src) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 p-4 text-sm text-ink-soft">
        Audio not available. Download the offline pack or import your MP3.
      </div>
    );
  }

  return <AudioPlayerInner key={props.src} {...props} src={props.src} />;
}

function AudioPlayerInner({
  src,
  label,
  examMode = false,
  onEnded,
}: AudioPlayerProps & { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (src.startsWith("blob:")) revokeBlobUrl(src);
    };
  }, [src]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !src) return;

    if (examMode && playedOnce && el.currentTime >= el.duration - 0.5) {
      setError("Exam mode: audio can only be played once.");
      return;
    }

    try {
      if (playing) {
        el.pause();
        setPlaying(false);
      } else {
        await el.play();
        setPlaying(true);
      }
    } catch {
      setError("Could not play audio. Check offline pack or import.");
    }
  };

  const handleEnded = () => {
    setPlaying(false);
    setPlayedOnce(true);
    onEnded?.();
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {label && <p className="text-xs font-semibold uppercase text-brand-primary">{label}</p>}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleEnded}
        onError={() => setError("Audio failed to load.")}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => void togglePlay()}
          disabled={examMode && playedOnce && !playing}
          className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {playing ? "Pause" : playedOnce && examMode ? "Played" : "Play"}
        </button>
        <span className="text-xs text-ink-soft">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        {examMode && (
          <span className="text-xs text-ink-soft">Exam mode · one play</span>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={(e) => {
          const el = audioRef.current;
          if (el) el.currentTime = Number(e.target.value);
        }}
        className="mt-3 w-full accent-brand-primary"
        aria-label="Audio progress"
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
