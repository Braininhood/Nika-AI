import { computeGap, sortSkillsByGap } from "@/lib/domain/grades";
import type { OetGrade, OetSkill, SkillMap } from "@/lib/domain/types";

const GRADE_FROM_SCORE: OetGrade[] = ["D", "C", "C+", "B"];

function scoreToBand(score: number): OetGrade {
  if (score >= 0.85) return "B";
  if (score >= 0.65) return "C+";
  if (score >= 0.45) return "C";
  return "D";
}

export function applyWritingResult(
  skillMap: SkillMap,
  criterionScores: Record<string, number>,
  weakTags: string[],
): SkillMap {
  const avg =
    Object.values(criterionScores).reduce((a, b) => a + b, 0) /
    Math.max(Object.values(criterionScores).length, 1);

  const estBand = scoreToBand(avg);
  const target = skillMap.targetGrades.writing;
  const gap = computeGap(estBand, target);

  const existingTags = skillMap.diagnostic.writing.weakTags;
  const mergedTags = [...new Set([...weakTags, ...existingTags])].slice(0, 5);

  const diagnostic = {
    ...skillMap.diagnostic,
    writing: {
      estBand,
      gap,
      weakTags: mergedTags.length ? mergedTags : ["writing:purpose"],
    },
  };

  const priority = sortSkillsByGap(diagnostic);

  return {
    ...skillMap,
    diagnostic,
    priority,
    computedAt: new Date().toISOString(),
  };
}

export function weakTagsFromChecklist(
  failedCriteria: string[],
): string[] {
  const map: Record<string, string> = {
    Purpose: "writing:purpose",
    Content: "writing:content-selection",
    Conciseness: "writing:conciseness",
    "Genre & Style": "writing:genre",
    Organisation: "writing:organisation",
    Language: "writing:language",
  };
  return failedCriteria.map((c) => map[c] ?? `writing:${c.toLowerCase()}`);
}

export function recommendedWritingStage(skillMap: SkillMap | undefined): "learn" | "guided" | "practice" {
  if (!skillMap) return "learn";
  const writing = skillMap.diagnostic.writing;
  if (writing.gap >= 2 || writing.estBand === "C" || writing.estBand === "D") return "learn";
  if (writing.gap === 1) return "guided";
  return "practice";
}

export function lessonIdsForWeakTags(tags: string[]): string[] {
  const mapping: Record<string, string> = {
    "writing:purpose": "w-lesson-purpose",
    "writing:content-selection": "w-lesson-content",
    "writing:content": "w-lesson-content",
    "writing:conciseness": "w-lesson-concise",
    "writing:genre": "w-lesson-genre",
    "writing:organisation": "w-lesson-org",
    "writing:language": "w-lesson-language",
  };
  return [...new Set(tags.map((t) => mapping[t]).filter(Boolean))] as string[];
}
