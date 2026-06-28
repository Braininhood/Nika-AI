import { CollapsibleSection } from "@/components/ui/collapsible-section";
import type { ReadingBlock } from "@/content/reading";
import { blockSummary } from "@/content/reading";

interface PassagePanelProps {
  block: ReadingBlock;
  /** When true, passage text can be collapsed (default: open). */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const PART_A_TEXT_LABEL = /^Text ([A-D])\s*[—–-]\s*/;

function splitPartAText(para: string): { label: string | null; body: string } {
  const match = para.match(PART_A_TEXT_LABEL);
  if (!match) return { label: null, body: para };
  return { label: match[1]!, body: para.replace(PART_A_TEXT_LABEL, "") };
}

function PassageBody({ block }: { block: ReadingBlock }) {
  const paragraphs = block.paragraphs ?? [];
  const isPartAMatching = block.part === "A" && paragraphs.some((p) => PART_A_TEXT_LABEL.test(p));

  return (
    <div className="space-y-3 text-sm leading-relaxed text-ink">
      {paragraphs.map((para, i) => {
        const { label, body } = splitPartAText(para);
        if (label && isPartAMatching) {
          return (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2 [overflow-wrap:anywhere]"
            >
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                Text {label}
              </p>
              <p>{body}</p>
            </div>
          );
        }
        return (
          <p
            key={i}
            className="break-words rounded-lg bg-surface-muted px-3 py-2 [overflow-wrap:anywhere]"
          >
            {para}
          </p>
        );
      })}
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
        subtitle={`Part ${block.part} · ${(block.paragraphs?.length ?? 0)} paragraph${(block.paragraphs?.length ?? 0) === 1 ? "" : "s"}`}
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
