"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  accentsInCatalog,
  blockRoute,
  blockSummary,
  blocksForAccent,
  blocksForPart,
} from "@/content/listening";
import type { ListeningAccent, ListeningPart } from "@/content/listening";

export function AccentPracticeLibrary() {
  const accents = accentsInCatalog();
  const [accent, setAccent] = useState<ListeningAccent>("UK");
  const [part, setPart] = useState<ListeningPart | "all">("all");

  const blocks = useMemo(() => {
    const list = blocksForAccent(accent);
    return part === "all" ? list : list.filter((b) => b.part === part);
  }, [accent, part]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="font-semibold text-ink">Practice by accent &amp; place</h2>
      <p className="mt-1 text-xs text-ink-soft">
        {blocksForPart("A").length} Part A · {blocksForPart("B").length} Part B ·{" "}
        {blocksForPart("C").length} Part C blocks — rotate accents like the real exam.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {accents.map((a) => (
          <button
            key={`accent-${a}`}
            type="button"
            onClick={() => setAccent(a)}
            className={`rounded-full px-3 py-1 text-xs ${
              accent === a ? "bg-brand-accent font-semibold text-ink" : "bg-surface-muted text-ink-soft"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {(["all", "A", "B", "C"] as const).map((p) => (
          <button
            key={`part-${p}`}
            type="button"
            onClick={() => setPart(p)}
            className={`rounded-full px-3 py-1 ${
              part === p ? "border border-brand-primary text-brand-primary" : "text-ink-soft"
            }`}
          >
            {p === "all" ? "All parts" : `Part ${p}`}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {blocks.map((block, index) => (
          <li key={`${block.id}-${index}`}>
            <Link href={blockRoute(block.part, block.id)} className="text-brand-primary hover:underline">
              {block.title}
            </Link>
            <span className="text-ink-soft">
              {" "}
              · {block.localeContext ?? blockSummary(block)}
            </span>
          </li>
        ))}
        {blocks.length === 0 && (
          <li className="text-ink-soft">No blocks for this filter yet.</li>
        )}
      </ul>
    </section>
  );
}
