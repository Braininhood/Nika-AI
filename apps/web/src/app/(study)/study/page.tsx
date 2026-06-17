"use client";



import Link from "next/link";

import { useEffect, useState } from "react";



import { NextStepCard } from "@/components/dashboard/next-step-card";

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

        const rec = primaryReadingRecommendation(
          profile?.skillMap,
          profile?.profession,
          profile?.targetCountry,
        );

        setNextStep(rec);

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



  return (

    <div className="mx-auto max-w-lg px-4 py-8">

      <h1 className="text-2xl font-bold text-ink">Study</h1>

      <p className="mt-2 text-sm text-ink-soft">

        All four OET skills for {professionLabel ?? "your profession"} — adaptive plan updates from

        every attempt.

      </p>



      {nextStep && professionLabel ? (

        <div className="mt-6">

          <NextStepCard recommendation={nextStep} stageLabel={stageLabel} skillLabel={skillLabel} />

        </div>

      ) : null}



      <ul className="mt-6 space-y-2 text-sm">

        <li className="pt-2 font-medium text-ink">Reading · Phase 2</li>

        <li>

          <Link href="/reading" className="text-brand-primary hover:underline">

            Reading hub

          </Link>

          <span className="text-ink-soft"> · {questionCount} tagged questions</span>

        </li>

        <li>

          <Link href="/reading/quiz" className="text-brand-primary hover:underline">

            Adaptive reading quiz

          </Link>

        </li>

        <li>

          <Link href="/reading/flashcards" className="text-brand-primary hover:underline">

            Flashcard review (SM-2)

            {flashcardsDue > 0 ? ` · ${flashcardsDue} due` : ""}

          </Link>

        </li>

        <li>

          <Link href="/reading/part-a" className="text-brand-primary hover:underline">

            Part A — 15 min lock

          </Link>

        </li>

        <li>

          <Link href="/reading/exam" className="text-brand-primary hover:underline">

            Exam mode — Parts B &amp; C

          </Link>

        </li>



        <li className="pt-2 font-medium text-ink">Writing · Phase 1</li>

        <li>

          <Link href="/writing/learn" className="text-brand-primary hover:underline">

            Writing Academy (Learn)

          </Link>

        </li>

        <li>

          <Link href="/writing/learn/samples" className="text-brand-primary hover:underline">

            Graded sample letters

          </Link>

        </li>

        <li>

          <Link href="/writing/learn/drills" className="text-brand-primary hover:underline">

            Content-selection drills

          </Link>

        </li>

        <li>

          <Link href="/writing/guided" className="text-brand-primary hover:underline">

            Guided writing wizard

          </Link>

        </li>

        <li>

          <Link href="/writing/practice" className="text-brand-primary hover:underline">

            Independent practice

          </Link>

        </li>

        <li>

          <Link href="/writing/exam" className="text-brand-primary hover:underline">

            Exam mode (5 + 40 min)

          </Link>

        </li>



        <li className="pt-2 font-medium text-ink-soft">Listening</li>

        <li>

          <Link href="/listening" className="text-brand-primary hover:underline">

            Listening hub

          </Link>

          <span className="text-ink-soft"> — offline audio + PLV import</span>

        </li>



        <li className="pt-2 font-medium text-ink">Speaking · Phase 4</li>

        <li>

          <Link href="/speaking" className="text-brand-primary hover:underline">

            Speaking hub

          </Link>

          <span className="text-ink-soft"> — role cards · prep · record · AI feedback</span>

        </li>



        <li className="pt-2 font-medium text-ink">Phase 5 — Adaptive</li>
        <li>
          <Link href="/course" className="text-brand-primary hover:underline">
            Personal course
          </Link>
        </li>
        <li>
          <Link href="/mock" className="text-brand-primary hover:underline">
            OET mock exam
          </Link>
        </li>

        <li className="pt-2 font-medium text-ink">Phase 6 — Nika tutor</li>
        <li>
          <Link href="/nika" className="text-brand-primary hover:underline">
            Ask Nika (OET + regulator coach)
          </Link>
        </li>
        <li>
          <Link href="/materials" className="text-brand-primary hover:underline">
            Materials Hub — official OET links
          </Link>
        </li>
        <li>
          <Link href="/study/clever" className="text-brand-primary hover:underline">
            Clever assessments — all skills
          </Link>
        </li>
        <li>
          <Link href="/vocabulary" className="text-brand-primary hover:underline">
            Vocabulary — translate &amp; pronunciation
          </Link>
        </li>

        <li className="pt-2 font-medium text-ink">Progress</li>

        <li>

          <Link href="/progress" className="text-brand-primary hover:underline">

            Progress & attempt history

          </Link>

        </li>

        <li>

          <Link href="/diagnostic" className="text-brand-primary hover:underline">

            Re-run diagnostic

          </Link>

        </li>

      </ul>

    </div>

  );

}

