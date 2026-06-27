"use client";

import { useParams } from "next/navigation";

import { SpeakingSessionLazy } from "@/components/speaking/speaking-session-lazy";
import { StudyPageHeader } from "@/components/study/study-page-header";
import { SecondaryActionLink } from "@/components/ui/secondary-action-button";
import { useSpeakingRoleCard } from "@/lib/speaking/use-speaking-role-card";

export default function SpeakingPracticePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { card, loading } = useSpeakingRoleCard(id);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/speaking"
          backLabel="Speaking hub"
          skill="speaking"
          eyebrow="Speaking · Role-play"
          title="Loading role-play…"
        />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <StudyPageHeader
          backHref="/speaking"
          backLabel="Speaking hub"
          skill="speaking"
          eyebrow="Speaking · Role-play"
          title="Role card not found"
        />
        <SecondaryActionLink href="/speaking" className="mt-4">
          ← Speaking hub
        </SecondaryActionLink>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-lg px-4 py-6">
      <SpeakingSessionLazy card={card} backHref="/speaking" />
    </div>
  );
}
