"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ListeningSession } from "@/components/listening/listening-session";
import { getListeningBlock } from "@/content/listening";

export default function ListeningPartCSessionPage() {
  const params = useParams();
  const blockId = params.blockId as string;
  const block = getListeningBlock(blockId);

  if (!block || block.part !== "C") {
    return (
      <p className="py-8 text-sm text-ink-soft">
        Block not found.{" "}
        <Link href="/listening/part-c" className="text-brand-primary">
          Back
        </Link>
      </p>
    );
  }

  return <ListeningSession block={block} mode="part_c" backHref="/listening/part-c" />;
}
