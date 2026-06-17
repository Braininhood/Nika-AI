import type { RolePlayCard } from "@/content/speaking";
import { CLINICAL_CHECKLIST } from "./clinical-checklist";

export interface TranscriptAnalysis {
  taskCoverage: { task: string; addressed: boolean; evidence?: string }[];
  iceCoverage: { ideas: boolean; concerns: boolean; expectations: boolean };
  checklistSuggestions: Record<string, boolean>;
  fillerCount: number;
  wordCount: number;
  wordsPerMinute?: number;
  suggestedPhrases: string[];
  weakTags: string[];
}

const FILLER_PATTERN = /\b(um|uh|er|like|you know|sort of|kind of)\b/gi;

function transcriptLower(transcript: string): string {
  return transcript.toLowerCase();
}

function containsAny(text: string, hints: string[]): boolean {
  return hints.some((h) => text.includes(h.toLowerCase()));
}

function taskKeywords(task: string): string[] {
  const words = task.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  return [...new Set(words)];
}

export function analyseTranscript(
  card: RolePlayCard,
  transcript: string,
  durationSeconds?: number,
): TranscriptAnalysis {
  const lower = transcriptLower(transcript);
  const words = transcript.trim() ? transcript.trim().split(/\s+/) : [];
  const fillerMatches = transcript.match(FILLER_PATTERN) ?? [];

  const taskCoverage = card.cardText.yourTasks.map((task) => {
    const keywords = taskKeywords(task);
    const hits = keywords.filter((k) => lower.includes(k));
    const addressed = hits.length >= Math.min(2, keywords.length);
    return { task, addressed, evidence: hits.slice(0, 2).join(", ") || undefined };
  });

  const iceCoverage = {
    ideas: containsAny(lower, ["what do you know", "what do you understand", "what have you heard", "already know"]),
    concerns: containsAny(lower, ["concern", "worr", "afraid", "scared", "anxious"]),
    expectations: containsAny(lower, ["expect", "hope", "would you like", "what would help"]),
  };

  const checklistSuggestions: Record<string, boolean> = {};
  for (const item of CLINICAL_CHECKLIST) {
    checklistSuggestions[item.id] = containsAny(lower, item.transcriptHints);
  }

  const weakTags = new Set<string>(card.coaching.weakTags);
  if (!iceCoverage.ideas || !iceCoverage.concerns) weakTags.add("speaking:ice-expectations");
  if (!checklistSuggestions["struct-sequence"]) weakTags.add("speaking:structure");
  if (!checklistSuggestions["give-check"]) weakTags.add("speaking:language");
  if (fillerMatches.length > 8) weakTags.add("speaking:language");

  const tasksMissed = taskCoverage.filter((t) => !t.addressed).length;
  if (tasksMissed >= 2) weakTags.add("speaking:clinical-comm");

  const suggestedPhrases = [
    ...card.coaching.usefulPhrases.slice(0, 2),
    ...(!iceCoverage.concerns ? ["What concerns you most about this?"] : []),
    ...(!checklistSuggestions["give-check"] ? ["Can you tell me back what you'll do at home?"] : []),
  ].slice(0, 4);

  return {
    taskCoverage,
    iceCoverage,
    checklistSuggestions,
    fillerCount: fillerMatches.length,
    wordCount: words.length,
    wordsPerMinute:
      durationSeconds && durationSeconds > 0
        ? Math.round((words.length / durationSeconds) * 60)
        : undefined,
    suggestedPhrases,
    weakTags: [...weakTags],
  };
}

export function checklistScoresFromRatings(
  ratings: Record<string, boolean>,
): Record<string, number> {
  const groups: Record<string, number[]> = {
    relationship: [],
    perspective: [],
    structure: [],
    gathering: [],
    giving: [],
  };

  for (const item of CLINICAL_CHECKLIST) {
    groups[item.group]?.push(ratings[item.id] ? 1 : 0);
  }

  const scores: Record<string, number> = {};
  for (const [group, vals] of Object.entries(groups)) {
    if (vals.length) {
      scores[group] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
  }
  return scores;
}

export function weakTagsFromChecklistRatings(ratings: Record<string, boolean>): string[] {
  const failed = CLINICAL_CHECKLIST.filter((i) => !ratings[i.id]).map((i) => i.tag);
  return [...new Set(failed)].slice(0, 5);
}

export function overallSpeakingScore(
  checklistRatings: Record<string, boolean>,
  analysis: TranscriptAnalysis,
): number {
  const rated = CLINICAL_CHECKLIST.filter((i) => checklistRatings[i.id]).length;
  const selfScore = rated / CLINICAL_CHECKLIST.length;
  const taskScore =
    analysis.taskCoverage.filter((t) => t.addressed).length /
    Math.max(analysis.taskCoverage.length, 1);
  const iceScore =
    (Number(analysis.iceCoverage.ideas) +
      Number(analysis.iceCoverage.concerns) +
      Number(analysis.iceCoverage.expectations)) /
    3;
  return selfScore * 0.4 + taskScore * 0.35 + iceScore * 0.25;
}
