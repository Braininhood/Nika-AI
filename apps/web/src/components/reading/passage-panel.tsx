import type { ReadingBlock } from "@/content/reading";
import { blockSummary } from "@/content/reading";

interface PassagePanelProps {
  block: ReadingBlock;
}

export function PassagePanel({ block }: PassagePanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase text-brand-primary">Part {block.part}</p>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-soft">
            {blockSummary(block)}
          </span>
        </div>
        <h2 className="mt-1 text-lg font-bold text-ink">{block.title}</h2>
        {block.localeContext ? (
          <p className="mt-1 text-xs text-brand-primary">{block.localeContext}</p>
        ) : null}
        <p className="mt-1 text-xs text-ink-soft">
          ~{block.durationMinutes} min · difficulty {block.difficulty}/3
        </p>
      </header>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
        {block.paragraphs.map((para, i) => (
          <p key={i} className="rounded-lg bg-surface-muted px-3 py-2">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
