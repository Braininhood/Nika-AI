"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReadingExamBriefing } from "@/components/reading/reading-exam-briefing";
import { PassagePanel } from "@/components/reading/passage-panel";
import { QuizQuestionList } from "@/components/reading/quiz-question";
import { ReadingResultsPanel } from "@/components/reading/reading-results-panel";
import { ReadingTimerBar } from "@/components/reading/reading-timer-bar";
import type { ReadingBlock } from "@/content/reading";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadReadingContentContext } from "@/lib/reading/content-context";
import { submitReadingAttempt } from "@/lib/reading/submit-attempt";

export default function ReadingExamPage() {
  const { session, loading } = useAuth();
  const [examBlocks, setExamBlocks] = useState<ReadingBlock[]>([]);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [locked, setLocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitReadingAttempt>> | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    void loadReadingContentContext(session?.user?.id).then((ctx) => {
      setExamBlocks([ctx.primaryPartB, ctx.primaryPartC]);
    });
  }, [loading, session?.user?.id]);

  const questions = examBlocks.flatMap((b) => b.questions);
  const allAnswered = questions.length > 0 && questions.every((q) => responses[q.id] !== undefined);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await submitReadingAttempt({
      questions,
      responses,
      mode: "part_b",
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
        backHref="/reading/exam"
        questions={questions}
      />
    );
  }

  if (!examBlocks.length) {
    return <p className="py-8 text-sm text-ink-soft">Loading exam passages…</p>;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/reading" className="text-sm text-ink-soft hover:text-ink">
        ← Reading hub
      </Link>

      <header>
        <h1 className="text-xl font-bold text-ink">Reading exam — Parts B &amp; C</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Locale-matched passages for your profile. Combined 45-minute timer.
        </p>
      </header>

      <ReadingExamBriefing part="B" compact />
      <ReadingExamBriefing part="C" compact />

      <ReadingTimerBar mode="part_bc" locked={locked} onExpire={() => setLocked(true)} />

      {examBlocks.map((block) => (
        <div key={block.id} className="space-y-4">
          <PassagePanel block={block} collapsible defaultOpen />
          <QuizQuestionList
            questions={block.questions}
            responses={responses}
            disabled={locked}
            onChange={(id, value) => setResponses((prev) => ({ ...prev, [id]: value }))}
          />
        </div>
      ))}

      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => void handleSubmit()}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit exam block"}
      </button>
    </div>
  );
}
