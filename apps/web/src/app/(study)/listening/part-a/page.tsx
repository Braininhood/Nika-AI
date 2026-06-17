"use client";

import Link from "next/link";

import { blocksForUserPart } from "@/content/listening";

export default function ListeningPartAListPage() {
  const blocks = blocksForUserPart("A");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <header>
        <h1 className="text-xl font-bold text-ink">Part A — Note completion</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Complete consultation notes while listening. Spelling must be correct.
        </p>
      </header>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id}>
            <Link
              href={`/listening/part-a/${block.id}`}
              className="text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
            <span className="text-ink-soft"> · {block.questions.length} gaps</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
