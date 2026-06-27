"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TodayTipPanel } from "@/components/vocabulary/today-tip-panel";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { useAuth } from "@/lib/auth/auth-provider";
import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";
import { loadUserProfile } from "@/lib/profile/service";
import { fetchTodayTip, type TodayTip } from "@/lib/vocabulary/today-tip";

export default function TodayTipPage() {
  const { session, loading } = useAuth();
  const [tip, setTip] = useState<TodayTip | null>(null);
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    void (async () => {
      const profile = await loadUserProfile(session?.user?.id);
      const profession = profile?.profession;
      if (profession) {
        setProfessionLabel(getProfessionLabel(profession as OetProfession));
      }
      const result = await fetchTodayTip(session?.access_token, profession);
      setTip(result);
      setFetching(false);
    })();
  }, [loading, session?.access_token, session?.user?.id]);

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <SkillHubHeader
          eyebrow="Daily tip"
          title="Loading today&apos;s tip…"
          description="Fetching your profession tip from Nika."
          backHref="/dashboard"
          backLabel="← Home"
        />
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <SkillHubHeader
          eyebrow="Daily tip"
          title="Today&apos;s tip unavailable"
          description="Sign in while online to load your profession tip from Nika."
          backHref="/dashboard"
          backLabel="← Home"
        />
        <SecondaryActionLink href="/vocabulary" className="mt-4">
          Open vocabulary
        </SecondaryActionLink>
      </div>
    );
  }

  const tailoredLabel =
    professionLabel ?? tip.profession_label ?? "your OET profession";

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-4 px-4 py-6">
      <SkillHubHeader
        eyebrow={`Daily tip · ${tip.date}`}
        title={tip.headline}
        description={`Tailored for ${tailoredLabel}. New tip every day — add phrases to your vocabulary list.`}
        backHref="/dashboard"
        backLabel="← Home"
      />
      <Link
        href="/vocabulary"
        className="text-sm font-semibold text-brand-primary hover:underline"
      >
        Open vocabulary list →
      </Link>
      <TodayTipPanel tip={tip} />
    </div>
  );
}
