"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { blockRoute, blockSummary } from "@/content/reading";
import type { ReadingBlock } from "@/content/reading";
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
        title="15 min lock"
        description="Profession-specific Part A blocks appear first, then universal matching texts."
      />
      <ul className="space-y-2 text-sm">
        {blocks.map((block) => (
          <li key={block.id} className="rounded-xl border border-border px-3 py-2">
            <Link href={blockRoute("A", block.id)} className="font-medium text-brand-primary hover:underline">
              {block.title}
            </Link>
            <p className="text-xs text-ink-soft">
              {block.questions.length} questions · {blockSummary(block)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
