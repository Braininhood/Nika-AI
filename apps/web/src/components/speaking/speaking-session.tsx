"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AccentContextBanner } from "@/components/content/accent-context-banner";
import type { RolePlayCard } from "@/content/speaking";
import { useAuth } from "@/lib/auth/auth-provider";
import { CLINICAL_CHECKLIST } from "@/lib/speaking/clinical-checklist";
import { analyseTranscript } from "@/lib/speaking/analyse-transcript";
import { emptyPrepWorksheet, type PrepWorksheet } from "@/lib/speaking/exam-guide";
import { submitSpeakingAttempt } from "@/lib/speaking/submit-attempt";

import { AudioRecorder } from "./audio-recorder";
import { ClinicalChecklistPanel } from "./clinical-checklist-panel";
import { ModelDialoguePanel } from "./model-dialogue-panel";
import { NikaVoiceLivePanel } from "./nika-voice-live";
import { NikaVoicePreview } from "./nika-voice-preview";
import { PrepTimer } from "./prep-timer";
import { PrepWorksheetForm } from "./prep-worksheet";
import { SpeakingStudyGuidePanel } from "./speaking-exam-briefing";
import { SpeakingResultsPanel } from "./speaking-results-panel";

type SessionPhase = "card" | "prep" | "nika-live" | "record" | "review" | "done";

interface SpeakingSessionProps {
  card: RolePlayCard;
  backHref: string;
}

export function SpeakingSession({ card, backHref }: SpeakingSessionProps) {
  const { session } = useAuth();
  const [phase, setPhase] = useState<SessionPhase>("card");
  const [prepSheet, setPrepSheet] = useState<PrepWorksheet>(emptyPrepWorksheet);
  const [transcript, setTranscript] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [recordingId, setRecordingId] = useState<string | undefined>();
  const [conversationLog, setConversationLog] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitSpeakingAttempt>> | null>(
    null,
  );

  const checklistDefaults = useMemo(() => {
    const ratings: Record<string, boolean> = {};
    for (const item of CLINICAL_CHECKLIST) ratings[item.id] = false;
    return ratings;
  }, []);

  const [checklistRatings, setChecklistRatings] = useState(checklistDefaults);

  const transcriptAnalysis = useMemo(
    () => (transcript.trim() ? analyseTranscript(card, transcript, durationSeconds) : null),
    [card, transcript, durationSeconds],
  );

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklistRatings((prev) => ({ ...prev, [id]: checked }));
  };

  const applyTranscriptSuggestions = () => {
    if (!transcriptAnalysis) return;
    setChecklistRatings((prev) => {
      const next = { ...prev };
      for (const [id, suggested] of Object.entries(transcriptAnalysis.checklistSuggestions)) {
        if (suggested) next[id] = true;
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitSpeakingAttempt({
      card,
      transcript,
      checklistRatings,
      durationSeconds,
      recordingId,
      accessToken: session?.access_token,
      mode: conversationLog ? "nika_live" : "practice",
    });
    setResult(res);
    setPhase("done");
    setSubmitting(false);
  };

  if (result && phase === "done") {
    return <SpeakingResultsPanel card={card} result={result} backHref={backHref} />;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Speaking
      </Link>

      <header>
        <p className="text-[10px] font-semibold uppercase text-brand-primary">
          {card.candidateRole} · {card.interlocutorRole}
        </p>
        <h1 className="mt-1 text-xl font-bold text-ink">{card.setting}</h1>
        <p className="mt-1 text-sm text-ink-soft">{card.cardText.overview}</p>
      </header>

      <AccentContextBanner
        variant="speaking"
        patientAccent={card.patientAccent}
        accentContext={card.accentContext}
      />

      {phase === "card" && (
        <>
          <RoleCardPanel card={card} />
          <ModelDialoguePanel lines={card.modelDialogue} />
          <NikaVoicePreview card={card} onStartLive={() => setPhase("nika-live")} />
          <SpeakingStudyGuidePanel compact />
          <button
            type="button"
            onClick={() => setPhase("prep")}
            className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Classic prep + record →
          </button>
        </>
      )}

      {phase === "nika-live" && (
        <>
          <RoleCardPanel card={card} compact />
          <NikaVoiceLivePanel
            card={card}
            accessToken={session?.access_token}
            onCancel={() => setPhase("card")}
            onComplete={({ candidateTranscript, conversationLog: log, durationSeconds: dur }) => {
              setTranscript(candidateTranscript);
              setConversationLog(log);
              setDurationSeconds(dur);
              setPhase("review");
            }}
          />
        </>
      )}

      {phase === "prep" && (
        <>
          <PrepTimer
            totalMinutes={card.prepMinutes}
            onExpire={() => setPhase("record")}
          />
          <PrepWorksheetForm value={prepSheet} onChange={setPrepSheet} />
          <button
            type="button"
            onClick={() => setPhase("record")}
            className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Skip to recording →
          </button>
        </>
      )}

      {phase === "record" && (
        <>
          <RoleCardPanel card={card} compact />
          <AudioRecorder
            roleCardId={card.id}
            maxMinutes={card.durationMinutes}
            onComplete={({ durationSeconds: dur, recordingId: rid, liveTranscript }) => {
              setDurationSeconds(dur);
              setRecordingId(rid);
              setTranscript(liveTranscript);
              setPhase("review");
            }}
          />
        </>
      )}

      {phase === "review" && (
        <>
          {conversationLog && (
            <section className="rounded-2xl border border-border bg-surface-muted/30 p-4 text-xs">
              <h3 className="font-semibold text-ink">Live conversation log</h3>
              <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-sans text-ink-soft">{conversationLog}</pre>
            </section>
          )}
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="font-semibold text-ink">Transcript</h3>
            <p className="mt-1 text-xs text-ink-soft">
              Edit or add notes — used for task + ICE analysis and AI feedback
            </p>
            <textarea
              className="mt-3 w-full rounded-xl border border-border bg-surface-muted/30 px-3 py-2 text-sm"
              rows={6}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your role-play transcript…"
            />
            {transcriptAnalysis && (
              <button
                type="button"
                onClick={applyTranscriptSuggestions}
                className="mt-2 text-xs text-brand-primary hover:underline"
              >
                Apply transcript suggestions to checklist
              </button>
            )}
          </section>

          <ClinicalChecklistPanel
            ratings={checklistRatings}
            suggestions={transcriptAnalysis?.checklistSuggestions}
            onChange={handleChecklistChange}
          />

          <button
            type="button"
            disabled={submitting || !transcript.trim()}
            onClick={() => void handleSubmit()}
            className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {submitting ? "Analysing…" : "Submit for feedback"}
          </button>
        </>
      )}
    </div>
  );
}

function RoleCardPanel({ card, compact }: { card: RolePlayCard; compact?: boolean }) {
  return (
    <section className="rounded-2xl border border-brand-primary/30 bg-surface p-4">
      <h3 className="font-semibold text-ink">Role card</h3>
      <p className="mt-2 text-sm text-ink">{card.cardText.patientDetails}</p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-ink-soft">
        {card.cardText.yourTasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
      {!compact && (
        <div className="mt-4 rounded-xl bg-surface-muted/40 p-3 text-xs text-ink-soft">
          <p className="font-medium text-ink">Coaching hints (not on real exam card)</p>
          <p className="mt-1">ICE: {card.coaching.iceQuestions.join(" · ")}</p>
        </div>
      )}
    </section>
  );
}
