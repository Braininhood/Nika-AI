"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { lessonIdsForWeakTags } from "@/lib/adaptive/skill-map";
import type { LetterTypeModule } from "@/content/writing/letter-types";
import { WRITING_LESSONS } from "@/content/writing/lessons";
import { primarySampleForProfession } from "@/content/writing/sample-letters";
import { getProfessionLabel } from "@/lib/domain/professions";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { useAuth } from "@/lib/auth/auth-provider";
import { getAllLessonProgress } from "@/lib/writing/progress";

export default function WritingLearnPage() {
  const { session, loading } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [recommended, setRecommended] = useState<string[]>([]);
  const [letterTypes, setLetterTypes] = useState<LetterTypeModule[]>([]);
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);
  const [primarySampleId, setPrimarySampleId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    void getAllLessonProgress().then((rows) => {
      setCompleted(new Set(rows.filter((r) => r.completed).map((r) => r.lessonId)));
    });
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      const tags = ctx.profile?.skillMap?.diagnostic.writing.weakTags ?? ["writing:purpose"];
      setRecommended(lessonIdsForWeakTags(tags));
      setLetterTypes(ctx.letterTypes);
      if (ctx.profession) {
        setProfessionLabel(getProfessionLabel(ctx.profession));
        const sample = primarySampleForProfession(ctx.profession);
        setPrimarySampleId(sample?.id ?? null);
      }
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <p className="text-sm font-medium text-brand-primary">Writing Academy</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Learn</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Six OET criterion lessons with knowledge checks. Pass ≥ 80% to complete each lesson.
          {professionLabel ? ` Content below is tailored for ${professionLabel}.` : ""}
        </p>
      </header>

      <Link
        href="/writing/learn/drills"
        className="rounded-xl border border-dashed border-brand-primary bg-brand-accent-soft/30 px-4 py-3 text-sm font-medium text-ink hover:bg-brand-accent-soft/50"
      >
        Content-selection drills → train Purpose &amp; Content without a full letter
      </Link>

      {primarySampleId ? (
        <Link
          href={`/writing/learn/samples/${primarySampleId}`}
          className="rounded-xl border border-brand-primary bg-brand-accent-soft/40 px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-accent-soft/60"
        >
          Start with your profession&apos;s Grade B sample →
        </Link>
      ) : null}

      <Link
        href="/writing/learn/samples"
        className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink hover:bg-surface-muted"
      >
        Graded sample letters → compare Grade B vs C for your profession
      </Link>

      {recommended.length > 0 && (
        <p className="rounded-xl bg-brand-accent-soft px-4 py-3 text-sm text-ink">
          Recommended for you based on your Skill Map — start with the highlighted lessons.
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold text-ink">Criterion lessons</h2>
        <ul className="mt-3 space-y-3">
          {WRITING_LESSONS.map((lesson) => {
            const done = completed.has(lesson.id);
            const rec = recommended.includes(lesson.id);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/writing/learn/${lesson.id}`}
                  className={`flex items-center justify-between rounded-xl border px-4 py-4 transition hover:bg-surface-muted ${
                    rec ? "border-brand-primary bg-brand-accent-soft/40" : "border-border bg-surface"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-ink">{lesson.title}</p>
                    <p className="text-xs text-ink-soft">
                      {lesson.criterion} · {lesson.questions.length} questions
                    </p>
                  </div>
                  <span className="text-sm text-forest">{done ? "✓ Done" : "→"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink">
          Letter types for your profession
          {professionLabel ? ` (${professionLabel})` : ""}
        </h2>
        {letterTypes.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">Complete onboarding to see letter types for your role.</p>
        ) : (
        <ul className="mt-3 space-y-3">
          {letterTypes.map((mod) => (
            <li
              key={mod.id}
              className="rounded-xl border border-border bg-surface px-4 py-4 text-sm"
            >
              <p className="font-semibold text-ink">{mod.title}</p>
              <p className="mt-1 text-ink-soft">{mod.summary}</p>
              <ol className="mt-2 list-decimal pl-5 text-xs text-ink-soft">
                {mod.structure.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 text-xs text-brand-primary">{mod.tip}</p>
            </li>
          ))}
        </ul>
        )}
      </section>
    </div>
  );
}