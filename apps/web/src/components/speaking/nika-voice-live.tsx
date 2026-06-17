"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { NikaAvatar } from "@/components/nika/nika-avatar";
import type { RolePlayCard } from "@/content/speaking";
import { speakTranscript, stopSpeaking } from "@/lib/media/browser-tts";
import { localOpeningLine, fetchInterlocutorLine } from "@/lib/speaking/fetch-interlocutor-line";
import {
  buildCandidateTranscript,
  formatConversationTranscript,
  interlocutorLabel,
} from "@/lib/speaking/interlocutor-replies";
import {
  accentForTts,
  MAX_LIVE_TURNS,
  nikaVoiceAvailable,
  nikaVoiceTtsOnly,
  sttLangForAccent,
  type NikaVoiceMessage,
  type NikaVoiceSessionState,
} from "@/lib/speaking/nika-voice";
import { createLiveSttSession, sttSupported } from "@/lib/speaking/stt";

export interface NikaLiveSessionResult {
  candidateTranscript: string;
  conversationLog: string;
  messages: NikaVoiceMessage[];
  durationSeconds: number;
}

interface NikaVoiceLivePanelProps {
  card: RolePlayCard;
  accessToken?: string;
  onComplete: (result: NikaLiveSessionResult) => void;
  onCancel: () => void;
}

