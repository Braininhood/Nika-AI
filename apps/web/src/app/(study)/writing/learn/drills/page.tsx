"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import {
  scoreDrills,
  type ContentDrill,
} from "@/content/writing/drills";
import { applyWritingResult } from "@/lib/adaptive/skill-map";
import { useAuth } from "@/lib/auth/auth-provider";
import { drillQuestionsToQuiz } from "@/lib/quiz/lesson-questions";
import { loadUserProfile, saveSkillMap } from "@/lib/profile/service";
import { loadWritingContentContext } from "@/lib/writing/content-context";

export default function ContentDrillsPage() {
  const { session, loading } = useAuth();
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof scoreDrills> | null>(null);
  const [drills, setDrills] = useState<ContentDrill[]>([]);
  const [guidedRoute, setGuidedRoute] = useState("/writing/guided");

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setDrills(ctx.drills);
      setGuidedRoute(`/writing/guided/${ctx.primaryScenario.id}`);
    });
  }, [loading, session?.user?.id]);

  const quizQuestions = useMemo(() => drillQuestionsToQuiz(drills), [drills]);

  const handleSubmit = async () => {
    const answerIndexes = Object.fromEntries(
      drills.map((d) => {
        const selected = responses[d.id];
        const idx = d.options.findIndex((opt) => opt === selected);
        return [d.id, idx];
      }),
    );
    const scored = scoreDrills(answerIndexes, drills);
    setResult(scored);
    setSubmitted(true);

    const profile = await loadUserProfile();
    if (profile?.skillMap && scored.pct < 80) {
      const criterionScores = { content: scored.pct / 100, purpose: scored.pct / 100 };
      const updated = applyWritingResult(profile.skillMap, criterionScores, scored.weakTags);
      await saveSkillMap(updated);
    }
  };

  const allAnswered = drills.length > 0 && drills.every((d) => responses[d.id] !== undefined);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <StudyPageHeader
        backHref="/writing/learn"
        backLabel="Writing Academy"
        skill="writing"
        eyebrow="Writing · Academy · Drills"
        title="Content-selection drills"
        description="Train Purpose and Content criteria without writing a full letter. Drills include universal tasks plus profession-specific scenarios where relevant."
      />

      {!submitted && drills.length > 0 ? (
        <QuizQuestionList
          questions={quizQuestions}
          responses={responses}
          onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
        />
      ) : null}

      {!submitted && (
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!allAnswered}
          className="min-h-11 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-40"
        >
          Submit drills
        </button>
      )}

      {submitted && result && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-lg font-semibold text-ink">
            Score: {result.pct}% ({result.score}/{drills.length})
          </p>
          {result.pct < 80 && (
            <p className="mt-2 text-sm text-ink-soft">Focus tags: {result.weakTags.join(", ")}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={guidedRoute}
              className="inline-flex min-h-11 items-center rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Try guided wizard
            </Link>
            <SecondaryActionLink href="/writing/learn">Back to Academy</SecondaryActionLink>
          </div>
        </section>
      )}
    </div>
  );
}
