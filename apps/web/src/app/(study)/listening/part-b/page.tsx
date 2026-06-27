"use client";

import Link from "next/link";

import { blocksForUserPart } from "@/content/listening";
import { StudyPageHeader } from "@/components/study/study-page-header";

export default function ListeningPartBListPage() {
  const blocks = blocksForUserPart("B");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <StudyPageHeader
        backHref="/listening"
        backLabel="Listening hub"
        skill="listening"
        eyebrow="Listening · Part B"
        title="Workplace extracts"
        description="One short clip, one MCQ per screen."
      />
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link
              href={`/listening/part-b/${block.id}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
