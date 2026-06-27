"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ReadingSession } from "@/components/reading/reading-session";
import { getReadingBlock } from "@/content/reading";

export default function ReadingPartAPage() {
  const params = useParams();
  const blockId = params.passageId as string;
  const block = getReadingBlock(blockId);

  if (!block || block.part !== "A") {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Passage not found.{" "}
        <Link href="/reading/part-a" className="text-brand-primary">
          Back
        </Link>
      </p>
    );
  }

  return (
    <ReadingSession
      block={block}
      timerMode="part_a"
      mode="part_a"
      backHref="/reading/part-a"
      backLabel="Part A list"
    />
  );
}
