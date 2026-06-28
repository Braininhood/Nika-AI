"use client";

import { PassagePanel } from "@/components/reading/passage-panel";
import type { ReadingBlock } from "@/content/reading/types";

interface QuizPassageSectionProps {
  blocks: ReadingBlock[];
  defaultOpen?: boolean;
}

export function QuizPassageSection({ blocks, defaultOpen = false }: QuizPassageSectionProps) {
  if (!blocks.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">Reading texts</h2>
      <p className="text-xs text-ink-soft">
        Read Text A–D below, then answer the matching questions.
      </p>
      {blocks.map((block) => (
        <PassagePanel key={block.id} block={block} collapsible defaultOpen={defaultOpen} />
      ))}
    </section>
  );
}
