"use client";

import { useEffect, useState } from "react";

import { ScenarioList } from "@/components/writing/scenario-list";
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
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Guided writing</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Step-by-step wizard — highlight notes, draft purpose, body, closing, then feedback.
        </p>
      </header>
      <ScenarioList scenarios={scenarios} hrefPrefix="/writing/guided" suffix="guided" />
    </div>
  );
}
