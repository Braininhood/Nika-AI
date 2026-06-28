"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ReadingSession } from "@/components/reading/reading-session";
import { getReadingBlock } from "@/content/reading";

export default function ReadingPartCPage() {
  const params = useParams();
  const blockId = params.passageId as string;
  const block = getReadingBlock(blockId);

  if (!block || block.part !== "C") {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Passage not found.{" "}
        <Link href="/reading/part-c" className="text-brand-primary">
          Back
        </Link>
      </p>
    );
  }

  return (
    <ReadingSession
      block={block}
      mode="part_c"
      backHref="/reading/part-c"
      backLabel="Part C list"
    />
  );
}
