import { applyWritingResult, weakTagsFromChecklist } from "@/lib/adaptive/skill-map";
import { db } from "@/lib/db";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";
import { enqueueOutbox } from "@/lib/sync/outbox";
import type { WritingScenario } from "@/content/writing/scenarios";
import {
  checklistToCriterionScores,
  runQuickChecklist,
  type ChecklistItem,
  type QuickChecklistResult,
} from "@/lib/writing/checklist";
import {
  buildWritingFeedbackDetail,
  mergeFeedbackWithDetail,
} from "@/lib/writing/feedback-detail";

import { apiUrl } from "@/lib/api/base-url";

export interface WritingSubmitInput {
  scenario: WritingScenario;
  letterText: string;
  accessToken?: string;
  mode?: "practice" | "guided" | "exam";
}

export interface WritingSubmitResult {
  checklist: QuickChecklistResult;
  feedback: Record<string, unknown>;
  queuedForSync: boolean;
  attemptId: string;
}

export async function submitWritingAttempt(input: WritingSubmitInput): Promise<WritingSubmitResult> {
  const { scenario, letterText, accessToken, mode = "practice" } = input;
  const wordCount = letterText.trim() ? letterText.trim().split(/\s+/).length : 0;
  const checklist = runQuickChecklist(letterText, scenario);
  const failed = checklist.items.filter((i) => !i.passed).map((i) => i.criterion);
  const weakTags = weakTagsFromChecklist(failed);
  const criterionScores = checklistToCriterionScores(checklist.items);
  const attemptId = crypto.randomUUID();
  const profile = await loadUserProfile();

  const payload = {
    attempt_id: attemptId,
    scenario_id: scenario.id,
    letter_text: letterText,
    word_count: wordCount,
    criterion_scores: criterionScores,
    profession: scenario.profession,
    mode,
    skill_map: profile?.skillMap,
    scenario_context: {
      title: scenario.meta.title,
      instruction: scenario.taskSheet.instruction,
      letter_type: scenario.meta.letterType,
      must_include: scenario.assessorGuide.mustInclude
        .map((id) => scenario.caseNotes.find((n) => n.id === id)?.text)
        .filter(Boolean),
      should_omit: scenario.assessorGuide.shouldOmit
        .map((id) => scenario.caseNotes.find((n) => n.id === id)?.text)
        .filter(Boolean),
    },
  };

  const detail = buildWritingFeedbackDetail(scenario, letterText, checklist);

  let apiFeedback: Record<string, unknown> | null = null;
  let queuedForSync = false;

  if (accessToken && navigator.onLine) {
    try {
      const res = await fetch(apiUrl("/api/v1/ai/writing-feedback"), {
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
    await enqueueOutbox("AI_WRITING", payload);
    queuedForSync = true;
    window.dispatchEvent(new CustomEvent("oet-outbox-updated"));
  }

  if (!apiFeedback) {
    apiFeedback = {
      status: queuedForSync ? "queued" : "offline",
      criterion_scores: criterionScores,
      feedback: queuedForSync
        ? `${detail.summary} AI polish queued — will sync when online.`
        : detail.summary,
      actions: detail.improvements.slice(0, 4),
    };
  }

  apiFeedback = mergeFeedbackWithDetail(apiFeedback, detail);

  if (profile?.skillMap) {
    const updated = applyWritingResult(profile.skillMap, criterionScores, weakTags);
    await saveSkillMap(updated);
    window.dispatchEvent(new CustomEvent("oet-skill-map-updated"));
  }

  const { refreshAdaptiveState } = await import("@/lib/adaptive/service");
  void refreshAdaptiveState();

  await db.attempts.put({
    id: attemptId,
    skill: "writing",
    scenarioId: scenario.id,
    scoreRaw: { criterionScores, wordCount, mode, letterText: letterText },
    createdAt: Date.now(),
    synced: !queuedForSync && apiFeedback.status !== "offline",
  });

  await db.aiFeedbackCache.put({
    attemptId,
    feedback: apiFeedback,
    cachedAt: Date.now(),
  });

  const { afterStudyActivity } = await import("@/lib/progress/badge-store");
  void afterStudyActivity();

  const { notifyStudyDataChanged } = await import("@/lib/sync/notify-study-sync");
  notifyStudyDataChanged();

  return { checklist, feedback: apiFeedback, queuedForSync, attemptId };
}

export function criterionScoreCards(
  scores: Record<string, number>,
): { name: string; score: number; label: string }[] {
  const labels: Record<string, string> = {
    purpose: "Purpose",
    content: "Content",
    conciseness: "Conciseness",
    genre: "Genre & Style",
    organisation: "Organisation",
    language: "Language",
  };
  return Object.entries(scores).map(([key, score]) => ({
    name: key,
    score,
    label: labels[key] ?? key,
  }));
}

export type { ChecklistItem };
