"use client";

import Link from "next/link";

import { blocksForUserPart, blockSummary, listeningQuestionCount } from "@/content/listening";
import { PartExamCta } from "@/components/study/part-exam-cta";
import { StudyPageHeader } from "@/components/study/study-page-header";

export default function ListeningPartCListPage() {
  const blocks = blocksForUserPart("C");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <StudyPageHeader
        backHref="/listening"
        backLabel="Listening hub"
        skill="listening"
        eyebrow="Listening · Part C"
        title="Presentations"
        description="Practice: one block at a time. Exam: 12 MCQs across presentation clips."
      />

      <PartExamCta skill="listening" part="C" />

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Practice blocks</p>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link
              href={`/listening/part-c/${block.id}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
            <span className="text-ink-soft"> · {listeningQuestionCount(block)} Q · {blockSummary(block)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
