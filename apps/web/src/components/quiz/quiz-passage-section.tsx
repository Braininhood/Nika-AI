"use client";

import { PassagePanel } from "@/components/reading/passage-panel";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { QuizQuestion } from "@/content/reading/types";
import {
  partBExtractsForQuiz,
  passageBlocksForQuiz,
  passagePanelDefaultOpen,
  passageSectionHint,
} from "@/lib/quiz/engine";

interface QuizPassageSectionProps {
  questions: QuizQuestion[];
  defaultOpen?: boolean;
}

export function QuizPassageSection({
  questions,
  defaultOpen = false,
}: QuizPassageSectionProps) {
  const partBExtracts = partBExtractsForQuiz(questions);
  const fullBlocks = passageBlocksForQuiz(questions).filter((b) => b.part !== "B");
  const hint = passageSectionHint([...fullBlocks], questions, partBExtracts.length);

  if (!partBExtracts.length && !fullBlocks.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">Reading texts</h2>
      {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}

      {partBExtracts.map((extract) => (
        <CollapsibleSection
          key={extract.key}
          title={`Part B · Extract ${extract.index} of ${partBExtracts.length}`}
          subtitle={extract.title}
          defaultOpen={defaultOpen || extract.index === 1}
        >
          {extract.localeContext ? (
            <p className="mb-2 text-xs text-brand-primary">{extract.localeContext}</p>
          ) : null}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{extract.paragraph}</p>
        </CollapsibleSection>
      ))}

      {fullBlocks.map((block) => (
        <PassagePanel
          key={block.id}
          block={block}
          collapsible
          defaultOpen={defaultOpen || passagePanelDefaultOpen(block, questions)}
        />
      ))}
    </section>
  );
}
