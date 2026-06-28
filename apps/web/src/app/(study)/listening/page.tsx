"use client";

import { useEffect, useState } from "react";

import { AccentPracticeLibrary } from "@/components/listening/accent-practice-library";
import { OfficialImportGuide } from "@/components/listening/official-import-guide";
import { StudyMediaPanel } from "@/components/listening/study-media-panel";
import { ListeningStudyGuidePanel } from "@/components/listening/listening-exam-briefing";
import { OfflinePacksPanel } from "@/components/listening/offline-packs-panel";
import { NextStepCard } from "@/components/dashboard/next-step-card";
import { HubContentGroups } from "@/components/study/hub-content-groups";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { StudySectionCard } from "@/components/study/study-section-card";
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
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        skill="listening"
        eyebrow="Listening"
        title="Listening hub"
        description={`${totalListeningQuestionCount()} practice questions · ${listeningBlockCount()} blocks · UK · AU · US · IE · NZ · CA accents · official import supported.`}
      />

      <ListeningStudyGuidePanel />

      <NextStepCard
        recommendation={recommendation}
        stageLabel={stageLabel}
        skillLabel="listening"
      />

      <OfflinePacksPanel variant="featured" />

      <StudySectionCard
        skill="listening"
        title="Tools & exam"
        items={[
          {
            href: "/listening/packs",
            label: "Offline audio & imports",
            hint: "Download pack · manage files",
          },
          {
            href: "/study/clever/listening",
            label: "Quick quiz",
            hint: "Exam-faithful Part A/B/C counts",
          },
          {
            href: "/listening/import",
            label: "Import official MP3/PDF",
            hint: "Personal Local Vault",
          },
          {
            href: "/listening/exam",
            label: "Full listening exam",
            hint: "24 + 6 + 12 · 40 min",
          },
        ]}
        highlighted
      />

      <OfficialImportGuide />

      <AccentPracticeLibrary />

      <HubContentGroups
        title="Quick start — all parts"
        subtitle="Original OET-style scripts — same content for all 12 professions."
        groups={partGroups.map(({ part, blocks: partBlocks }) => ({
          label: `Part ${part}`,
          items: partBlocks.map((block) => ({
            href: blockRoute(part, block.id),
            title: block.title,
            meta: blockSummary(block),
          })),
          emptyMessage: "No blocks for this part yet.",
        }))}
      />

      <StudyMediaPanel skill="listening" />
    </div>
  );
}
