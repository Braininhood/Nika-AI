"use client";

import { useEffect, useState } from "react";

import { ScenarioList } from "@/components/writing/scenario-list";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import type { WritingScenario } from "@/content/writing/scenarios";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { useAuth } from "@/lib/auth/auth-provider";

export default function GuidedListPage() {
  const { session, loading } = useAuth();
  const [scenarios, setScenarios] = useState<WritingScenario[]>([]);

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setScenarios(ctx.scenarios);
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="writing"
        eyebrow="Writing · Guided"
        title="Guided writing wizard"
        description="Step-by-step wizard — highlight notes, draft purpose, body, closing, then feedback."
        backHref="/writing/learn"
        backLabel="← Writing Academy"
      />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-bold text-ink">Choose a scenario</h2>
        <p className="mt-1 text-xs text-ink-soft">Nika walks you through each section of the letter.</p>
        <div className="mt-4">
          <ScenarioList scenarios={scenarios} hrefPrefix="/writing/guided" suffix="guided" />
        </div>
      </section>
    </div>
  );
}
