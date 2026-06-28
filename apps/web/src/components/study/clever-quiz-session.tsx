"use client";

import { useEffect, useMemo, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { QuizPassageSection } from "@/components/quiz/quiz-passage-section";
import { QuizSourceTip } from "@/components/quiz/quiz-source-tip";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { StudyPageHeader } from "@/components/study/study-page-header";
import {
  CLEVER_SKILL_LABELS,
  type AssessmentSkill,
} from "@/content/assessment";
import { cleverQuizQuestionLimit } from "@/lib/exam/oet-counts";
import { useAuth } from "@/lib/auth/auth-provider";
import { cleverQuizRationale, quizHasReadingPassages, selectAssessmentQuestions } from "@/lib/quiz/engine";
import { allQuestionsAnswered } from "@/lib/quiz/question-utils";
import { useQuizSelection } from "@/lib/quiz/use-quiz-selection";
import { submitAssessmentAttempt } from "@/lib/quiz/submit-assessment";
import { loadUserProfile } from "@/lib/profile/service";

interface CleverQuizSessionProps {
  skill: AssessmentSkill;
  backHref: string;
  title?: string;
}

export function CleverQuizSession({ skill, backHref, title }: CleverQuizSessionProps) {
  const { session, loading } = useAuth();
  const { excludeIds, selectionSeed } = useQuizSelection(session?.user?.id);
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
        limit: cleverQuizQuestionLimit(skill),
        assessmentSkill: skill,
        excludeIds,
        selectionSeed,
      }),
    [weakTags, profession, targetCountry, skill, excludeIds, selectionSeed],
  );

  const rationale = cleverQuizRationale(weakTags, skill);
  const hasPassages = quizHasReadingPassages(questions);
  const allAnswered = allQuestionsAnswered(questions, responses);
  const label = title ?? CLEVER_SKILL_LABELS[skill];
  const studySkill =
    skill === "reading" || skill === "listening" || skill === "writing" || skill === "speaking"
      ? skill
      : undefined;

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
      <StudyPageHeader
        backHref={backHref}
        backLabel="Back"
        skill={studySkill}
        eyebrow={`Quick quiz · ${label}`}
        title={label}
        description={
          <p className="rounded-xl bg-brand-accent-soft/40 px-3 py-2">
            <strong className="text-brand-primary">Why this set?</strong> {rationale}
          </p>
        }
      />

      <QuizSourceTip />

      <QuizPassageSection questions={questions} />

      <section>
        {hasPassages ? (
          <h2 className="mb-4 text-sm font-semibold text-ink">Questions</h2>
        ) : null}
        <QuizQuestionList
          questions={questions}
          responses={responses}
          onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        />
      </section>

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
