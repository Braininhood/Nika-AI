"use client";

import { useEffect, useState } from "react";

import { ScenarioList } from "@/components/writing/scenario-list";
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
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <p className="text-sm font-medium text-brand-primary">Writing</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Practice</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Full case notes + letter task. Offline checklist first, then AI feedback when online.
        </p>
        {professionLabel ? (
          <p className="mt-2 text-xs text-ink-soft">
            Scenarios for {professionLabel} — your target country is listed first.
          </p>
        ) : null}
        {stage === "learn" && (
          <p className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-ink">
            Your Skill Map suggests Writing Academy lessons first.
          </p>
        )}
        {stage === "guided" && (
          <p className="mt-2 rounded-lg bg-brand-accent-soft px-3 py-2 text-xs text-ink">
            Try the guided wizard before full independent practice.
          </p>
        )}
      </header>

      <ScenarioList
        scenarios={scenarios}
        hrefPrefix="/writing/practice"
        emptyMessage="Complete onboarding to see scenarios for your profession."
      />
    </div>
  );
}
