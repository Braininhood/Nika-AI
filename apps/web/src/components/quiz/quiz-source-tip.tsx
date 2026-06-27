"use client";

import Link from "next/link";

import { CollapsibleSection } from "@/components/ui/collapsible-section";

export function QuizSourceTip() {
  return (
    <CollapsibleSection
      title="About these questions"
      subtitle="Personalised from our practice bank — scored instantly with full feedback"
      defaultOpen={false}
      variant="accent"
      badge="Tip"
    >
      <div className="space-y-3 text-sm text-ink-soft">
        <p>
          Each quiz is built from verified OET-style questions. Nika selects items for{" "}
          <em>your</em> weak areas and varies the set each time, so you can trust the score and
          see exactly what to fix after every attempt.
        </p>
        <p>
          Want a completely fresh set? Ask{" "}
          <Link href="/nika" className="font-semibold text-brand-primary hover:underline">
            Nika
          </Link>{" "}
          to create a custom assessment — new questions tailored to your profession and goals.
        </p>
      </div>
    </CollapsibleSection>
  );
}
