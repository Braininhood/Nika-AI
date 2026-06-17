"use client";

import type { ListeningPart } from "@/content/listening/types";
import { LISTENING_STUDY_TIPS, OET_LISTENING_OVERVIEW } from "@/lib/listening/exam-guide";

interface ListeningExamBriefingProps {
  part?: ListeningPart;
  compact?: boolean;
}

export function ListeningExamBriefing({ part, compact = false }: ListeningExamBriefingProps) {
  const tips = part
    ? LISTENING_STUDY_TIPS.filter((t) => t.part === part).slice(0, compact ? 1 : 2)
    : LISTENING_STUDY_TIPS.filter((t) => t.part === "all").slice(0, 1);

  if (compact && part) {
    const meta = OET_LISTENING_OVERVIEW.parts[part];
    return (
      <p className="text-xs text-ink-soft">
        Part {part}: {meta.label} · ~{meta.questions} questions in full exam
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface-muted/40 p-4">
      <h2 className="font-semibold text-ink">OET Listening guide</h2>
      <p className="mt-1 text-xs text-ink-soft">
        ~{OET_LISTENING_OVERVIEW.totalMinutes} min · {OET_LISTENING_OVERVIEW.totalQuestions}{" "}
        questions · same for all professions
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {tips.map((tip) => (
          <li key={tip.title}>
            <span className="font-medium text-ink">{tip.title}</span>
            <span className="text-ink-soft"> — {tip.body}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ListeningStudyGuidePanel() {
  return <ListeningExamBriefing />;
}
