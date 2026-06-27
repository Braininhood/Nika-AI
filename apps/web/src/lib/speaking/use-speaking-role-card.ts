"use client";

import { useEffect, useState } from "react";

import { getRoleCard, type RolePlayCard } from "@/content/speaking";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadSpeakingContentContext } from "@/lib/speaking/content-context";

export function useSpeakingRoleCard(cardId: string): {
  card: RolePlayCard | undefined;
  loading: boolean;
} {
  const { session, loading: authLoading } = useAuth();
  const [card, setCard] = useState<RolePlayCard | undefined>(() => getRoleCard(cardId));
  const [resolved, setResolved] = useState(() => Boolean(getRoleCard(cardId)));

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    void loadSpeakingContentContext(session?.user?.id).then((ctx) => {
      if (cancelled) return;
      const fromCatalog = ctx.cards.find((item) => item.id === cardId);
      setCard(fromCatalog ?? getRoleCard(cardId));
      setResolved(true);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, cardId, session?.user?.id]);

  return {
    card,
    loading: authLoading || !resolved,
  };
}
