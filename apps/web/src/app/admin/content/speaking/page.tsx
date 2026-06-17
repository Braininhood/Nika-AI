"use client";

import { ROLE_PLAY_CARDS } from "@/content/speaking";
import { SkillContentManager } from "@/components/admin/skill-content-manager";

const STATIC = ROLE_PLAY_CARDS.map((c) => ({
  externalId: c.id,
  title: c.cardText.overview.slice(0, 80),
  payload: c as unknown as Record<string, unknown>,
}));

export default function AdminSpeakingContentPage() {
  return (
    <SkillContentManager
      skill="speaking"
      title="Speaking role cards"
      subtitle={`${ROLE_PLAY_CARDS.length} role plays · 12 professions`}
      staticCatalog={STATIC}
      defaultItemType="role_card"
      generateItemType="role_card"
    />
  );
}
