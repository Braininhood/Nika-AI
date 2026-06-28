"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PartExamCta } from "@/components/study/part-exam-cta";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { blockRoute, blockSummary } from "@/content/reading";
import type { ReadingBlock } from "@/content/reading";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadReadingContentContext } from "@/lib/reading/content-context";

export default function ReadingPartCListPage() {
  const { session, loading } = useAuth();
  const [blocks, setBlocks] = useState<ReadingBlock[]>([]);

  useEffect(() => {
    if (loading) return;
    void loadReadingContentContext(session?.user?.id).then((ctx) => {
      setBlocks(ctx.blocks.filter((b) => b.part === "C"));
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <StudyPageHeader
        backHref="/reading"
        backLabel="Reading hub"
        skill="reading"
        eyebrow="Reading · Part C"
        title="Inference"
        description="Practice: one text at a time. Exam: 16 MCQs across two long texts (shared 45 min with Part B)."
      />

      <PartExamCta skill="reading" part="C" />

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Practice blocks</p>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link href={blockRoute("C", block.id)} className="font-medium text-brand-primary hover:underline">
              {block.title}
            </Link>
            <p className="text-xs text-ink-soft">
              {block.questions?.length ?? 0} questions · {blockSummary(block)} · practice mode
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
