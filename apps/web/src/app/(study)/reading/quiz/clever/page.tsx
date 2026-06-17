"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadRotationContext } from "@/lib/content/rotation-context";
import { loadUserProfile } from "@/lib/profile/service";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import { cleverQuizRationale, quizBriefingPart, selectQuizQuestions } from "@/lib/quiz/engine";

export default function CleverQuizPage() {
  const { session, loading } = useAuth();
  const [weakTags, setWeakTags] = useState<string[]>(["reading:part-c-inference"]);
  const [profession, setProfession] = useState<string | undefined>();
  const [targetCountry, setTargetCountry] = useState<string | undefined>();
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((profile) => {
      const tags = profile?.skillMap?.diagnostic.reading.weakTags;
      if (tags?.length) setWeakTags(tags);
      setProfession(profile?.profession);
      setTargetCountry(profile?.targetCountry);
    });
    void loadRotationContext().then((ctx) => setExcludeIds(ctx.questions));
  }, [loading, session?.user?.id]);

  const questions = useMemo(
    () =>
      selectQuizQuestions({
        weakTags,
        profession,
        targetCountry,
        mode: "clever_mix",
        limit: 5,
        excludeIds,
      }),
    [weakTags, profession, targetCountry, excludeIds],
  );

  const rationale = cleverQuizRationale(weakTags);
  const briefingPart = useMemo(() => quizBriefingPart(weakTags, questions), [weakTags, questions]);
  const allAnswered = questions.every((q) => responses[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      questions,
      responses,
      mode: "clever_quiz",
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
        backHref="/reading/quiz/clever"
        questions={questions}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>

      <ReadingExamBriefing part={briefingPart} weakTags={weakTags} compact />

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Nika clever quiz
        </p>
        <h1 className="text-xl font-bold text-ink">Mixed challenge set</h1>
        <p className="mt-2 rounded-xl bg-brand-accent-soft/40 px-3 py-2 text-sm text-ink-soft">
          <strong className="text-brand-primary">Why this set?</strong> {rationale}
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Question types: true/false · gap-fill · ordering · matching · MCQ
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
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit clever quiz"}
      </button>
    </div>
  );
}
