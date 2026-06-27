"use client";

import { useEffect, useMemo, useState } from "react";

import { loadRotationContext } from "@/lib/content/rotation-context";
import { createSelectionSeed } from "@/lib/quiz/shuffle-seed";

export function useQuizSelection(userId?: string) {
  const [excludeIds, setExcludeIds] = useState<string[]>([]);
  const sessionNonce = useMemo(() => crypto.randomUUID(), []);
  const selectionSeed = useMemo(
    () => createSelectionSeed(userId, sessionNonce),
    [userId, sessionNonce],
  );

  useEffect(() => {
    void loadRotationContext().then((ctx) => setExcludeIds(ctx.questions));
  }, []);

  return { excludeIds, selectionSeed };
}
