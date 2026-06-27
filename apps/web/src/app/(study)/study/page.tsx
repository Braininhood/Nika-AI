"use client";

import { useEffect, useState } from "react";

import { NextStepCard } from "@/components/dashboard/next-step-card";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { StudyQuickSkills } from "@/components/study/study-quick-skills";
import { StudySectionCard, type StudyLinkItem } from "@/components/study/study-section-card";
import { fullQuizPool } from "@/content/reading";
import { getProfessionLabel } from "@/lib/domain/professions";
import { useAuth } from "@/lib/auth/auth-provider";
import { dueFlashcardCount } from "@/lib/quiz/flashcards";
import { loadUserProfile } from "@/lib/profile/service";
import {
  primaryReadingRecommendation,
  readingStageLabel,
  type ReadingRecommendation,
} from "@/lib/reading/recommendations";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import {
  primaryWritingRecommendation,
  writingStageLabel,
  type WritingRecommendation,
} from "@/lib/writing/recommendations";

type HubRecommendation = WritingRecommendation | ReadingRecommendation;

export default function StudyHubPage() {
  const { session, loading } = useAuth();
  const [nextStep, setNextStep] = useState<HubRecommendation | null>(null);
  const [skillLabel, setSkillLabel] = useState("writing");
  const [stageLabel, setStageLabel] = useState<string>("");
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);
  const [flashcardsDue, setFlashcardsDue] = useState(0);

  const questionCount = fullQuizPool().length;

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const priority = profile?.skillMap?.priority?.[0] ?? "writing";
      setSkillLabel(priority);
      if (priority === "reading") {
        setNextStep(
          primaryReadingRecommendation(
            profile?.skillMap,
            profile?.profession,
            profile?.targetCountry,
          ),
        );
        setStageLabel(readingStageLabel(profile?.skillMap));
      }
      if (profile?.profession) {
        setProfessionLabel(getProfessionLabel(profile.profession));
      }
    });
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      const priority = ctx.profile?.skillMap?.priority?.[0] ?? "writing";
      if (priority !== "reading") {
        setNextStep(primaryWritingRecommendation(ctx));
        setStageLabel(writingStageLabel(ctx.profile?.skillMap));
      }
    });
    void dueFlashcardCount().then(setFlashcardsDue);
  }, [loading, session?.user?.id]);

  const readingItems: StudyLinkItem[] = [
    {
      href: "/study/clever/reading",
      label: "Quick quiz",
      hint: "5 mixed question types from your weak areas",
    },
    { href: "/reading/quiz", label: "Adaptive reading quiz", hint: "Tagged questions matched to your gaps" },
    {
      href: "/reading/flashcards",
      label: "Flashcard review",
      hint: "SM-2 spaced repetition",
      badge: flashcardsDue > 0 ? `${flashcardsDue} due` : undefined,
    },
    { href: "/reading/part-a", label: "Part A — timed notes", hint: "15 min lock" },
    { href: "/reading/exam", label: "Exam mode", hint: "Parts B & C" },
  ];

  const writingItems: StudyLinkItem[] = [
    {
      href: "/study/clever/writing",
      label: "Quick quiz",
      hint: "Writing criteria — 5 mixed questions",
    },
    { href: "/writing/learn/samples", label: "Graded sample letters" },
    { href: "/writing/learn/drills", label: "Content-selection drills" },
    { href: "/writing/guided", label: "Guided writing wizard" },
    { href: "/writing/practice", label: "Independent practice" },
    { href: "/writing/exam", label: "Exam mode", hint: "5 + 40 min" },
  ];

  const toolsItems: StudyLinkItem[] = [
    { href: "/course", label: "Personal course", hint: "Adaptive path for your profession" },
    { href: "/mock", label: "OET mock exam", hint: "Full timed simulation" },
    { href: "/nika", label: "Ask Nika", hint: "OET + regulator coach" },
    { href: "/materials", label: "Materials hub", hint: "Official OET links" },
    { href: "/vocabulary", label: "Vocabulary", hint: "Translate & pronunciation" },
  ];

  const progressItems: StudyLinkItem[] = [
    { href: "/progress", label: "Progress & attempt history" },
    { href: "/diagnostic", label: "Re-run diagnostic" },
  ];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-brand-primary">Study hub</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">All OET skills</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {professionLabel
            ? `Practice paths for ${professionLabel} — your plan updates after every attempt.`
            : "Complete onboarding to unlock profession-matched practice."}
        </p>
        <SecondaryActionLink href="/dashboard" className="mt-4">
          ← Back to home
        </SecondaryActionLink>
      </header>

      {nextStep && professionLabel ? (
        <NextStepCard
          recommendation={nextStep}
          stageLabel={stageLabel}
          skillLabel={skillLabel}
        />
      ) : null}

      <StudyQuickSkills />

      <StudySectionCard
        skill="reading"
        title="Reading"
        phase="Phase 2"
        hubHref="/reading"
        hubLabel="Open reading hub"
        hubHint={`${questionCount} tagged questions`}
        items={readingItems}
        highlighted={skillLabel === "reading"}
      />

      <StudySectionCard
        skill="writing"
        title="Writing"
        phase="Phase 1"
        hubHref="/writing/learn"
        hubLabel="Writing Academy"
        hubHint="Learn → practice → exam"
        items={writingItems}
        highlighted={skillLabel === "writing"}
      />

      <StudySectionCard
        skill="listening"
        title="Listening"
        hubHref="/listening"
        hubLabel="Open listening hub"
        hubHint="Offline audio + official import"
        items={[
          {
            href: "/study/clever/listening",
            label: "Quick quiz",
            hint: "5 mixed questions from your weak areas",
          },
          { href: "/listening/import", label: "Import official audio", hint: "Personal Local Vault" },
          { href: "/listening/exam", label: "Exam mode", hint: "Parts B & C flow" },
          { href: "/listening/packs", label: "Manage offline packs" },
        ]}
        highlighted={skillLabel === "listening"}
      />

      <StudySectionCard
        skill="speaking"
        title="Speaking"
        phase="Phase 4"
        hubHref="/speaking"
        hubLabel="Open speaking hub"
        hubHint="Role cards · prep · record · AI feedback"
        items={[
          {
            href: "/study/clever/speaking",
            label: "Quick quiz",
            hint: "Clinical communication — 5 mixed questions",
          },
        ]}
        highlighted={skillLabel === "speaking"}
      />

      <StudySectionCard
        title="Tools & adaptive"
        phase="Phase 5–6"
        items={toolsItems}
      />

      <StudySectionCard title="Progress" items={progressItems} />
    </div>
  );
}
