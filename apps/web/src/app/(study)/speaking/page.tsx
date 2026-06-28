"use client";

import { useEffect, useState } from "react";

import { NextStepCard } from "@/components/dashboard/next-step-card";
import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { SpeakingStudyGuidePanel } from "@/components/speaking/speaking-exam-briefing";
import { HubContentGroups } from "@/components/study/hub-content-groups";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { StudySectionCard } from "@/components/study/study-section-card";
import {
  roleCardCount,
  roleCardRoute,
  roleCardSummary,
} from "@/content/speaking";
import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetProfession } from "@/lib/domain/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadSpeakingContentContext } from "@/lib/speaking/content-context";
import {
  primarySpeakingRecommendation,
  speakingStageLabel,
  type SpeakingRecommendation,
} from "@/lib/speaking/recommendations";

export default function SpeakingHubPage() {
  const { session, loading } = useAuth();
  const [recommendation, setRecommendation] = useState<SpeakingRecommendation | null>(null);
  const [stageLabel, setStageLabel] = useState("Foundation");
  const [cards, setCards] = useState<
    Awaited<ReturnType<typeof loadSpeakingContentContext>>["cards"]
  >([]);
  const [professionLabel, setProfessionLabel] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    void loadSpeakingContentContext(session?.user?.id).then(async (ctx) => {
      const rec = await primarySpeakingRecommendation(
        ctx.skillMap,
        ctx.profession,
        ctx.targetCountry,
      );
      setRecommendation(rec);
      setStageLabel(speakingStageLabel(ctx.skillMap));
      setCards(ctx.cards);
      setProfessionLabel(
        ctx.profession ? getProfessionLabel(ctx.profession as OetProfession) : null,
      );
    });
  }, [loading, session?.user?.id]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="speaking"
        eyebrow="Speaking · Phase 4"
        title="Speaking hub"
        description={`${roleCardCount()} role-play cards · all 12 OET professions · 3-min prep · 5-min recording · clinical communication checklist · STT + AI feedback.${professionLabel ? ` Your profession: ${professionLabel}.` : ""}`}
      />

      <SpeakingStudyGuidePanel />

      {recommendation ? (
        <NextStepCard
          recommendation={recommendation}
          stageLabel={stageLabel}
          skillLabel="speaking"
        />
      ) : null}

      <StudySectionCard
        skill="speaking"
        title="Practice & exam"
        items={[
          {
            href: "/speaking/exam",
            label: "Speaking exam",
            hint: "2 role-plays · 3 min prep + 5 min each",
          },
          {
            href: "/study/clever/speaking",
            label: "Communication quiz",
            hint: "12 ICE, structure & empathy questions",
          },
        ]}
      />

      <HubContentGroups
        title="Role-card library"
        subtitle="Profession-specific scenarios — elicit omitted information through ICE questions."
        groups={[
          {
            label: professionLabel ? `${professionLabel} cards` : "Your cards",
            items: cards.slice(0, 12).map((card) => ({
              href: roleCardRoute(card.id),
              title:
                card.cardText.overview.length > 72
                  ? `${card.cardText.overview.slice(0, 72)}…`
                  : card.cardText.overview,
              meta: roleCardSummary(card),
            })),
            emptyMessage: "Complete onboarding to see role cards for your profession.",
          },
        ]}
      />

      <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/20 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Nika live role-play
        </p>
        <h2 className="mt-1 text-base font-bold text-ink">Practise speaking with Nika</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Open any role card and start a live conversation. Nika voices the patient or carer — you
          respond naturally, then receive coaching feedback.
        </p>
      </section>

      <StudyMediaPanel skill="speaking" />
    </div>
  );
}
