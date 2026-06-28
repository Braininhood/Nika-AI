"use client";

import { CLEVER_SKILL_LABELS, CLEVER_SKILL_ROUTES } from "@/content/assessment";
import { cleverQuizHint } from "@/lib/exam/oet-counts";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { StudySectionCard } from "@/components/study/study-section-card";

const SKILLS = ["reading", "listening", "writing", "speaking", "vocab"] as const;

export default function QuickQuizHubPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        eyebrow="Practice"
        title="Quick quizzes"
        description="Exam-faithful simulations for Reading & Listening (full part counts). Writing, Speaking & Vocabulary use expanded criteria/phrase banks (12–15 questions)."
        backHref="/study"
        backLabel="← Back to study hub"
      />

      <p className="rounded-xl border border-border bg-surface-muted/50 px-4 py-3 text-sm text-ink-soft">
        You can also start a quiz from each skill hub (Reading, Listening, etc.) or ask Nika in chat:
        &ldquo;give me a vocabulary quiz&rdquo;.
      </p>

      <StudySectionCard
        title="Pick a skill"
        items={SKILLS.map((skill) => ({
          href: CLEVER_SKILL_ROUTES[skill],
          label: CLEVER_SKILL_LABELS[skill],
          hint: cleverQuizHint(skill),
        }))}
        highlighted
      />

      <StudySectionCard
        title="All skills"
        hubHref="/study/clever/mixed"
        hubLabel={CLEVER_SKILL_LABELS.mixed}
        hubHint="One question from each skill area"
        items={[
          {
            href: "/vocabulary",
            label: "Vocabulary word list",
            hint: "Translate, explain & pronounce",
          },
        ]}
      />
    </div>
  );
}
