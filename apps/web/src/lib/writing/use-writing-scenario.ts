"use client";

import { useEffect, useState } from "react";

import { getScenario, type WritingScenario } from "@/content/writing/scenarios";
import { useAuth } from "@/lib/auth/auth-provider";
import { warmContentCatalog } from "@/lib/content/merged-catalog";
import { loadWritingContentContext } from "@/lib/writing/content-context";

export function useWritingScenario(scenarioId: string): {
  scenario: WritingScenario | undefined;
  loading: boolean;
} {
  const { session, loading: authLoading } = useAuth();
  const [scenario, setScenario] = useState<WritingScenario | undefined>(() =>
    getScenario(scenarioId),
  );
  const [resolved, setResolved] = useState(() => Boolean(getScenario(scenarioId)));

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    void (async () => {
      if (session?.access_token) {
        await warmContentCatalog(session.access_token);
      }
      await loadWritingContentContext(session?.user?.id);
      if (cancelled) return;
      setScenario(getScenario(scenarioId));
      setResolved(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, scenarioId, session?.user?.id]);

  return {
    scenario,
    loading: authLoading || !resolved,
  };
}
