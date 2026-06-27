"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ListeningSession } from "@/components/listening/listening-session";
import { getListeningBlock } from "@/content/listening";

export default function ListeningPartASessionPage() {
  const params = useParams();
  const blockId = params.blockId as string;
  const block = getListeningBlock(blockId);

  if (!block || block.part !== "A") {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Block not found.{" "}
        <Link href="/listening/part-a" className="text-brand-primary">
          Back
        </Link>
      </p>
    );
  }

  return <ListeningSession block={block} mode="part_a" backHref="/listening/part-a" backLabel="Part A list" />;
}
