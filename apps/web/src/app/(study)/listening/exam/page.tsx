"use client";

import Link from "next/link";
import { useState } from "react";

import { ListeningSession } from "@/components/listening/listening-session";
import { SecondaryActionButton } from "@/components/ui/secondary-action-button";
import { getListeningBlock, pickPlanListeningBlock } from "@/content/listening";

export default function ListeningExamPage() {
  const partB = pickPlanListeningBlock(undefined, undefined, 0, "B");
  const partC = pickPlanListeningBlock(undefined, undefined, 0, "C");
  const [step, setStep] = useState<"brief" | "b" | "c">("brief");

  if (step === "b") {
    const block = getListeningBlock(partB.id);
    if (!block) return null;
    return (
      <ListeningSession
        block={block}
        mode="part_b"
        backHref="/listening/exam"
        examMode
      />
    );
  }

  if (step === "c") {
    const block = getListeningBlock(partC.id);
    if (!block) return null;
    return (
      <ListeningSession
        block={block}
        mode="part_c"
        backHref="/listening/exam"
        examMode
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Link href="/listening" className="text-sm text-ink-soft hover:text-ink">
        ← Listening hub
      </Link>
      <header>
        <h1 className="text-xl font-bold text-ink">Listening exam block</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Part B single-question flow, then Part C MCQ set. Exam mode limits audio replay.
        </p>
      </header>
      <ol className="list-inside list-decimal space-y-2 text-sm text-ink-soft">
        <li>Part B — {partB.title}</li>
        <li>Part C — {partC.title}</li>
      </ol>
      <button
        type="button"
        onClick={() => setStep("b")}
        className="rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-ink"
      >
        Start Part B →
      </button>
      <SecondaryActionButton onClick={() => setStep("c")}>Skip to Part C</SecondaryActionButton>
    </div>
  );
}
