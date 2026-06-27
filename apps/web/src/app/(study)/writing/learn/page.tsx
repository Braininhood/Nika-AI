"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { WritingStudyGuidePanel } from "@/components/writing/writing-exam-briefing";
import { StudySectionCard } from "@/components/study/study-section-card";
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

  const lessonItems = WRITING_LESSONS.map((lesson) => ({
    href: `/writing/learn/${lesson.id}`,
    label: lesson.title,
    hint: `${lesson.criterion} · ${lesson.questions.length} questions`,
    badge: completed.has(lesson.id) ? "Done" : recommended.includes(lesson.id) ? "For you" : undefined,
  }));

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="writing"
        eyebrow="Writing · Phase 1"
        title="Writing Academy"
        description={`Six OET criterion lessons with knowledge checks. Pass ≥ 80% to complete each lesson.${professionLabel ? ` Content below is tailored for ${professionLabel}.` : ""}`}
      />

      <WritingStudyGuidePanel />

      {recommended.length > 0 ? (
        <p className="rounded-xl border border-brand-primary/40 bg-brand-accent-soft/30 px-4 py-3 text-sm text-ink">
          Recommended for you based on your Skill Map — start with lessons marked &ldquo;For you&rdquo;.
        </p>
      ) : null}

      <StudySectionCard
        skill="writing"
        title="Start here"
        hubHref={primarySampleId ? `/writing/learn/samples/${primarySampleId}` : "/writing/learn/samples"}
        hubLabel={primarySampleId ? "Your profession's Grade B sample" : "Graded sample letters"}
        hubHint="Compare Grade B vs C for your profession"
        items={[
          {
            href: "/study/clever/writing",
            label: "Quick quiz",
            hint: "Writing criteria — 5 mixed questions",
          },
          {
            href: "/writing/learn/drills",
            label: "Content-selection drills",
            hint: "Train Purpose & Content without a full letter",
          },
          {
            href: "/writing/guided",
            label: "Guided writing wizard",
            hint: "Step-by-step letter building",
          },
          {
            href: "/writing/practice",
            label: "Independent practice",
            hint: "Full case notes + letter task",
          },
          {
            href: "/writing/exam",
            label: "Exam mode",
            hint: "5 + 40 min timed",
          },
        ]}
        highlighted
      />

      <StudySectionCard
        title="Criterion lessons"
        phase="Learn"
        items={lessonItems}
      />

      {letterTypes.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-base font-bold text-ink">
            Letter types{professionLabel ? ` · ${professionLabel}` : ""}
          </h2>
          <ul className="mt-4 space-y-3">
            {letterTypes.map((mod) => (
              <li key={mod.id}>
                <CollapsibleSection
                  title={mod.title}
                  subtitle={mod.summary}
                  defaultOpen={false}
                >
                  <ol className="list-decimal pl-5 text-xs text-ink-soft">
                    {mod.structure.map((step) => (
                      <li key={step} className="mt-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-brand-primary">{mod.tip}</p>
                </CollapsibleSection>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-ink-soft">
          Complete onboarding to see letter types for your role.
        </p>
      )}

      <Link
        href="/study"
        className="text-center text-sm font-semibold text-brand-primary hover:underline"
      >
        ← All study skills
      </Link>
    </div>
  );
}
