"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { Flashcard } from "@/lib/db/types";
import {
  flashcardDeckStats,
  listDueFlashcards,
  reviewFlashcard,
  type FlashcardDeckStats,
  type ReviewQuality,
} from "@/lib/quiz/flashcards";

const GRADE_BUTTONS: { label: string; sub: string; quality: ReviewQuality; tone: string }[] = [
  { label: "Again", sub: "<1 day", quality: 0, tone: "border-danger/50 text-danger" },
  { label: "Hard", sub: "~1 day", quality: 2, tone: "border-border text-ink" },
  { label: "Good", sub: "SM-2 interval", quality: 3, tone: "border-forest/50 text-forest" },
  { label: "Easy", sub: "Longer interval", quality: 5, tone: "border-brand-primary/50 text-brand-primary" },
];

export function FlashcardReview() {
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [stats, setStats] = useState<FlashcardDeckStats | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    const [due, deckStats] = await Promise.all([listDueFlashcards(20), flashcardDeckStats()]);
    setQueue(due);
    setStats(deckStats);
    setIndex(0);
    setRevealed(false);
    setSessionDone(due.length === 0);
    setReviewed(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadDeck();
    });
  }, [loadDeck]);

  const card = queue[index];

  const handleGrade = async (quality: ReviewQuality) => {
    if (!card) return;
    await reviewFlashcard(card.id, quality);
    setReviewed((n) => n + 1);
    setRevealed(false);

    if (index + 1 >= queue.length) {
      setSessionDone(true);
      const deckStats = await flashcardDeckStats();
      setStats(deckStats);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (loading) {
    return <p className="py-8 text-sm text-ink-soft">Loading flashcards…</p>;
  }

  if (!stats?.total) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 text-center">
        <h2 className="text-lg font-bold text-ink">No flashcards yet</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Wrong answers in reading quizzes and passages are saved here automatically.
        </p>
        <Link
          href="/reading/quiz"
          className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Take an adaptive quiz →
        </Link>
      </section>
    );
  }

  if (sessionDone) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Session complete</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Reviewed {reviewed} card{reviewed === 1 ? "" : "s"}.{" "}
          {stats.due > 0 ? `${stats.due} still due.` : "Nothing else due right now."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.due > 0 ? (
            <button
              type="button"
              onClick={() => void loadDeck()}
              className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
            >
              Review more
            </button>
          ) : null}
          <Link
            href="/reading"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Back to Reading
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>
          Card {index + 1} of {queue.length}
        </span>
        <span>
          Deck: {stats.total} · Due: {stats.due} · Learned: {stats.learned}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="min-h-[200px] rounded-2xl border border-border bg-surface p-6 text-left shadow-sm transition hover:border-brand-primary/40"
      >
        <p className="text-xs font-semibold uppercase text-brand-primary">
          {revealed ? "Answer" : "Question"}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {revealed ? card!.back : card!.front}
        </p>
        {!revealed && (
          <p className="mt-4 text-xs text-ink-soft">Tap to reveal answer</p>
        )}
      </button>

      {revealed ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADE_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => void handleGrade(btn.quality)}
              className={`rounded-xl border bg-surface px-3 py-3 text-sm font-semibold ${btn.tone}`}
            >
              {btn.label}
              <span className="mt-0.5 block text-[10px] font-normal opacity-80">{btn.sub}</span>
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
