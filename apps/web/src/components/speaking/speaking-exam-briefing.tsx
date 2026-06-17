"use client";

import { SPEAKING_EXAM_TIPS } from "@/lib/speaking/exam-guide";

export function SpeakingStudyGuidePanel({ compact = false }: { compact?: boolean }) {
  const tips = compact ? SPEAKING_EXAM_TIPS.slice(0, 4) : SPEAKING_EXAM_TIPS;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-semibold text-ink">OET Speaking guide</h2>
      <p className="mt-1 text-xs text-ink-soft">
        2 role-plays · 3 min prep each · 5 min performance · profession-specific cards
      </p>
      <ul className="mt-3 space-y-3 text-sm">
        {tips.map((tip) => (
          <li key={tip.id}>
            <p className="font-medium text-ink">{tip.title}</p>
            <p className="text-ink-soft">{tip.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
