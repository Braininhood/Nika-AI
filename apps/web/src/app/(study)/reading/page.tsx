"use client";

import { useEffect, useState } from "react";

import { NextStepCard } from "@/components/dashboard/next-step-card";
import { ReadingStudyGuidePanel } from "@/components/reading/reading-exam-briefing";
import { HubContentGroups } from "@/components/study/hub-content-groups";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { StudySectionCard } from "@/components/study/study-section-card";
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
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="reading"
        eyebrow="Reading · Phase 2"
        title="Reading hub"
        description={`${totalReadingQuestionCount()} tagged questions · ${readingBlockCount()} passages · matched to ${professionLabel ?? "your profession"}${countryLabel ? ` · ${countryLabel}` : ""}.`}
      />

      <ReadingStudyGuidePanel />

      <NextStepCard
        recommendation={recommendation}
        stageLabel={stageLabel}
        skillLabel="reading"
      />

      <StudySectionCard
        skill="reading"
        title="Practice modes"
        items={[
          {
            href: "/study/clever/reading",
            label: "Quick quiz",
            hint: "Exam-faithful Part A/B/C counts from weak areas",
          },
          {
            href: "/reading/quiz",
            label: "Adaptive quiz",
            hint: "Weak-tag + locale focus",
          },
          {
            href: "/reading/flashcards",
            label: "Flashcard review",
            hint: "SM-2 spaced repetition",
            badge: flashcardsDue > 0 ? `${flashcardsDue} due` : undefined,
          },
          {
            href: "/reading/exam/part-a",
            label: "Part A exam",
            hint: "20 matching · 15 min lock",
          },
          {
            href: "/reading/exam",
            label: "Parts B & C exam",
            hint: "6 + 16 MCQ · 45 min",
          },
          {
            href: "/reading/exam/full",
            label: "Full reading exam",
            hint: "All parts · 60 min",
          },
        ]}
        highlighted
      />

      <HubContentGroups
        title="Your matched practice blocks"
        subtitle="Country-first ordering — same logic as Writing scenarios."
        groups={partGroups.map(({ part, blocks }) => ({
          label: `Part ${part}`,
          items: blocks.map((block) => ({
            href: blockRoute(part, block.id),
            title: block.title,
            meta: `${block.questions?.length ?? 0} Q · ${blockSummary(block)}`,
          })),
          emptyMessage: "No blocks for this part yet.",
        }))}
      />
    </div>
  );
}
