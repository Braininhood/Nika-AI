"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getLessonForProfession } from "@/content/writing/lessons";
import { useAuth } from "@/lib/auth/auth-provider";
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

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!lesson) {
    return (
      <div className="py-8 text-sm text-ink-soft">
        Lesson not found.{" "}
        <Link href="/writing/learn" className="text-brand-primary hover:underline">
          Back to Academy
        </Link>
      </div>
    );
  }

  const score = lesson.questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const pct = lesson.questions.length ? Math.round((score / lesson.questions.length) * 100) : 0;
  const passed = pct >= 80;

  const handleSubmit = async () => {
    setSubmitted(true);
    await saveLessonProgress(lesson.id, pct, passed);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/writing/learn" className="text-sm text-ink-soft hover:text-ink">
        ← Writing Academy
      </Link>

      <header>
        <p className="text-sm font-medium text-brand-primary">{lesson.criterion}</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">{lesson.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{lesson.intro}</p>
        {profession && (
          <p className="mt-2 text-xs text-brand-primary">
            Examples tailored to your profession
          </p>
        )}
      </header>

      <section className="grid gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase text-forest">Strong example</p>
          <p className="mt-1 text-ink">{lesson.goodExample}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-danger">Weak example</p>
          <p className="mt-1 text-ink-soft">{lesson.weakExample}</p>
        </div>
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-ink-soft">
          <strong className="text-ink">Tip:</strong> {lesson.tip}
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-semibold text-ink">Knowledge check</h2>
        {lesson.questions.map((q, qi) => (
          <fieldset key={q.id} className="rounded-xl border border-border bg-surface p-4">
            <legend className="text-sm font-medium text-ink">
              {qi + 1}. {q.prompt}
            </legend>
            <ul className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <li key={opt}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === oi}
                      disabled={submitted}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className="mt-1 accent-brand-primary"
                    />
                    <span className={submitted && oi === q.correctIndex ? "font-medium text-forest" : ""}>
                      {opt}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {submitted && (
              <p className="mt-2 text-xs text-ink-soft">{q.explanation}</p>
            )}
          </fieldset>
        ))}
      </section>

      {!submitted ? (
        <button
          type="button"
          disabled={lesson.questions.some((q) => answers[q.id] === undefined)}
          onClick={() => void handleSubmit()}
          className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink disabled:opacity-40"
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
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink"
            >
              Practice a letter
            </button>
            <Link
              href="/writing/learn"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink"
            >
              All lessons
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
