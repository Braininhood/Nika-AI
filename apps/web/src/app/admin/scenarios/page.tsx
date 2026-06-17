"use client";

import { WRITING_SCENARIOS } from "@/content/writing/scenarios";
import { SkillContentManager } from "@/components/admin/skill-content-manager";

const STATIC = WRITING_SCENARIOS.map((s) => ({
  externalId: s.id,
  title: s.meta.title,
  payload: s as unknown as Record<string, unknown>,
}));

export default function AdminScenariosPage() {
  return (
    <SkillContentManager
      skill="writing"
      title="Writing scenarios"
      subtitle={`${WRITING_SCENARIOS.length} bundled scenarios · create, generate, edit, enable/disable`}
      staticCatalog={STATIC}
      defaultItemType="scenario"
      generateItemType="scenario"
    />
  );
}
