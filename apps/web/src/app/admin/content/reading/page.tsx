"use client";

import { ALL_READING_BLOCKS } from "@/content/reading/blocks/registry";
import { SkillContentManager } from "@/components/admin/skill-content-manager";

const STATIC = ALL_READING_BLOCKS.map((b) => ({
  externalId: b.id,
  title: b.title,
  payload: b as unknown as Record<string, unknown>,
}));

export default function AdminReadingContentPage() {
  return (
    <SkillContentManager
      skill="reading"
      title="Reading content"
      subtitle={`${ALL_READING_BLOCKS.length} blocks · quiz questions and passages`}
      staticCatalog={STATIC}
      defaultItemType="block"
      generateItemType="quiz_question"
    />
  );
}
