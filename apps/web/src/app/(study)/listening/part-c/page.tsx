"use client";

import Link from "next/link";

import { blocksForUserPart } from "@/content/listening";

export default function ListeningPartCListPage() {
  const blocks = blocksForUserPart("C");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <header>
        <h1 className="text-xl font-bold text-ink">Part C — Presentations</h1>
        <p className="mt-1 text-sm text-ink-soft">Extended speech with inference MCQs.</p>
      </header>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id}>
            <Link
              href={`/listening/part-c/${block.id}`}
              className="text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
            <span className="text-ink-soft"> · {block.questions.length} Q</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
