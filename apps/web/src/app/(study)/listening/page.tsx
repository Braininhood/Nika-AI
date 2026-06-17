"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccentPracticeLibrary } from "@/components/listening/accent-practice-library";
import { OfficialImportGuide } from "@/components/listening/official-import-guide";
import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { ListeningStudyGuidePanel } from "@/components/listening/listening-exam-briefing";
import { OfflinePacksPanel } from "@/components/listening/offline-packs-panel";
import {
  blockRoute,
  blockSummary,
  listeningBlockCount,
  totalListeningQuestionCount,
} from "@/content/listening";
import { useAuth } from "@/lib/auth/auth-provider";
import { loadListeningContentContext } from "@/lib/listening/content-context";
import {
  listeningStageLabel,
  primaryListeningRecommendation,
} from "@/lib/listening/recommendations";

export default function ListeningHubPage() {
  const { session, loading } = useAuth();
  const [recommendation, setRecommendation] = useState(
    primaryListeningRecommendation(undefined),
  );
  const [stageLabel, setStageLabel] = useState("Foundation");
  const [blocks, setBlocks] = useState<
    Awaited<ReturnType<typeof loadListeningContentContext>>["blocks"]
  >([]);

  useEffect(() => {
    if (loading) return;
    void loadListeningContentContext(session?.user?.id).then((ctx) => {
      setRecommendation(
        primaryListeningRecommendation(ctx.skillMap, ctx.profession, ctx.targetCountry),
      );
      setStageLabel(listeningStageLabel(ctx.skillMap));
      setBlocks(ctx.blocks);
    });
  }, [loading, session?.user?.id]);

  const partGroups = (["A", "B", "C"] as const).map((part) => ({
    part,
    blocks: blocks.filter((b) => b.part === part).slice(0, 6),
  }));

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">Listening</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {totalListeningQuestionCount()} practice questions · {listeningBlockCount()} blocks · UK ·
          AU · US · IE · NZ · CA accents · browser narration + official import.
        </p>
      </header>

      <ListeningStudyGuidePanel />

      <section className="rounded-2xl border border-brand-primary/40 bg-brand-accent-soft/30 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
          Your listening stage · {stageLabel}
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

      <OfficialImportGuide />

      <AccentPracticeLibrary />

      <StudyMediaPanel skill="listening" />

      <OfflinePacksPanel />

      <section className="rounded-2xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-ink">Quick start — all parts</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Original OET-style scripts — same content for all 12 professions.
        </p>
        <ul className="mt-3 space-y-3 text-sm">
          {partGroups.map(({ part, blocks: partBlocks }) => (
            <li key={part}>
              <p className="font-medium text-ink">Part {part}</p>
              <ul className="mt-1 space-y-1 pl-3">
                {partBlocks.map((block) => (
                  <li key={block.id}>
                    <Link
                      href={blockRoute(part, block.id)}
                      className="text-brand-primary hover:underline"
                    >
                      {block.title}
                    </Link>
                    <span className="text-ink-soft"> · {blockSummary(block)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/listening/import" className="text-brand-primary hover:underline">
            Import official MP3/PDF (Personal Local Vault)
          </Link>
        </li>
        <li>
          <Link href="/listening/exam" className="text-brand-primary hover:underline">
            Exam mode — Parts B &amp; C flow
          </Link>
        </li>
        <li>
          <Link href="/listening/packs" className="text-brand-primary hover:underline">
            Manage offline packs
          </Link>
        </li>
      </ul>
    </div>
  );
}
