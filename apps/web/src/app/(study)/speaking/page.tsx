"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { SpeakingStudyGuidePanel } from "@/components/speaking/speaking-exam-briefing";
import {
  roleCardCount,
  roleCardRoute,
  roleCardSummary,
  roleCardsForUser,
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
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Speaking</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {roleCardCount()} role-play cards · all 12 OET professions · 3-min prep · 5-min
          recording · clinical communication checklist · STT + AI feedback.
        </p>
        {professionLabel && (
          <p className="mt-1 text-xs text-brand-primary">
            Your profession: {professionLabel} — cards match your role
          </p>
        )}
      </header>

      <SpeakingStudyGuidePanel />

      {recommendation && (
      <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/30 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Your speaking stage · {stageLabel}
        </p>
        <h2 className="mt-1 text-lg font-bold text-ink">Next best step</h2>
        <p className="mt-1 font-medium text-ink">{recommendation.title}</p>
        <p className="mt-1 text-sm text-ink-soft">{recommendation.description}</p>
        {recommendation.rationale && (
          <p className="mt-2 text-xs italic text-brand-primary">{recommendation.rationale}</p>
        )}
        <Link
          href={recommendation.route}
          className="mt-4 inline-flex rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Start now →
        </Link>
      </section>
      )}

      <StudyMediaPanel skill="speaking" />

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">Role-card library</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Profession-specific scenarios — elicit omitted information through ICE questions.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {cards.map((card) => (
            <li key={card.id} className="border-b border-border/60 pb-3 last:border-0">
              <Link
                href={roleCardRoute(card.id)}
                className="font-medium text-brand-primary hover:underline"
              >
                {card.cardText.overview.slice(0, 72)}
                {card.cardText.overview.length > 72 ? "…" : ""}
              </Link>
              <p className="mt-0.5 text-xs text-ink-soft">{roleCardSummary(card)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-brand-primary/30 bg-brand-accent-soft/20 p-4">
        <h2 className="font-semibold text-ink">Nika live voice · free</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Open any role card → <strong className="text-ink">Start live role-play with Nika</strong>.
          Nika speaks as the patient or carer (browser voice). You respond by mic — no paid voice API.
          Smarter replies when you are online (no extra cost).
        </p>
      </section>
    </div>
  );
}
