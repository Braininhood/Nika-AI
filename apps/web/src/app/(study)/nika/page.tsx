"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { NikaChat } from "@/components/nika/nika-chat";
import { NikaAvatar } from "@/components/nika/nika-avatar";
import { useAuth } from "@/lib/auth/auth-provider";
import { deriveNikaStage, nikaProgressRatio, nikaStageLabel, nikaStageProgress } from "@/lib/nika/stage";
import { loadUserProfile } from "@/lib/profile/service";
import type { UserProfile } from "@/lib/domain/types";

export default function NikaPage() {
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadUserProfile(session?.user?.id).then(setProfile);
  }, [loading, session?.user?.id]);

  const stage = deriveNikaStage(profile?.skillMap);
  const stageProgress = nikaStageProgress(profile?.skillMap);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <header className="mb-4">
        <div className="flex items-start gap-4">
          <NikaAvatar
            size="lg"
            state="idle"
            glow={nikaProgressRatio(profile?.skillMap)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="font-display text-2xl font-bold text-ink">Nika</h1>
              <Link
                href="/materials"
                className="shrink-0 text-xs font-medium text-brand-primary hover:underline"
              >
                Materials
              </Link>
            </div>
            <p className="text-xs font-medium text-brand-primary">
              {nikaStageLabel(stage)} stage
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-brand-accent transition-[width] duration-500"
                style={{ width: `${Math.round(stageProgress * 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.round(stageProgress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Nika growth progress"
              />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Your self-learning OET coach — grounded in official OET guidance, regulator
              requirements, and your personal progress.
            </p>
          </div>
        </div>
      </header>

      {!session && !loading && (
        <p className="mb-3 rounded-xl border border-border bg-surface-muted p-3 text-sm text-ink-soft">
          <Link href="/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>{" "}
          for personalised advice and online AI. Offline mode uses cached OET knowledge only.
        </p>
      )}

      <NikaChat profile={profile} accessToken={session?.access_token} />
    </div>
  );
}
