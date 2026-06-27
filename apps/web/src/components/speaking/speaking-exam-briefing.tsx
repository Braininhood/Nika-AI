"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { SPEAKING_EXAM_TIPS } from "@/lib/speaking/exam-guide";

export function SpeakingStudyGuidePanel({ compact = false }: { compact?: boolean }) {
  const tips = compact ? SPEAKING_EXAM_TIPS.slice(0, 4) : SPEAKING_EXAM_TIPS;

  return (
    <CollapsibleSection
      title="How OET Speaking works"
      subtitle="2 role-plays · 3 min prep · 5 min each · profession-specific cards"
      defaultOpen={false}
    >
      <p className="text-sm text-ink-soft">
        Warm-up is not assessed. Your profession determines scenario content. Examiners score
        linguistic and clinical communication criteria together.
      </p>

      <ul className="mt-4 space-y-3 text-sm">
        {tips.map((tip) => (
          <li key={tip.id} className="rounded-xl bg-surface-muted px-3 py-2">
            <p className="font-medium text-ink">{tip.title}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{tip.body}</p>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
