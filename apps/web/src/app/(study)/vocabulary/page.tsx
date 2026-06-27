import Link from "next/link";

import { VocabularyPanel } from "@/components/vocabulary/vocabulary-panel";
import { SkillHubHeader } from "@/components/study/skill-hub-header";
import { StudySectionCard } from "@/components/study/study-section-card";

export default function VocabularyPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-6 px-4 py-8">
      <SkillHubHeader
        eyebrow="Vocabulary"
        title="Healthcare vocabulary"
        description="OET healthcare words and phrases — explain, translate, and practise pronunciation with Nika."
        backHref="/study"
        backLabel="← Back to study hub"
      />

      <StudySectionCard
        title="Practice"
        hubHref="/today-tip"
        hubLabel="Today's tip"
        hubHint="Daily profession vocabulary & OET phrases"
        items={[
          {
            href: "/study/clever/vocab",
            label: "Vocabulary quiz",
            hint: "5 mixed questions from your weak areas",
          },
        ]}
      />

      <VocabularyPanel />
    </div>
  );
}
