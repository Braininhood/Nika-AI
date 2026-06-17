"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PassagePanel } from "@/components/reading/passage-panel";
import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import {
  passageBlocksForQuiz,
  quizBriefingPart,
  quizRationale,
  selectQuizQuestions,
} from "@/lib/quiz/engine";

export default function AdaptiveQuizPage() {
  const { session, loading } = useAuth();
  const [weakTags, setWeakTags] = useState<string[]>(["reading:part-b-gist"]);
  const [profession, setProfession] = useState<string | undefined>();
  const [targetCountry, setTargetCountry] = useState<string | undefined>();
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
  }, [loading, session?.user?.id]);

  const questions = useMemo(
    () =>
      selectQuizQuestions({
        weakTags,
        profession,
        targetCountry,
        mode: "adaptive",
        limit: 5,
      }),
    [weakTags, profession, targetCountry],
  );

  const rationale = quizRationale(weakTags, questions);
  const passageBlocks = useMemo(() => passageBlocksForQuiz(questions), [questions]);
  const briefingPart = useMemo(() => quizBriefingPart(weakTags, questions), [weakTags, questions]);
  const allAnswered = questions.every((q) => responses[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      questions,
      responses,
      mode: "adaptive_quiz",
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
        backHref="/reading/quiz"
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
        <h1 className="text-xl font-bold text-ink">Adaptive reading quiz</h1>
        <p className="mt-2 rounded-xl bg-brand-accent-soft/40 px-3 py-2 text-sm text-ink-soft">
          <strong className="text-brand-primary">Why this quiz?</strong> {rationale}
        </p>
      </header>

      {passageBlocks.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-ink">Reading texts</h2>
          {passageBlocks.map((block) => (
            <PassagePanel key={block.id} block={block} />
          ))}
        </section>
      ) : null}

      <section>
        {passageBlocks.length > 0 ? (
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
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit quiz"}
      </button>
    </div>
  );
}
