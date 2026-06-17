"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReadingStudyGuidePanel } from "@/components/reading/reading-exam-briefing";
import {
  blockRoute,
  blockSummary,
  readingBlockCount,
  totalReadingQuestionCount,
} from "@/content/reading";
import { useAuth } from "@/lib/auth/auth-provider";
import { scenarioCountryLabel, normalizeScenarioCountry } from "@/content/writing/scenarios";
import { getProfessionLabel } from "@/lib/domain/professions";
import { dueFlashcardCount } from "@/lib/quiz/flashcards";
import { loadReadingContentContext } from "@/lib/reading/content-context";
import {
  primaryReadingRecommendation,
  readingStageLabel,
} from "@/lib/reading/recommendations";

export default function ReadingHubPage() {
  const { session, loading } = useAuth();
  const [recommendation, setRecommendation] = useState(
    primaryReadingRecommendation(undefined),
  );
  const [stageLabel, setStageLabel] = useState("Foundation");
  const [flashcardsDue, setFlashcardsDue] = useState(0);
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);
  const [countryLabel, setCountryLabel] = useState<string | null>(null);
  const [matchedBlocks, setMatchedBlocks] = useState<
    Awaited<ReturnType<typeof loadReadingContentContext>>["blocks"]
  >([]);

  useEffect(() => {
    if (loading) return;
    void loadReadingContentContext(session?.user?.id).then((ctx) => {
      setRecommendation(
        primaryReadingRecommendation(ctx.profile?.skillMap, ctx.profession, ctx.targetCountry),
      );
      setStageLabel(readingStageLabel(ctx.profile?.skillMap));
      setMatchedBlocks(ctx.blocks);
      if (ctx.profession) setProfessionLabel(getProfessionLabel(ctx.profession));
      const code = normalizeScenarioCountry(ctx.targetCountry);
      if (code) setCountryLabel(scenarioCountryLabel(code));
    });
    void dueFlashcardCount().then(setFlashcardsDue);
  }, [loading, session?.user?.id]);

  const partGroups = (["A", "B", "C"] as const).map((part) => ({
    part,
    blocks: matchedBlocks.filter((b) => b.part === part).slice(0, 6),
  }));

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Reading</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {totalReadingQuestionCount()} tagged questions · {readingBlockCount()} passages · matched
          to {professionLabel ?? "your profession"}
          {countryLabel ? ` · ${countryLabel}` : ""}.
        </p>
      </header>

      <ReadingStudyGuidePanel />

      <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/30 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Your reading stage · {stageLabel}
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">Next best step</h2>
        <p className="mt-1 font-medium text-ink">{recommendation.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{recommendation.description}</p>
        {recommendation.rationale && (
          <p className="mt-2 text-xs italic text-brand-primary">{recommendation.rationale}</p>
        )}
        <Link
          href={recommendation.route}
          className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Start now →
        </Link>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">Your matched practice blocks</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Country-first ordering — same logic as Writing scenarios.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {partGroups.map(({ part, blocks }) => (
            <li key={part}>
              <p className="font-medium text-ink">Part {part}</p>
              <ul className="mt-1 space-y-1 pl-3">
                {blocks.length ? (
                  blocks.map((block) => (
                    <li key={block.id}>
                      <Link
                        href={blockRoute(part, block.id)}
                        className="text-brand-primary hover:underline"
                      >
                        {block.title}
                      </Link>
                      <span className="text-ink-soft">
                        {" "}
                        · {block.questions.length} Q · {blockSummary(block)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-ink-soft">No blocks for this part yet.</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/reading/quiz/clever" className="text-brand-primary hover:underline">
            Nika clever quiz — mixed question types (earn a badge)
          </Link>
        </li>
        <li>
          <Link href="/reading/quiz" className="text-brand-primary hover:underline">
            Adaptive quiz (weak-tag + locale focus)
          </Link>
        </li>
        <li>
          <Link href="/reading/flashcards" className="text-brand-primary hover:underline">
            Flashcard review (SM-2)
            {flashcardsDue > 0 ? ` · ${flashcardsDue} due` : ""}
          </Link>
        </li>
        <li>
          <Link href="/reading/exam" className="text-brand-primary hover:underline">
            Exam mode — Parts B &amp; C (45 min)
          </Link>
        </li>
      </ul>
    </div>
  );
}
