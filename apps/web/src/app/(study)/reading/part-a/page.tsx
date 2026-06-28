"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { blockRoute, blockSummary } from "@/content/reading";
import type { ReadingBlock } from "@/content/reading";
import { PartExamCta } from "@/components/study/part-exam-cta";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadReadingContentContext } from "@/lib/reading/content-context";

export default function ReadingPartAListPage() {
  const { session, loading } = useAuth();
  const [blocks, setBlocks] = useState<ReadingBlock[]>([]);

  useEffect(() => {
    if (loading) return;
    void loadReadingContentContext(session?.user?.id).then((ctx) => {
      setBlocks(ctx.blocks.filter((b) => b.part === "A"));
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="flex flex-col gap-4 pb-8">
      <StudyPageHeader
        backHref="/reading"
        backLabel="Reading hub"
        skill="reading"
        eyebrow="Reading · Part A"
        title="Expeditious reading"
        description="Practice: 4 matching questions per text set (Text A–D). Exam: 20 questions · 15 min lock."
      />

      <PartExamCta skill="reading" part="A" />

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Practice blocks (4 questions each)
      </p>
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link href={blockRoute("A", block.id)} className="font-medium text-brand-primary hover:underline">
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
