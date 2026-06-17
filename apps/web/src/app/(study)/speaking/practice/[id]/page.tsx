"use client";

import { useParams } from "next/navigation";

import { SpeakingSession } from "@/components/speaking/speaking-session";
import { getRoleCard } from "@/content/speaking";
import Link from "next/link";

export default function SpeakingPracticePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const card = getRoleCard(id);

  if (!card) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <p className="text-ink-soft">Role card not found.</p>
        <Link href="/speaking" className="mt-4 text-sm text-brand-primary hover:underline">
          ← Speaking hub
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 py-6">
      <SpeakingSession card={card} backHref="/speaking" />
    </div>
  );
}
