"use client";

import { useEffect, useState } from "react";

import { ScenarioList } from "@/components/writing/scenario-list";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { getProfessionLabel } from "@/lib/domain/professions";
import type { WritingScenario } from "@/content/writing/scenarios";
import { loadWritingContentContext } from "@/lib/writing/content-context";
import { recommendedWritingStage } from "@/lib/adaptive/skill-map";
import { useAuth } from "@/lib/auth/auth-provider";

export default function WritingPracticeListPage() {
  const { session, loading } = useAuth();
  const [scenarios, setScenarios] = useState<WritingScenario[]>([]);
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);
  const [stage, setStage] = useState<string>("practice");

  useEffect(() => {
    if (loading) return;
    void loadWritingContentContext(session?.user?.id).then((ctx) => {
      setScenarios(ctx.scenarios);
      if (ctx.profession) {
        setProfessionLabel(getProfessionLabel(ctx.profession));
      }
      setStage(recommendedWritingStage(ctx.profile?.skillMap));
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="writing"
        eyebrow="Writing · Practice"
        title="Independent practice"
        description={`Full case notes + letter task. Offline checklist first, then AI feedback when online.${professionLabel ? ` Scenarios for ${professionLabel} — your target country is listed first.` : ""}`}
        backHref="/writing/learn"
        backLabel="← Writing Academy"
      />

      {stage === "learn" ? (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">
          Your Skill Map suggests Writing Academy lessons first.
        </p>
      ) : null}
      {stage === "guided" ? (
        <p className="rounded-xl border border-brand-primary/40 bg-brand-accent-soft/30 px-4 py-3 text-sm text-ink">
          Try the guided wizard before full independent practice.
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-base font-bold text-ink">Scenarios</h2>
        <p className="mt-1 text-xs text-ink-soft">Tap a scenario to open case notes and write your letter.</p>
        <div className="mt-4">
          <ScenarioList
            scenarios={scenarios}
            hrefPrefix="/writing/practice"
            emptyMessage="Complete onboarding to see scenarios for your profession."
          />
        </div>
      </section>
    </div>
  );
}
