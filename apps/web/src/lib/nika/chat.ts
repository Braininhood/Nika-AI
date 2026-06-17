import { apiUrl } from "@/lib/api/base-url";

import type { NikaUserContext } from "./context";
import { recentQuestionIds } from "@/lib/content/rotation-context";
import { offlineNikaReply } from "./offline-reply";

export interface NikaSource {
  id: string;
  title: string;
  source?: string;
  category?: string;
  url?: string;
}

export interface NikaChatResponse {
  reply: string;
  refused: boolean;
  reason?: string;
  sources: NikaSource[];
  provider?: string;
  tasks?: { skill: string; title: string; route: string; durationMinutes: number }[];
  assessment?: {
    id: string;
    title: string;
    skill: string;
    questions: Record<string, unknown>[];
  };
  vocabulary?: {
    id: string;
    word: string;
    englishExplanation: string;
    nativeTranslation?: string | null;
    nativeLanguage: string;
    source?: string;
  };
  quota?: { used: number; limit: number; resets_at: string };
}

export interface SendNikaMessageInput {
  message: string;
  accessToken?: string;
  context: NikaUserContext;
}

export async function sendNikaMessage(
  input: SendNikaMessageInput,
): Promise<NikaChatResponse> {
  const { message, accessToken, context } = input;

  if (!navigator.onLine || !accessToken) {
    const offline = await offlineNikaReply(message, context);
    return {
      reply: offline.reply,
      refused: offline.refused,
      sources: offline.sources,
      tasks: offline.tasks,
      provider: "offline",
    };
  }

  const excludeIds = await recentQuestionIds(80);

  const res = await fetch(apiUrl("/api/v1/ai/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      message,
      profession: context.profession,
      regulator: context.regulator,
      country: context.country,
      skill_map: context.skillMap,
      skill_focus: context.prioritySkill,
      native_language: context.nativeLanguage,
      exclude_ids: excludeIds,
    }),
  });

  if (!res.ok) {
    const offline = await offlineNikaReply(message, context);
    return {
      ...offline,
      provider: "offline_fallback",
    };
  }

  return res.json();
}

export async function fetchNikaStudyPlan(
  accessToken: string,
  context: NikaUserContext,
  examWeeks?: number | null,
) {
  if (!context.skillMap) return null;
  const res = await fetch(apiUrl("/api/v1/ai/study-plan"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      skill_map: context.skillMap,
      profession: context.profession,
      country: context.country,
      regulator: context.regulator,
      exam_weeks: examWeeks ?? undefined,
    }),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    daily_plan: { items: { title: string; route: string; durationMinutes: number }[] };
    summary_text: string;
  }>;
}

export async function fetchNikaQuota(accessToken: string) {
  const res = await fetch(apiUrl("/api/v1/ai/chat/quota"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ used: number; limit: number; resets_at: string }>;
}
