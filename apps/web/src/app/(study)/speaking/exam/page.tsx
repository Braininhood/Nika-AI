"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SpeakingSessionLazy } from "@/components/speaking/speaking-session-lazy";
import { SpeakingResultsPanel } from "@/components/speaking/speaking-results-panel";
import { SpeakingStudyGuidePanel } from "@/components/speaking/speaking-exam-briefing";
import { useAuth } from "@/lib/auth/auth-provider";
import { OET_SPEAKING } from "@/lib/exam/oet-counts";
import { loadUserProfile } from "@/lib/profile/service";
import { assembleSpeakingExam } from "@/lib/speaking/exam-assembly";
import type { submitSpeakingAttempt } from "@/lib/speaking/submit-attempt";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

export default function SpeakingExamPage() {
  const { session, loading } = useAuth();
  const [cards, setCards] = useState<ReturnType<typeof assembleSpeakingExam>["cards"]>([]);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof submitSpeakingAttempt>>[]
  >([]);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const seed = createSelectionSeed(session?.user?.id);
      setCards(
        assembleSpeakingExam(profile?.profession, profile?.targetCountry, seed).cards,
      );
    });
  }, [loading, session?.user?.id]);

  if (!cards.length && !loading) {
    return <p className="py-8 text-sm text-ink-soft">Loading speaking exam…</p>;
  }

  if (results.length >= cards.length && cards.length > 0) {
    const last = results[results.length - 1]!;
    const avgScore =
      results.reduce((s, r) => s + r.overallScore, 0) / Math.max(results.length, 1);
    return (
      <div className="flex flex-col gap-6 pb-8">
        <Link href="/speaking" className="text-sm text-ink-soft hover:text-ink">
          ← Speaking hub
        </Link>
        <header>
          <h1 className="text-xl font-bold text-ink">Speaking exam — complete</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {cards.length} role-plays complete · average score{" "}
            {Math.round(avgScore * 100)}% across both sessions.
          </p>
        </header>
        <SpeakingResultsPanel card={cards[cards.length - 1]!} result={last} backHref="/speaking/exam" />
      </div>
    );
  }

  if (step === 0 && cards.length > 0 && results.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <Link href="/speaking" className="text-sm text-ink-soft hover:text-ink">
          ← Speaking hub
        </Link>
        <header>
          <h1 className="text-xl font-bold text-ink">Speaking exam</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Real OET: {OET_SPEAKING.rolePlays} role-plays · {OET_SPEAKING.prepMinutesEach} min prep
            each · {OET_SPEAKING.durationMinutesEach} min each · ~
            {OET_SPEAKING.totalAssessedMinutes} min assessed.
          </p>
          <p className="mt-2 text-xs text-ink-soft">{cards.length} role-play cards selected for your profession.</p>
        </header>
        <SpeakingStudyGuidePanel />
        <ol className="list-inside list-decimal space-y-2 text-sm text-ink-soft">
          {cards.map((card, i) => (
            <li key={card.id}>
              Role-play {i + 1}: {card.setting}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
        >
          Start role-play 1 →
        </button>
      </div>
    );
  }

  const current = cards[results.length];
  if (!current) {
    return <p className="py-8 text-sm text-ink-soft">Loading…</p>;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 py-6">
      <SpeakingSessionLazy
        card={current}
        backHref="/speaking/exam"
        backLabel="Speaking exam"
        examMode
        rolePlayIndex={results.length + 1}
        rolePlayTotal={cards.length}
        onExamRolePlayComplete={(res) => {
          setResults((prev) => [...prev, res]);
        }}
      />
    </div>
  );
}
