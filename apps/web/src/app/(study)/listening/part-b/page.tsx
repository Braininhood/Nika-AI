"use client";

import Link from "next/link";

import { blocksForUserPart } from "@/content/listening";

export default function ListeningPartBListPage() {
  const blocks = blocksForUserPart("B");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <header>
        <h1 className="text-xl font-bold text-ink">Part B — Workplace extracts</h1>
        <p className="mt-1 text-sm text-ink-soft">One short clip, one MCQ per screen.</p>
      </header>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id}>
            <Link
              href={`/listening/part-b/${block.id}`}
              className="text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
