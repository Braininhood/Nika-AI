"use client";

import { useEffect, useState } from "react";

import { PROGRESS_BADGES } from "@/lib/progress/badges";
import { loadUnlockedBadges } from "@/lib/progress/badge-store";
import type { ProgressBadgeId } from "@/lib/progress/types";
import { useAuth } from "@/lib/auth/auth-provider";

export function ProgressBadgesGrid({ compact = false }: { compact?: boolean }) {
  const { session } = useAuth();
  const [unlocked, setUnlocked] = useState<ProgressBadgeId[]>([]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    const reload = () => setUnlocked(loadUnlockedBadges(userId));
    reload();
    void import("@/lib/progress/badge-store").then(({ refreshProgressBadges }) =>
      refreshProgressBadges(userId).then(reload),
    );

    const onUpdate = () => reload();
    window.addEventListener("oet-badges-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("oet-badges-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [session?.user?.id]);

  const unlockedSet = new Set(unlocked);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold text-ink">Progress badges</h2>
        <p className="text-xs text-ink-soft">
          {unlocked.length}/{PROGRESS_BADGES.length}
        </p>
      </div>
      {!compact && (
        <p className="mt-1 text-sm text-ink-soft">
          Earn badges as you study — Nika celebrates when you unlock one.
        </p>
      )}
      <ul
        className={`mt-4 grid gap-2 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}
      >
        {PROGRESS_BADGES.map((badge) => {
          const earned = unlockedSet.has(badge.id);
          return (
            <li
              key={badge.id}
              title={badge.description}
              className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition ${
                earned
                  ? "border-brand-accent/50 bg-brand-accent-soft/30"
                  : "border-border bg-surface-muted/40 opacity-60 grayscale"
              }`}
            >
              <span className={`${compact ? "text-xl" : "text-2xl"}`} aria-hidden>
                {badge.icon}
              </span>
              <span className={`mt-1 font-medium text-ink ${compact ? "text-[10px]" : "text-xs"}`}>
                {badge.title}
              </span>
              {!compact && (
                <span className="mt-0.5 line-clamp-2 text-[10px] text-ink-soft">
                  {badge.description}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
