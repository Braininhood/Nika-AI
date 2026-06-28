import type { QuizQuestion } from "@/content/reading/types";
import { createSelectionSeed, shuffleWithSeed } from "@/lib/quiz/shuffle-seed";

import bundledGlossary from "./data/healthcare_vocabulary.json";
import { VOCAB_BANK } from "./vocab-bank";

interface GlossaryEntry {
  display: string;
  full_name: string;
  explanation: string;
  oet_skills?: string[];
  example?: string;
  aliases?: string[];
}

const GLOSSARY = bundledGlossary as Record<string, GlossaryEntry>;

function distractorsFor(entry: GlossaryEntry, all: GlossaryEntry[], count = 3): string[] {
  const pool = all
    .filter((e) => e.full_name !== entry.full_name)
    .map((e) => e.full_name);
  return shuffleWithSeed(pool, createSelectionSeed(entry.display)).slice(0, count);
}

/** Auto-generated MCQs from API healthcare_vocabulary.json (~100 terms). */
export function glossaryQuizQuestions(): QuizQuestion[] {
  const entries = Object.entries(GLOSSARY).map(([key, entry]) => ({ key, entry }));
  const allEntries = entries.map((e) => e.entry);

  return entries.map(({ key, entry }, index) => {
    const options = shuffleWithSeed(
      [entry.full_name, ...distractorsFor(entry, allEntries)],
      createSelectionSeed(`${key}-${index}`),
    ).slice(0, 4);
    const skillTags = (entry.oet_skills ?? []).map((s) => `vocab:${s}`);

    return {
      id: `gv-${key}`,
      skill: "vocab" as const,
      profession: "all" as const,
      type: "mcq" as const,
      difficulty: (index % 3) + 1 as 1 | 2 | 3,
      tags: ["vocab:glossary", "vocab:clinical", ...skillTags],
      prompt: `What is the full meaning of **${entry.display}**?`,
      options,
      correctAnswer: entry.full_name,
      explanation: entry.explanation,
    };
  });
}

let cachedGlossaryPool: QuizQuestion[] | null = null;

export function fullVocabQuizPool(): QuizQuestion[] {
  if (cachedGlossaryPool) return cachedGlossaryPool;
  const seen = new Set<string>();
  const merged: QuizQuestion[] = [];
  for (const q of [...VOCAB_BANK, ...glossaryQuizQuestions()]) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    merged.push(q);
  }
  cachedGlossaryPool = merged;
  return merged;
}

export function glossaryQuizCount(): number {
  return Object.keys(GLOSSARY).length;
}
