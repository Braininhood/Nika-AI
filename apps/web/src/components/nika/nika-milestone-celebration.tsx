"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { NikaAvatar } from "@/components/nika/nika-avatar";
import { nikaMilestoneMessage, type NikaMilestone } from "@/lib/nika/milestones";
import { subscribeNikaMilestones } from "@/lib/nika/milestone-store";
import { badgeById } from "@/lib/progress/badges";
import { badgeUnlockMessage, subscribeBadgeUnlocks } from "@/lib/progress/badge-store";
import type { ProgressBadgeId } from "@/lib/progress/types";
import { nikaProgressRatio } from "@/lib/nika/stage";

const AUTO_DISMISS_MS = 2800;

type CelebrationItem =
  | { kind: "milestone"; data: NikaMilestone }
  | { kind: "badge"; data: ProgressBadgeId };

export function NikaMilestoneCelebration() {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<CelebrationItem[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return subscribeNikaMilestones((milestones) => {
      setQueue((prev) => [
        ...prev,
        ...milestones.map((data) => ({ kind: "milestone" as const, data })),
      ]);
    });
  }, []);

  useEffect(() => {
    return subscribeBadgeUnlocks((badgeIds) => {
      setQueue((prev) => [
        ...prev,
        ...badgeIds.map((data) => ({ kind: "badge" as const, data })),
      ]);
    });
  }, []);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [current, dismiss]);

  if (!mounted || !current) return null;

  const isBadge = current.kind === "badge";
  const message = isBadge
    ? badgeUnlockMessage(current.data)
    : nikaMilestoneMessage(current.data);
  const milestone = current.kind === "milestone" ? current.data : null;
  const avatarState =
    isBadge || milestone?.type === "stage" || milestone?.type === "diagnostic"
      ? "proud"
      : "celebrating";
  const badge = isBadge ? badgeById(current.data) : null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[75] flex justify-center px-4 sm:bottom-8"
      aria-live="polite"
    >
      <div
        className={`nika-milestone-card pointer-events-auto flex max-w-sm items-start gap-4 rounded-2xl border p-4 shadow-xl ${
          isBadge ? "border-brand-primary/40 bg-brand-accent-soft/20" : "border-brand-accent/40 bg-surface"
        }`}
      >
        <div className="relative shrink-0">
          {isBadge ? (
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface text-3xl shadow-inner ring-2 ring-brand-accent/30"
              aria-hidden
            >
              {badge?.icon}
            </div>
          ) : (
            <>
              <NikaAvatar size="md" state={avatarState} glow={nikaProgressRatio()} />
              <span className="nika-milestone-sparkle" aria-hidden />
            </>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className="font-display text-sm font-semibold text-ink">
            {isBadge ? "Progress badge" : "Nika"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
          <button
            type="button"
            onClick={dismiss}
            className="mt-3 min-h-9 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-accent-soft"
          >
            {isBadge ? "Got it!" : "Nice!"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
