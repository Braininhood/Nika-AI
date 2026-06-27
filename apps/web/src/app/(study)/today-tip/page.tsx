"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TodayTipPanel } from "@/components/vocabulary/today-tip-panel";
import { StudyPageHeader } from "@/components/study/study-page-header";
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
    void loadUserProfile(session?.user?.id).then((profile) => {
      if (profile?.profession) {
        setProfessionLabel(getProfessionLabel(profile.profession as OetProfession));
      }
    });
    void fetchTodayTip(session?.access_token).then((result) => {
      setTip(result);
      setFetching(false);
    });
  }, [loading, session?.access_token, session?.user?.id]);

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/dashboard"
          backLabel="Home"
          eyebrow="Daily tip"
          title="Loading today&apos;s tip…"
        />
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/dashboard"
          backLabel="Home"
          eyebrow="Daily tip"
          title="Today&apos;s tip unavailable"
          description="Sign in while online to load your profession tip from Nika."
        />
        <SecondaryActionLink href="/vocabulary" className="mt-4">
          Open vocabulary
        </SecondaryActionLink>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-4 px-4 py-6">
      <StudyPageHeader
        backHref="/dashboard"
        backLabel="Home"
        eyebrow={`Daily tip · ${tip.date}`}
        title={tip.headline}
        description={
          professionLabel
            ? `Tailored for ${professionLabel}. New tip every day — add phrases to your vocabulary list.`
            : "Complete onboarding to match tips to your OET profession."
        }
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
