"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { QuizQuestionList } from "@/components/reading/quiz-question";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import type { AssessmentSkill } from "@/content/assessment";
import type { QuizQuestion } from "@/content/reading/types";
import {
  loadGeneratedAssessment,
  markAssessmentComplete,
  questionsFromAssessment,
} from "@/lib/assessment/generated-store";
import { submitAssessmentAttempt } from "@/lib/quiz/submit-assessment";

export default function GeneratedAssessmentPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Nika assessment");
  const [skill, setSkill] = useState<AssessmentSkill>("reading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitAssessmentAttempt>> | null>(
    null,
  );

  useEffect(() => {
    void loadGeneratedAssessment(id).then((record) => {
      if (record) {
        setTitle(record.title);
        setSkill((record.skill as AssessmentSkill) || "reading");
        setQuestions(questionsFromAssessment(record));
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/nika"
          backLabel="Nika"
          eyebrow="Nika · Assessment"
          title="Loading assessment…"
        />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/nika"
          backLabel="Nika"
          eyebrow="Nika · Assessment"
          title="Assessment not found"
          description="Ask Nika to create a new quiz."
        />
        <SecondaryActionLink href="/nika" className="mt-4">
          Open Nika →
        </SecondaryActionLink>
      </div>
    );
  }

  const allAnswered = questions.every((q) => responses[q.id] !== undefined);

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <ReadingResultsPanel
          score={result.score}
          flashcardsAdded={result.flashcardsAdded}
          skillMapUpdated={result.skillMapUpdated}
          backHref="/nika"
          questions={questions}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-6">
      <StudyPageHeader
        backHref="/nika"
        backLabel="Nika"
        eyebrow="Nika · Custom assessment"
        title={title}
      />
      <QuizQuestionList
        questions={questions}
        responses={responses}
        onChange={(qid, value) => setResponses((prev) => ({ ...prev, [qid]: value }))}
      />
      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => {
          setSubmitting(true);
          void submitAssessmentAttempt({
            questions,
            responses,
            skill,
            mode: "nika_assessment",
          }).then((res) => {
            void markAssessmentComplete(id);
            setResult(res);
            setSubmitting(false);
          });
        }}
        className="min-h-11 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit assessment"}
      </button>
    </div>
  );
}
