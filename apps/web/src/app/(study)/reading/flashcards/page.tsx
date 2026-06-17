"use client";

import Link from "next/link";

import { FlashcardReview } from "@/components/reading/flashcard-review";

export default function ReadingFlashcardsPage() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>
      <header>
        <h1 className="text-xl font-bold text-ink">Flashcard review</h1>
        <p className="mt-1 text-sm text-ink-soft">
          SM-2 spaced repetition from your wrong reading answers. Again · Hard · Good · Easy.
        </p>
      </header>
      <FlashcardReview />
    </div>
  );
}
