import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { ReadingBlock } from "@/content/reading";
import { blockSummary } from "@/content/reading";

interface PassagePanelProps {
  block: ReadingBlock;
  /** When true, passage text can be collapsed (default: open). */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

function PassageBody({ block }: { block: ReadingBlock }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink">
      {block.paragraphs.map((para, i) => (
        <p key={i} className="break-words rounded-lg bg-surface-muted px-3 py-2 [overflow-wrap:anywhere]">
          {para}
        </p>
      ))}
    </div>
  );
}

function PassageMeta({ block }: { block: ReadingBlock }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase text-brand-primary">Part {block.part}</p>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-soft">
          {blockSummary(block)}
        </span>
      </div>
      {block.localeContext ? (
        <p className="mt-1 text-xs text-brand-primary">{block.localeContext}</p>
      ) : null}
      <p className="mt-1 text-xs text-ink-soft">
        ~{block.durationMinutes} min · difficulty {block.difficulty}/3
      </p>
    </>
  );
}

export function PassagePanel({ block, collapsible = false, defaultOpen = true }: PassagePanelProps) {
  if (collapsible) {
    return (
      <CollapsibleSection
        title={block.title}
        subtitle={`Part ${block.part} · ${block.paragraphs.length} paragraph${block.paragraphs.length === 1 ? "" : "s"}`}
        defaultOpen={defaultOpen}
      >
        <PassageMeta block={block} />
        <div className="mt-4">
          <PassageBody block={block} />
        </div>
      </CollapsibleSection>
    );
  }

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
      <div className="mt-4">
        <PassageBody block={block} />
      </div>
    </section>
  );
}
