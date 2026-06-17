import type { QuizQuestion } from "@/content/reading";
import { db } from "@/lib/db";
import type { Flashcard } from "@/lib/db/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** SM-2 quality rating 0–5 (Again=0, Hard=2, Good=3, Easy=5). */
export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface FlashcardDeckStats {
  total: number;
  due: number;
  learned: number;
}

export function scheduleSm2(card: Flashcard, quality: ReviewQuality): Flashcard {
  let { ease, interval, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.max(1, Math.round(interval * ease));
    repetitions += 1;
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  return {
    ...card,
    ease,
    interval,
    repetitions,
    nextReviewAt: Date.now() + interval * DAY_MS,
  };
}

export function flashcardFromWrongAnswer(question: QuizQuestion): Flashcard {
  const correct =
    typeof question.correctAnswer === "string"
      ? question.correctAnswer
      : question.correctAnswer.join(", ");

  return {
    id: `fc-${question.id}`,
    front: question.prompt,
    back: `${correct}\n\n${question.explanation}`,
    nextReviewAt: Date.now(),
    interval: 1,
    ease: 2.5,
    repetitions: 0,
  };
}

function normalizeFlashcard(card: Flashcard): Flashcard {
  return { ...card, repetitions: card.repetitions ?? 0 };
}

export async function saveFlashcardsFromWrongQuestions(
  questions: QuizQuestion[],
  wrongQuestionIds: string[],
): Promise<number> {
  const wrongSet = new Set(wrongQuestionIds);
  let saved = 0;

  for (const question of questions) {
    if (!wrongSet.has(question.id)) continue;
    const card = flashcardFromWrongAnswer(question);
    const existing = await db.flashcards.get(card.id);
    if (existing) {
      await db.flashcards.put(
        normalizeFlashcard({
          ...existing,
          back: card.back,
          nextReviewAt: Date.now(),
        }),
      );
    } else {
      await db.flashcards.put(card);
    }
    saved += 1;
  }

  return saved;
}

export async function listDueFlashcards(limit = 20): Promise<Flashcard[]> {
  const now = Date.now();
  const due = await db.flashcards.where("nextReviewAt").belowOrEqual(now).toArray();
  return due.slice(0, limit).map(normalizeFlashcard);
}

export async function listAllFlashcards(): Promise<Flashcard[]> {
  const all = await db.flashcards.toArray();
  return all.map(normalizeFlashcard);
}

export async function dueFlashcardCount(): Promise<number> {
  const now = Date.now();
  return db.flashcards.where("nextReviewAt").belowOrEqual(now).count();
}

export async function flashcardDeckStats(): Promise<FlashcardDeckStats> {
  const all = await listAllFlashcards();
  const now = Date.now();
  const due = all.filter((c) => c.nextReviewAt <= now).length;
  const learned = all.filter((c) => c.repetitions >= 2).length;
  return { total: all.length, due, learned };
}

export async function reviewFlashcard(id: string, quality: ReviewQuality): Promise<Flashcard | null> {
  const card = await db.flashcards.get(id);
  if (!card) return null;

  const updated = scheduleSm2(normalizeFlashcard(card), quality);
  await db.flashcards.put(updated);
  return updated;
}

/** @deprecated Use reviewFlashcard with ReviewQuality */
export async function reviewFlashcardLegacy(id: string, quality: 0 | 1 | 2 | 3): Promise<void> {
  const mapped: ReviewQuality = quality === 0 ? 0 : quality === 1 ? 1 : quality === 2 ? 3 : 5;
  await reviewFlashcard(id, mapped);
}
