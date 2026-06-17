import type { RolePlayCard } from "@/content/speaking";
import { applySpeakingResult } from "@/lib/quiz/engine";
import { db } from "@/lib/db";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";
import { enqueueOutbox } from "@/lib/sync/outbox";
import { apiUrl } from "@/lib/api/base-url";

import {
  analyseTranscript,
  overallSpeakingScore,
  weakTagsFromChecklistRatings,
  type TranscriptAnalysis,
} from "./analyse-transcript";

export interface SpeakingSubmitInput {
  card: RolePlayCard;
  transcript: string;
  checklistRatings: Record<string, boolean>;
  durationSeconds: number;
  recordingId?: string;
  accessToken?: string;
      mode: "practice" | "learn" | "exam" | "nika_live";
}

export interface SpeakingSubmitResult {
  attemptId: string;
  analysis: TranscriptAnalysis;
  feedback: Record<string, unknown>;
  queuedForSync: boolean;
  skillMapUpdated: boolean;
  overallScore: number;
}

export async function submitSpeakingAttempt(
  input: SpeakingSubmitInput,
): Promise<SpeakingSubmitResult> {
  const {
    card,
    transcript,
    checklistRatings,
    durationSeconds,
    recordingId,
    accessToken,
    mode = "practice",
  } = input;

  const analysis = analyseTranscript(card, transcript, durationSeconds);
  const checklistWeakTags = weakTagsFromChecklistRatings(checklistRatings);
  const weakTags = [...new Set([...checklistWeakTags, ...analysis.weakTags])].slice(0, 5);
  const overallScore = overallSpeakingScore(checklistRatings, analysis);
  const attemptId = crypto.randomUUID();
  const profile = await loadUserProfile();

  const payload = {
    attempt_id: attemptId,
    role_card_id: card.id,
    profession: card.profession,
    transcript,
    tasks: card.cardText.yourTasks,
    checklist_ratings: checklistRatings,
    analysis,
    duration_seconds: durationSeconds,
    mode,
    skill_map: profile?.skillMap,
  };

  let apiFeedback: Record<string, unknown> | null = null;
  let queuedForSync = false;

  if (accessToken && navigator.onLine) {
    try {
      const res = await fetch(apiUrl("/api/v1/ai/speaking-feedback"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) apiFeedback = await res.json();
    } catch {
      // queue below
    }
  }

  if (!apiFeedback && accessToken) {
    await enqueueOutbox("AI_SPEAKING", payload);
    queuedForSync = true;
    window.dispatchEvent(new CustomEvent("oet-outbox-updated"));
  }

  if (!apiFeedback) {
    const passed = Object.values(checklistRatings).filter(Boolean).length;
    const total = Object.keys(checklistRatings).length;
    apiFeedback = {
      status: queuedForSync ? "queued" : "offline",
      grade_estimate: overallScore >= 0.75 ? "B" : overallScore >= 0.55 ? "C+" : "C",
      feedback:
        queuedForSync
          ? `Checklist ${passed}/${total}. Transcript analysis complete — AI feedback queued for sync.`
          : `Checklist ${passed}/${total}. Rule-based analysis ready. Sign in online for full AI feedback.`,
      task_coverage: analysis.taskCoverage,
      ice_coverage: analysis.iceCoverage,
      suggested_phrases: analysis.suggestedPhrases,
      weak_tags: weakTags,
      actions: analysis.suggestedPhrases.slice(0, 3).map((p) => `Practise: "${p}"`),
    };
  }

  let skillMapUpdated = false;
  if (profile?.skillMap) {
    const updated = applySpeakingResult(profile.skillMap, overallScore, weakTags, []);
    await saveSkillMap(updated);
    skillMapUpdated = true;
    window.dispatchEvent(new CustomEvent("oet-skill-map-updated"));
  }

  const { refreshAdaptiveState } = await import("@/lib/adaptive/service");
  void refreshAdaptiveState();

  await db.attempts.put({
    id: attemptId,
    skill: "speaking",
    scenarioId: card.id,
    scoreRaw: {
      overallScore,
      weakTags,
      mode,
      durationSeconds,
      recordingId,
      transcriptLength: transcript.length,
    },
    createdAt: Date.now(),
    synced: !queuedForSync && apiFeedback.status !== "offline",
  });

  await db.progress.put({
    id: attemptId,
    skill: "speaking",
    score: Math.round(overallScore * 100),
    tags: weakTags,
    createdAt: Date.now(),
  });

  await db.aiFeedbackCache.put({
    attemptId,
    feedback: apiFeedback,
    cachedAt: Date.now(),
  });

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  return {
    attemptId,
    analysis,
    feedback: apiFeedback,
    queuedForSync,
    skillMapUpdated,
    overallScore,
  };
}
