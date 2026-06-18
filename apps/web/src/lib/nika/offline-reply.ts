import {
  knowledgeForProfession,
  STUDY_KNOWLEDGE_BASE,
  type StudyKnowledgeEntry,
} from "@/content/media/study-knowledge-base";
import { getRegulator } from "@/lib/domain/requirements";

import { loadRotationContext } from "@/lib/content/rotation-context";

import type { NikaSource } from "./chat";
import type { NikaUserContext } from "./context";
import { buildPracticeTasks, isPracticeTaskRequest } from "./practice-tasks";
import { REFUSAL_HINT, classifyQuestion } from "./topic-guard";

export interface OfflineNikaReply {
  reply: string;
  refused: boolean;
  sources: NikaSource[];
  tasks?: { skill: string; title: string; route: string; durationMinutes: number }[];
}

const TECH_JARGON =
  /\b(supabase|opfs|layer\s*[ab]|pgvector|rag|embed|corpus|indexeddb|dexie)\b/i;

function knowledgeSource(entry: StudyKnowledgeEntry): NikaSource {
  return {
    id: entry.id,
    title: entry.title,
    url: entry.href,
    category: entry.category,
    source: entry.href?.includes("oet.com") ? "oet.com" : undefined,
  };
}

function scoreEntry(query: string, entry: StudyKnowledgeEntry): number {
  const tokens = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (!tokens.length) return 0;
  const hay = `${entry.title} ${entry.nikaAdvice} ${entry.tags.join(" ")}`.toLowerCase();
  return tokens.filter((t) => hay.includes(t)).length / tokens.length;
}

function collectEntries(ctx: NikaUserContext): StudyKnowledgeEntry[] {
  const seen = new Set<string>();
  const list: StudyKnowledgeEntry[] = [];
  for (const e of STUDY_KNOWLEDGE_BASE) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      list.push(e);
    }
  }
  if (ctx.profession) {
    for (const e of knowledgeForProfession(ctx.profession as never)) {
      if (!seen.has(e.id)) {
        seen.add(e.id);
        list.push(e);
      }
    }
  }
  return list;
}

function sanitiseTip(text: string): string {
  if (TECH_JARGON.test(text)) {
    return text
      .replace(/\bSupabase[^.]*\.?\s*/gi, "")
      .replace(/\bOPFS[^.]*\.?\s*/gi, "")
      .replace(/\bLayer [AB][^.]*\.?\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return text;
}

function formatTips(entries: StudyKnowledgeEntry[]): string {
  return entries
    .map((e) => sanitiseTip(e.nikaAdvice))
    .filter(Boolean)
    .map((tip) => `• ${tip}`)
    .join("\n");
}

export async function offlineNikaReply(
  message: string,
  ctx: NikaUserContext,
): Promise<OfflineNikaReply> {
  const guard = classifyQuestion(message);
  if (guard.verdict === "refused") {
    return {
      reply: `${REFUSAL_HINT} Connect when online for a fuller answer.`,
      refused: true,
      sources: [],
    };
  }

  const vocabIntent =
    (/\b(what\s+does|what\s+is|explain|meaning\s+of|translate|translation|vocab)\b/i.test(
      message,
    ) ||
      /[-–—]\s*(mean|means|translate|translation)\s*\??\s*$/i.test(message)) &&
    !/\b(quiz|test|assessment)\b/i.test(message);

  if (vocabIntent) {
    return {
      reply:
        "I'm offline — open **Vocabulary** to save words, hear pronunciation, and review your list. Connect when online and I can explain and translate terms for you.",
      refused: false,
      sources: [],
      tasks: [
        {
          skill: "vocab",
          title: "Open vocabulary list",
          route: "/vocabulary",
          durationMinutes: 5,
        },
      ],
    };
  }

  if (isPracticeTaskRequest(message)) {
    const rotation = await loadRotationContext();
    const { reply, tasks } = buildPracticeTasks(
      message,
      ctx.profession,
      ctx.country,
      ctx.skillMap,
      rotation,
    );
    return {
      reply,
      refused: false,
      sources: tasks.map((t) => ({
        id: t.route,
        title: t.title,
        url: t.route,
        category: "platform",
      })),
      tasks: tasks.map((t) => ({
        skill: t.skill,
        title: t.title,
        route: t.route,
        durationMinutes: t.durationMinutes,
      })),
    };
  }

  const entries = collectEntries(ctx);

  const regulator = ctx.regulator ? getRegulator(ctx.regulator) : undefined;
  const regulatorEntry: StudyKnowledgeEntry | null = regulator
    ? {
        id: `reg-${regulator.code}`,
        phase: "all",
        skill: "all",
        category: "official_hub",
        title: regulator.label,
        summary: "",
        href: regulator.officialUrl,
        tags: ["regulatory"],
        nikaAdvice: `Check ${regulator.label} for current OET grade rules — open their official website.`,
      }
    : null;

  const ranked = [
    ...entries.map((entry) => ({ entry, score: scoreEntry(message, entry) })),
    ...(regulatorEntry
      ? [{ entry: regulatorEntry, score: scoreEntry(message, regulatorEntry) }]
      : []),
  ]
    .filter((r) => r.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.entry);

  if (!ranked.length) {
    return {
      reply:
        "I'm offline. Open Study → Materials for official OET links, or ask again when you're online.",
      refused: false,
      sources: [],
    };
  }

  let opener = "Here's what to do:";
  if (ctx.prioritySkill && ctx.weakTags.length) {
    const tag = ctx.weakTags[0]!.split(":").pop()!.replace(/-/g, " ");
    opener = `For your ${ctx.prioritySkill} focus (${tag}), try this:`;
  }

  const body = formatTips(ranked);
  return {
    reply: `${opener}\n\n${body}\n\n_(Offline — connect for personalised coaching.)_`,
    refused: false,
    sources: ranked.map((e) => knowledgeSource(e)),
  };
}
