"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { StrongWeakExamplesPanel } from "@/components/writing/lesson-examples-panel";
import { getLessonForProfession } from "@/content/writing/lessons";
import { useAuth } from "@/lib/auth/auth-provider";
import { lessonQuestionsToQuiz } from "@/lib/quiz/lesson-questions";
import { loadUserProfile } from "@/lib/profile/service";
import { saveLessonProgress } from "@/lib/writing/progress";

export default function WritingLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { session, loading } = useAuth();
  const lessonId = params.lessonId as string;
  const [profession, setProfession] = useState<string | undefined>();

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then((p) => setProfession(p?.profession));
  }, [loading, session?.user?.id]);

  const lesson = getLessonForProfession(lessonId, profession);
  const quizQuestions = useMemo(
    () => (lesson ? lessonQuestionsToQuiz(lesson.questions) : []),
    [lesson],
  );

  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!lesson) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <StudyPageHeader
          backHref="/writing/learn"
          backLabel="Writing Academy"
          skill="writing"
          eyebrow="Writing · Academy"
          title="Lesson not found"
        />
        <p className="text-sm text-ink-soft">This lesson could not be loaded.</p>
      </div>
    );
  }

  const score = lesson.questions.reduce((acc, q) => {
    const selected = responses[q.id];
    const correct = q.options[q.correctIndex];
    return acc + (selected === correct ? 1 : 0);
  }, 0);
  const pct = lesson.questions.length ? Math.round((score / lesson.questions.length) * 100) : 0;
  const passed = pct >= 80;

  const handleSubmit = async () => {
    setSubmitted(true);
    await saveLessonProgress(lesson.id, pct, passed);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StudyPageHeader
        backHref="/writing/learn"
        backLabel="Writing Academy"
        skill="writing"
        eyebrow={`Writing · Academy · ${lesson.criterion}`}
        title={lesson.title}
      />

      <CollapsibleSection
        title="Lesson overview"
        subtitle={lesson.intro.length > 72 ? `${lesson.intro.slice(0, 69)}…` : lesson.intro}
        defaultOpen={false}
      >
        <p className="text-sm leading-relaxed text-ink-soft">{lesson.intro}</p>
      </CollapsibleSection>

      <StrongWeakExamplesPanel
        goodExample={lesson.goodExample}
        weakExample={lesson.weakExample}
        tip={lesson.tip}
        title={
          profession
            ? "Examples tailored to your profession"
            : "Strong & weak examples"
        }
      />

      <section>
        <h2 className="mb-4 font-semibold text-ink">Knowledge check</h2>
        <QuizQuestionList
          questions={quizQuestions}
          responses={responses}
          disabled={submitted}
          showFeedback={submitted}
          onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        />
      </section>

      {!submitted ? (
        <button
          type="button"
          disabled={lesson.questions.some((q) => responses[q.id] === undefined)}
          onClick={() => void handleSubmit()}
          className="min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Submit answers
        </button>
      ) : (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-lg font-semibold text-ink">
            Score: {pct}% {passed ? "— passed ✓" : "— review and retry"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/writing/practice")}
              className="min-h-11 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Practice a letter
            </button>
            <SecondaryActionLink href="/writing/learn">All lessons</SecondaryActionLink>
          </div>
        </section>
      )}
    </div>
  );
}
