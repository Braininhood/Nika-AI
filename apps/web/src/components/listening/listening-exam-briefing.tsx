"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
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
      <CollapsibleSection
        title={`Part ${part} briefing`}
        subtitle={`${meta.label} · ~${meta.questions} questions in full exam`}
        defaultOpen={false}
      >
        <ul className="space-y-2 text-sm text-ink-soft">
          {LISTENING_STUDY_TIPS.filter((t) => t.part === part)
            .slice(0, 2)
            .map((tip) => (
              <li key={tip.title} className="rounded-lg bg-surface-muted px-3 py-2">
                <p className="font-medium text-ink">{tip.title}</p>
                <p className="mt-0.5 text-xs">{tip.body}</p>
              </li>
            ))}
        </ul>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection
      title="OET Listening guide"
      subtitle={`~${OET_LISTENING_OVERVIEW.totalMinutes} min · ${OET_LISTENING_OVERVIEW.totalQuestions} questions`}
      defaultOpen={false}
    >
      <p className="text-sm text-ink-soft">Same format for all 12 professions.</p>
      <ul className="mt-3 space-y-2 text-sm">
        {tips.map((tip) => (
          <li key={tip.title}>
            <span className="font-medium text-ink">{tip.title}</span>
            <span className="text-ink-soft"> — {tip.body}</span>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

export function ListeningStudyGuidePanel() {
  return (
    <CollapsibleSection
      title="How OET Listening works"
      subtitle={`~${OET_LISTENING_OVERVIEW.totalMinutes} min · ${OET_LISTENING_OVERVIEW.totalQuestions} questions · Parts A, B & C`}
      defaultOpen={false}
    >
      <p className="text-sm text-ink-soft">
        Same structure for all professions. Rotate UK, US, AU, IE, NZ, and CA accents in practice.
      </p>

      <dl className="mt-4 grid gap-3 text-sm">
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part A — consultation notes</dt>
          <dd className="mt-1 text-ink-soft">
            {OET_LISTENING_OVERVIEW.parts.A.questions} items · complete notes while listening ·
            spelling counts for drug names.
          </dd>
        </div>
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part B — short extracts</dt>
          <dd className="mt-1 text-ink-soft">
            {OET_LISTENING_OVERVIEW.parts.B.questions} clips · one MCQ each · gist, purpose, or
            next action.
          </dd>
        </div>
        <div className="rounded-xl bg-surface-muted px-3 py-2">
          <dt className="font-medium text-brand-primary">Part C — presentation / interview</dt>
          <dd className="mt-1 text-ink-soft">
            {OET_LISTENING_OVERVIEW.parts.C.questions} MCQs · questions follow audio order ·
            inference and attitude.
          </dd>
        </div>
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-ink">Study tips</h3>
      <ul className="mt-2 space-y-2 text-xs text-ink-soft">
        {LISTENING_STUDY_TIPS.slice(0, 4).map((tip) => (
          <li key={tip.title} className="border-l-2 border-brand-primary/30 pl-2">
            <strong className="text-ink">{tip.title}:</strong> {tip.body}
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
