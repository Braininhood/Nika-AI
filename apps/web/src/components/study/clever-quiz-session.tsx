"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import {
  CLEVER_SKILL_LABELS,
  type AssessmentSkill,
} from "@/content/assessment";
import { useAuth } from "@/lib/auth/auth-provider";
import { cleverQuizRationale, selectAssessmentQuestions } from "@/lib/quiz/engine";
import { submitAssessmentAttempt } from "@/lib/quiz/submit-assessment";
import { loadUserProfile } from "@/lib/profile/service";

interface CleverQuizSessionProps {
  skill: AssessmentSkill;
  backHref: string;
  title?: string;
}

export function CleverQuizSession({ skill, backHref, title }: CleverQuizSessionProps) {
  const { session, loading } = useAuth();
  const [weakTags, setWeakTags] = useState<string[]>(["reading:part-c-inference"]);
  const [profession, setProfession] = useState<string | undefined>();
  const [targetCountry, setTargetCountry] = useState<string | undefined>();
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitAssessmentAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const skillKey = skill === "vocab" || skill === "mixed" ? "reading" : skill;
      const tags = profile?.skillMap?.diagnostic[skillKey]?.weakTags;
      if (tags?.length) setWeakTags(tags);
      setProfession(profile?.profession);
      setTargetCountry(profile?.targetCountry);
    });
  }, [loading, session?.user?.id, skill]);

  const questions = useMemo(
    () =>
      selectAssessmentQuestions({
        weakTags,
        profession,
        targetCountry,
        mode: "clever_mix",
        limit: 5,
        assessmentSkill: skill,
      }),
    [weakTags, profession, targetCountry, skill],
  );

  const rationale = cleverQuizRationale(weakTags, skill);
  const allAnswered = questions.every((q) => responses[q.id] !== undefined);
  const label = title ?? CLEVER_SKILL_LABELS[skill];

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitAssessmentAttempt({
      questions,
      responses,
      skill,
      mode: skill === "reading" ? "clever_quiz" : `${skill}_clever_quiz`,
    });
    setResult(res);
    setSubmitting(false);
  };

  if (result) {
    return (
      <ReadingResultsPanel
        score={result.score}
        flashcardsAdded={result.flashcardsAdded}
        skillMapUpdated={result.skillMapUpdated}
        backHref={backHref}
        questions={questions}
      />
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-8">
      <Link href={backHref} className="text-sm text-ink-soft hover:text-ink">
        ← Back
      </Link>

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Nika clever quiz
        </p>
        <h1 className="text-xl font-bold text-ink">{label}</h1>
        <p className="mt-2 rounded-xl bg-brand-accent-soft/40 px-3 py-2 text-sm text-ink-soft">
          <strong className="text-brand-primary">Why this set?</strong> {rationale}
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Types: true/false · gap-fill · ordering · matching · MCQ
        </p>
      </header>

      <QuizQuestionList
        questions={questions}
        responses={responses}
        onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
      />

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => void handleSubmit()}
        className="min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit quiz"}
      </button>
    </div>
  );
}
