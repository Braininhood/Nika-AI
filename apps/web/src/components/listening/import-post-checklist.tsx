"use client";

import Link from "next/link";

import {
  importChecklistForProfession,
  COMPUTER_SAMPLE_FAQ,
} from "@/content/media/study-knowledge-base";
import type { UserImportPack } from "@/lib/db/types";

interface ImportPostChecklistProps {
  pack: UserImportPack;
}

export function ImportPostChecklist({ pack }: ImportPostChecklistProps) {
  const items = importChecklistForProfession(pack.profession);
  const hasKey = Boolean(pack.parsed.answerKey && Object.keys(pack.parsed.answerKey).length);

  return (
    <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent/10 p-5">
      <h2 className="font-semibold text-ink">Next steps — use your import in the app</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Pack <strong>{pack.name}</strong> saved locally. Follow this checklist to practise across Phases
        1–3.
      </p>

      <ol className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-border bg-surface px-3 py-3 text-sm">
            <p className="font-medium text-ink">
              <span className="text-[10px] uppercase text-brand-primary">Phase {item.phase}</span>
              {" · "}
              {item.label}
            </p>
            <p className="mt-1 text-ink-soft">{item.detail}</p>
            <p className="mt-1 text-xs text-ink-soft">File: {item.fileHint}</p>
            <Link href={item.route} className="mt-2 inline-block text-sm font-medium text-brand-primary hover:underline">
              Open in app →
            </Link>
          </li>
        ))}
      </ol>

      {hasKey && (
        <p className="mt-4 text-sm text-ink-soft">
          Answer key detected ({Object.keys(pack.parsed.answerKey!).length} entries) — use the{" "}
          <a href="#answer-key-matcher" className="text-brand-primary hover:underline">
            answer-key matcher
          </a>{" "}
          below.
        </p>
      )}

      <div className="mt-4 rounded-lg border border-border bg-surface-muted/40 px-3 py-3 text-xs text-ink-soft">
        <p className="font-medium text-ink">{COMPUTER_SAMPLE_FAQ.title}</p>
        <p className="mt-1">{COMPUTER_SAMPLE_FAQ.body}</p>
        <a
          href={COMPUTER_SAMPLE_FAQ.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-brand-primary hover:underline"
        >
          Computer sample hub →
        </a>
      </div>
    </section>
  );
}
