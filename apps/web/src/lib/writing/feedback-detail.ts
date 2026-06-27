import type { WritingScenario } from "@/content/writing/scenarios";

import type { ChecklistItem, QuickChecklistResult } from "./checklist";

export interface WritingFeedbackDetail {
  strengths: string[];
  improvements: string[];
  missedFacts: string[];
  irrelevantIncluded: string[];
  summary: string;
}

function noteKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
}

function noteMentioned(letterLower: string, noteText: string): boolean {
  const keywords = noteKeywords(noteText);
  if (keywords.length === 0) return false;
  const hits = keywords.filter((kw) => letterLower.includes(kw));
  return hits.length >= Math.min(2, keywords.length);
}

export function buildWritingFeedbackDetail(
  scenario: WritingScenario,
  letterText: string,
  checklist: QuickChecklistResult,
): WritingFeedbackDetail {
  const lower = letterText.toLowerCase().trim();
  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const item of checklist.items) {
    if (item.passed) {
      strengths.push(item.label);
    } else {
      improvements.push(item.hint ? `${item.label} — ${item.hint}` : item.label);
    }
  }

  const missedFacts: string[] = [];
  for (const id of scenario.assessorGuide.mustInclude) {
    const note = scenario.caseNotes.find((n) => n.id === id);
    if (!note) continue;
    if (!noteMentioned(lower, note.text)) {
      missedFacts.push(note.text);
    }
  }

  const irrelevantIncluded: string[] = [];
  for (const id of scenario.assessorGuide.shouldOmit) {
    const note = scenario.caseNotes.find((n) => n.id === id);
    if (!note) continue;
    if (noteMentioned(lower, note.text)) {
      irrelevantIncluded.push(note.text);
    }
  }

  if (missedFacts.length > 0) {
    improvements.push(
      `Include key facts from the case notes (${missedFacts.length} still missing from your letter).`,
    );
  }
  if (irrelevantIncluded.length > 0) {
    improvements.push("Remove irrelevant details that were marked as non-essential in the notes.");
  }

  const passed = checklist.passedCount;
  const total = checklist.items.length;
  let summary: string;

  if (passed === total && missedFacts.length === 0 && irrelevantIncluded.length === 0) {
    summary = `Strong draft for “${scenario.meta.title}”. Your letter covers the task and key clinical points. Compare with the Grade B sample, then try exam timing.`;
  } else if (passed >= total - 1) {
    summary = `Good progress on “${scenario.meta.title}” (${passed}/${total} checklist items). A few targeted fixes below will lift this toward Grade B.`;
  } else {
    summary = `Your letter for “${scenario.meta.title}” needs work (${passed}/${total} checklist items passed). Focus on the improvements below — each maps to OET writing criteria.`;
  }

  return { strengths, improvements, missedFacts, irrelevantIncluded, summary };
}

export function mergeFeedbackWithDetail(
  apiFeedback: Record<string, unknown>,
  detail: WritingFeedbackDetail,
): Record<string, unknown> {
  const hasLlmFeedback =
    typeof apiFeedback.feedback_provider === "string" &&
    apiFeedback.feedback_provider !== "grounded_rules";
  const generic =
    !hasLlmFeedback &&
    typeof apiFeedback.feedback === "string" &&
    (apiFeedback.feedback.includes("Checklist-based analysis") ||
      apiFeedback.feedback.includes("Indicative grade:") ||
      apiFeedback.feedback.length < 80);

  const apiStrengths = asStringArray(apiFeedback.strengths);
  const apiImprovements = asStringArray(apiFeedback.improvements);

  return {
    ...apiFeedback,
    feedback: generic ? detail.summary : apiFeedback.feedback,
    strengths: detail.strengths.length > 0 ? detail.strengths : apiStrengths,
    improvements:
      detail.improvements.length > 0 ? detail.improvements : apiImprovements,
    missed_facts: detail.missedFacts,
    irrelevant_included: detail.irrelevantIncluded,
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.length > 0);
}
