"use client";

import { ALL_LISTENING_BLOCKS } from "@/content/listening";
import { SkillContentManager } from "@/components/admin/skill-content-manager";

const STATIC = ALL_LISTENING_BLOCKS.map((b) => ({
  externalId: b.id,
  title: b.title,
  payload: b as unknown as Record<string, unknown>,
}));

export default function AdminListeningContentPage() {
  return (
    <SkillContentManager
      skill="listening"
      title="Listening content"
      subtitle={`${ALL_LISTENING_BLOCKS.length} blocks · accent-diverse practice`}
      staticCatalog={STATIC}
      defaultItemType="block"
      generateItemType="quiz_question"
    />
  );
}
