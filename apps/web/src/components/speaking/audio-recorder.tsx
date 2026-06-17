"use client";

import { useEffect, useRef, useState } from "react";

import { saveSpeakingRecording } from "@/lib/speaking/recording-storage";
import { createLiveSttSession, sttSupported } from "@/lib/speaking/stt";

interface AudioRecorderProps {
  roleCardId: string;
  maxMinutes?: number;
  onComplete: (result: {
    blob: Blob;
    durationSeconds: number;
    recordingId: string;
    liveTranscript: string;
  }) => void;
}

export function AudioRecorder({
  roleCardId,
  maxMinutes = 5,
  onComplete,
}: AudioRecorderProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const sttRef = useRef<ReturnType<typeof createLiveSttSession> | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      sttRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    chunksRef.current = [];
    setLiveTranscript("");
    setElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        sttRef.current?.stop();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const saved = await saveSpeakingRecording(roleCardId, blob, elapsed);
        onComplete({
          blob,
          durationSeconds: elapsed,
          recordingId: saved.id,
          liveTranscript,
        });
      };

      if (sttSupported()) {
        sttRef.current = createLiveSttSession(
          (text) => setLiveTranscript(text),
          (text) => setLiveTranscript(text),
        );
        sttRef.current?.start();
      }

      recorder.start(1000);
      setStatus("recording");

      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= maxMinutes * 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied or unavailable. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setStatus("stopped");
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="font-semibold text-ink">Record role-play</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Max {maxMinutes} minutes · saved on your device · {sttSupported() ? "live captions on" : "add transcript manually after"}
      </p>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex items-center gap-4">
        <span
          className={`text-2xl font-bold tabular-nums ${status === "recording" ? "text-danger" : "text-ink"}`}
        >
          {formatElapsed(elapsed)}
        </span>
        {status === "idle" && (
          <button
            type="button"
            onClick={() => void startRecording()}
            className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white"
          >
            Start recording
          </button>
        )}
        {status === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-xl border border-danger px-4 py-2.5 text-sm font-semibold text-danger"
          >
            Stop
          </button>
        )}
        {status === "stopped" && (
          <span className="text-sm text-success">Recording saved</span>
        )}
      </div>

      {status === "recording" && liveTranscript && (
        <p className="mt-3 rounded-lg bg-surface-muted/50 p-3 text-xs text-ink-soft">
          Live: {liveTranscript}
        </p>
      )}
    </section>
  );
}
