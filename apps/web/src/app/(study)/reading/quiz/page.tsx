"use client";

import { useEffect, useMemo, useState } from "react";

import { PassagePanel } from "@/components/reading/passage-panel";
import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { QuizSourceTip } from "@/components/quiz/quiz-source-tip";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadUserProfile } from "@/lib/profile/service";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";
import {
  passageBlocksForQuiz,
  quizBriefingPart,
  quizRationale,
  selectQuizQuestions,
} from "@/lib/quiz/engine";
import { useQuizSelection } from "@/lib/quiz/use-quiz-selection";

export default function AdaptiveQuizPage() {
  const { session, loading } = useAuth();
  const { excludeIds, selectionSeed } = useQuizSelection(session?.user?.id);
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
        excludeIds,
        selectionSeed,
      }),
    [weakTags, profession, targetCountry, excludeIds, selectionSeed],
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
      <StudyPageHeader
        backHref="/reading"
        backLabel="Reading hub"
        skill="reading"
        eyebrow="Reading · Adaptive quiz"
        title="Adaptive reading quiz"
        description={
          <p className="rounded-xl bg-brand-accent-soft/40 px-3 py-2">
            <strong className="text-brand-primary">Why this quiz?</strong> {rationale}
          </p>
        }
      />

      <ReadingExamBriefing part={briefingPart} weakTags={weakTags} compact />

      <QuizSourceTip />

      {passageBlocks.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-ink">Reading texts</h2>
          {passageBlocks.map((block) => (
            <PassagePanel key={block.id} block={block} collapsible defaultOpen={false} />
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
