"use client";

import Link from "next/link";

import { blocksForUserPart, blockSummary, listeningQuestionCount } from "@/content/listening";
import { PartExamCta } from "@/components/study/part-exam-cta";
import { StudyPageHeader } from "@/components/study/study-page-header";

export default function ListeningPartAListPage() {
  const blocks = blocksForUserPart("A");

  return (
    <div className="flex flex-col gap-4 pb-8">
      <StudyPageHeader
        backHref="/listening"
        backLabel="Listening hub"
        skill="listening"
        eyebrow="Listening · Part A"
        title="Note completion"
        description="Practice: one consultation per block (≈4 gaps). Exam: 24 gaps across multiple consultations."
      />

      <PartExamCta skill="listening" part="A" />

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Practice blocks</p>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link
              href={`/listening/part-a/${block.id}`}
              className="font-medium text-brand-primary hover:underline"
            >
              {block.title}
            </Link>
            <span className="text-ink-soft"> · {listeningQuestionCount(block)} gaps · {blockSummary(block)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