export function NikaVoiceLivePanel({ card, accessToken, onComplete, onCancel }: NikaVoiceLivePanelProps) {
  const [state, setState] = useState<NikaVoiceSessionState>("idle");
  const [messages, setMessages] = useState<NikaVoiceMessage[]>([]);
  const [liveText, setLiveText] = useState("");
  const [manualText, setManualText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const sttRef = useRef<ReturnType<typeof createLiveSttSession> | null>(null);
  const speakSignal = useRef({ cancelled: false });
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const interlocutor = interlocutorLabel(card);
  const sttOk = sttSupported();
  const canLive = nikaVoiceAvailable();
  const ttsOnly = nikaVoiceTtsOnly() && !sttOk;

  const speakNikaLine = useCallback(
    async (text: string) => {
      speakSignal.current.cancelled = false;
      setState("nika-speaking");
      try {
        await speakTranscript(text, {
          accent: accentForTts(card.patientAccent),
          rate: 0.93,
          voiceProfile: "nika",
          signal: speakSignal.current,
        });
      } catch {
        setError("Could not play voice — check browser speech settings.");
      }
      setState("user-speaking");
    },
    [card.patientAccent],
  );

  const appendNikaMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { role: "nika", text, timestamp: Date.now() },
    ]);
  }, []);

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let active = true;
    speakSignal.current.cancelled = false;

    void (async () => {
      setError(null);
      setState("connecting");
      setStartedAt(Date.now());
      const opener = localOpeningLine(card);
      if (!active) return;
      setMessages([{ role: "nika", text: opener, timestamp: Date.now() }]);
      speakSignal.current.cancelled = false;
      setState("nika-speaking");
      try {
        await speakTranscript(opener, {
          accent: accentForTts(card.patientAccent),
          rate: 0.93,
          voiceProfile: "nika",
          signal: speakSignal.current,
        });
      } catch {
        if (active) setError("Could not play voice — check browser speech settings.");
      }
      if (active) setState("user-speaking");
    })();

    return () => {
      active = false;
      speakSignal.current.cancelled = true;
      stopSpeaking();
      sttRef.current?.stop();
    };
  }, [card.id, card.patientAccent]);

  const startListening = () => {
    if (!sttOk) return;
    setLiveText("");
    setError(null);
    const session = createLiveSttSession(
      (interim) => setLiveText(interim),
      (final) => setLiveText(final),
      sttLangForAccent(card.patientAccent),
    );
    sttRef.current = session;
    session?.start();
  };

  const stopListening = () => {
    sttRef.current?.stop();
    sttRef.current = null;
  };

  const submitUserTurn = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || state === "nika-speaking" || state === "thinking") return;

    stopListening();
    setLiveText("");
    setManualText("");

    const userMsg: NikaVoiceMessage = {
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    const withUser = [...messagesRef.current, userMsg];
    setMessages(withUser);
    setTurnCount((c) => c + 1);

    if (withUser.filter((m) => m.role === "user").length >= MAX_LIVE_TURNS) {
      finishSession(withUser);
      return;
    }

    setState("thinking");
    const { line } = await fetchInterlocutorLine(card, withUser, accessToken);
    appendNikaMessage(line);
    await speakNikaLine(line);
  };

  const finishSession = (finalMessages?: NikaVoiceMessage[]) => {
    stopListening();
    speakSignal.current.cancelled = true;
    stopSpeaking();
    setState("ended");
    const msgs = finalMessages ?? messagesRef.current;
    const duration = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    onComplete({
      candidateTranscript: buildCandidateTranscript(msgs),
      conversationLog: formatConversationTranscript(card, msgs),
      messages: msgs,
      durationSeconds: Math.max(duration, 30),
    });
  };

  if (!nikaVoiceTtsOnly()) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-4 text-sm">
        <p className="text-ink-soft">
          Live voice needs a browser with speech synthesis. Try Chrome or Edge on desktop.
        </p>
        <button type="button" onClick={onCancel} className="mt-3 text-brand-primary hover:underline">
          ← Back
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/15 p-4">
      <div className="flex items-start gap-4">
        <NikaAvatar
          size="md"
          state={
            state === "nika-speaking"
              ? "greeting"
              : state === "thinking"
                ? "thinking"
                : state === "user-speaking"
                  ? "encouraging"
                  : "idle"
          }
          glow={0.55}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
            Live with Nika · free voice
          </p>
          <h3 className="font-semibold text-ink">
            Nika as {interlocutor} · you as {card.candidateRole}
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            Browser voice (no API cost). {sttOk ? "Tap the mic when it is your turn." : "Type your lines if mic is unavailable."}
          </p>
        </div>
      </div>

      <div
        className="mt-4 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface p-3 text-sm"
        aria-live="polite"
      >
        {messages.length === 0 && state === "connecting" && (
          <p className="text-ink-soft">Nika is starting the role-play…</p>
        )}
        {messages.map((m, i) => (
          <p
            key={`${m.timestamp}-${i}`}
            className={`overflow-safe ${m.role === "user" ? "text-ink" : "text-ink-soft"}`}
          >
            <span className="font-semibold">{m.role === "user" ? "You" : interlocutor}:</span>{" "}
            {m.text}
          </p>
        ))}
        {liveText && state === "user-speaking" && (
          <p className="italic text-brand-primary">Listening… {liveText}</p>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {state === "user-speaking" && (
        <div className="mt-4 flex flex-col gap-2">
          {sttOk ? (
            <>
              <button
                type="button"
                onClick={startListening}
                className="min-h-11 rounded-xl border border-brand-primary/40 bg-surface px-4 py-2.5 text-sm font-semibold text-brand-primary"
              >
                🎤 Start speaking
              </button>
              <button
                type="button"
                disabled={!liveText.trim()}
                onClick={() => void submitUserTurn(liveText)}
                className="min-h-11 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Done — send my line
              </button>
            </>
          ) : (
            <>
              <label className="text-xs text-ink-soft">Type your line (Safari / no mic)</label>
              <textarea
                className="w-full max-w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                rows={2}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Your response as the healthcare professional…"
              />
              <button
                type="button"
                disabled={!manualText.trim()}
                onClick={() => void submitUserTurn(manualText)}
                className="min-h-11 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Send line
              </button>
            </>
          )}
        </div>
      )}

      {(state === "nika-speaking" || state === "thinking" || state === "connecting") && (
        <p className="mt-4 text-xs text-ink-soft">
          {state === "thinking" ? "Nika is thinking…" : "Listen to Nika…"}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={state === "ended" || messages.filter((m) => m.role === "user").length === 0}
          onClick={() => finishSession()}
          className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
        >
          End & review ({turnCount}/{MAX_LIVE_TURNS} turns)
        </button>
        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            onCancel();
          }}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink-soft"
        >
          Cancel
        </button>
      </div>

      {!canLive && ttsOnly && (
        <p className="mt-2 text-xs text-ink-soft">
          Speech recognition unavailable — use typed lines. Chrome or Edge recommended for mic.
        </p>
      )}
    </section>
  );
}
