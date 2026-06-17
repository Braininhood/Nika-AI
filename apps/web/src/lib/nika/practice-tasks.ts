/** Rule-based practice tasks from in-app content — no LLM. */

import { pickPlanListeningBlock, blockRoute as listeningBlockRoute } from "@/content/listening";
import { pickPlanReadingBlock, blockRoute as readingBlockRoute } from "@/content/reading";
import { pickPlanRoleCard } from "@/content/speaking";
import { pickPlanScenario, scenariosForUser } from "@/content/writing/scenarios";
import { pickRotatedItem, filterPoolByDifficulty } from "@/lib/content/rotation";
import {
  EMPTY_ROTATION,
  type RotationContext,
  rotationForSkill,
} from "@/lib/content/rotation-context";
import { getProfessionLabel } from "@/lib/domain/professions";
import type { OetSkill, SkillMap } from "@/lib/domain/types";
import type { AssessmentSkill } from "@/content/assessment";
import { CLEVER_SKILL_LABELS, CLEVER_SKILL_ROUTES } from "@/content/assessment";

export interface PracticeTask {
  skill: OetSkill;
  title: string;
  route: string;
  durationMinutes: number;
}

const ALL_SKILLS: OetSkill[] = ["listening", "reading", "writing", "speaking"];

const PRACTICE_REQUEST =
  /\b(create|give|suggest|need|want|more|extra|another|additional)\b.*\b(tasks?|exercises?|practice)\b|((write|writing|read|reading|listen|listening|speak|speaking)\s+practice)|\b(mix(ed)?|balanced|rotation)\b.*\b(tasks?|practice)\b|\b(finish(ed)?|complete(d)?)\b.*\bplan\b.*\b(tasks?|more)\b/i;

const MIX_REQUEST =
  /\b(mix(ed)?|variety|all\s+(four|4)\s+skills?|each\s+skill|full\s+exam|balanced|rotation|four\s+sub-?tests?|oet\s+schedule)\b/i;

const CLEVER_QUIZ_REQUEST =
  /\b(clever|challenge|tricky|brain|mixed\s+types?)\b.*\b(quiz|questions?|test|assessment|reading|listening|writing|speaking|vocab)\b|\b(clever|challenge)\s+quiz\b|\b(create|make|generate)\b.*\b(quiz|test|assessment)\b/i;

const ASSESSMENT_SKILL_PATTERNS: [RegExp, AssessmentSkill][] = [
  [/\b(vocab|vocabulary)\b/i, "vocab"],
  [/\b(listen|listening)\b/i, "listening"],
  [/\b(write|writing|letter)\b/i, "writing"],
  [/\b(speak|speaking|role\s*play)\b/i, "speaking"],
  [/\b(read|reading)\b/i, "reading"],
  [/\b(mixed|all\s+skills?)\b/i, "mixed"],
];

const EXPLICIT_SKILL_PATTERNS: [RegExp, OetSkill][] = [
  [/\b(write|writing)\s+practice\b/, "writing"],
  [/\b(read|reading)\s+practice\b/, "reading"],
  [/\b(listen|listening)\s+practice\b/, "listening"],
  [/\b(speak|speaking)\s+practice\b/, "speaking"],
  [/\b(only|just)\s+(write|writing)\b/, "writing"],
  [/\b(only|just)\s+(read|reading)\b/, "reading"],
  [/\b(only|just)\s+(listen|listening)\b/, "listening"],
  [/\b(only|just)\s+(speak|speaking)\b/, "speaking"],
  [/\b(write|writing)\s+tasks?\b/, "writing"],
  [/\b(read|reading)\s+tasks?\b/, "reading"],
  [/\b(listen|listening)\s+tasks?\b/, "listening"],
  [/\b(speak|speaking)\s+tasks?\b/, "speaking"],
  [/\b(letter|referral|case\s*notes?)\b/, "writing"],
];

export function isPracticeTaskRequest(message: string): boolean {
  return PRACTICE_REQUEST.test(message);
}

export function wantsMixedTasks(message: string): boolean {
  return MIX_REQUEST.test(message);
}

export function wantsCleverQuiz(message: string): boolean {
  return CLEVER_QUIZ_REQUEST.test(message);
}

function cleverSkillFromMessage(message: string): AssessmentSkill {
  for (const [re, skill] of ASSESSMENT_SKILL_PATTERNS) {
    if (re.test(message)) return skill;
  }
  return "reading";
}

/** Skill named explicitly in the message — not inferred from Skill Map. */
export function explicitSkillRequest(message: string): OetSkill | null {
  const lower = message.toLowerCase();
  for (const [re, skill] of EXPLICIT_SKILL_PATTERNS) {
    if (re.test(lower)) return skill;
  }
  return null;
}

function taskCount(message: string): number {
  const m = message.match(/\b(\d+)\s*[-–]?\s*(\d+)?\b/);
  if (!m) return 4;
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : a;
  return Math.max(1, Math.min(8, Math.max(a, b)));
}

function skillOrderForMix(skillMap?: SkillMap): OetSkill[] {
  if (skillMap?.priority?.length) {
    const ordered = [...skillMap.priority];
    for (const s of ALL_SKILLS) {
      if (!ordered.includes(s)) ordered.push(s);
    }
    return ordered;
  }
  return [...ALL_SKILLS];
}

function writingGap(skillMap?: SkillMap): number {
  return skillMap?.diagnostic?.writing?.gap ?? 1;
}

function buildOneTask(
  skill: OetSkill,
  index: number,
  profession?: string,
  country?: string,
  skillMap?: SkillMap,
  rotation: RotationContext = EMPTY_ROTATION,
  usedInBatch: string[] = [],
): PracticeTask {
  const gap = writingGap(skillMap);
  const recent = rotationForSkill(rotation, skill, usedInBatch);

  if (skill === "writing") {
    const pool = filterPoolByDifficulty(
      scenariosForUser(profession, country),
      gap >= 2 ? 1 : gap === 1 ? 2 : 3,
    );
    const scenario =
      pool.length > 0
        ? pickRotatedItem(pool, recent, index)
        : pickPlanScenario(profession, country, gap, recent);
    usedInBatch.push(scenario.id);
    return {
      skill: "writing",
      title: scenario.meta.title,
      route: `/writing/practice/${scenario.id}`,
      durationMinutes: 25,
    };
  }

  if (skill === "reading") {
    if (index % 2 === 1) {
      return {
        skill: "reading",
        title: "Nika clever quiz mix",
        route: "/reading/quiz/clever",
        durationMinutes: 8,
      };
    }
    const part = (["A", "B", "C"] as const)[index % 3];
    const block = pickPlanReadingBlock(profession, country, gap, part, recent);
    usedInBatch.push(block.id);
    return {
      skill: "reading",
      title: block.title,
      route: readingBlockRoute(part, block.id),
      durationMinutes: part === "A" ? 15 : 20,
    };
  }

  if (skill === "listening") {
    const part = (["A", "B", "C"] as const)[index % 3];
    const block = pickPlanListeningBlock(profession, country, gap, part, recent);
    usedInBatch.push(block.id);
    return {
      skill: "listening",
      title: block.title,
      route: listeningBlockRoute(part, block.id),
      durationMinutes: 12,
    };
  }

  const card = pickPlanRoleCard(profession, country, gap, recent);
  usedInBatch.push(card.id);
  return {
    skill: "speaking",
    title: card.cardText.overview.slice(0, 60),
    route: `/speaking/practice/${card.id}`,
    durationMinutes: 8,
  };
}

function skillLabel(skill: OetSkill): string {
  const labels: Record<OetSkill, string> = {
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
  };
  return labels[skill];
}

function formatTaskLines(tasks: PracticeTask[]): string {
  return tasks
    .map((t) => `• **${skillLabel(t.skill)}** — ${t.title} (${t.durationMinutes} min)`)
    .join("\n");
}

export function buildPracticeTasks(
  message: string,
  profession?: string,
  country?: string,
  skillMap?: SkillMap,
  rotation: RotationContext = EMPTY_ROTATION,
): { reply: string; tasks: PracticeTask[] } {
  const profLabel = profession ? getProfessionLabel(profession as never) : "your profession";
  const count = taskCount(message);
  const explicit = explicitSkillRequest(message);
  const usedInBatch: string[] = [];

  if (wantsCleverQuiz(message)) {
    const cleverSkill = cleverSkillFromMessage(message);
    const route = CLEVER_SKILL_ROUTES[cleverSkill === "mixed" ? "reading" : cleverSkill] ?? "/study/clever/reading";
    const mixOrder = skillOrderForMix(skillMap);
    const tasks: PracticeTask[] = [
      {
        skill: cleverSkill === "vocab" ? "reading" : (cleverSkill === "mixed" ? "reading" : cleverSkill as OetSkill),
        title: `Nika clever ${CLEVER_SKILL_LABELS[cleverSkill]}`,
        route: cleverSkill === "mixed" ? "/study/clever/mixed" : route,
        durationMinutes: 8,
      },
    ];
    for (let i = 1; i < count; i++) {
      tasks.push(
        buildOneTask(
          mixOrder[i % mixOrder.length]!,
          i,
          profession,
          country,
          skillMap,
          rotation,
          usedInBatch,
        ),
      );
    }
    return {
      reply:
        `Here is a **clever ${CLEVER_SKILL_LABELS[cleverSkill].toLowerCase()}** — mixed question types ` +
        `for ${profLabel}:\n\n${formatTaskLines(tasks)}\n\n` +
        `Or ask Nika to **create a listening quiz** / **vocabulary test** for another skill.`,
      tasks,
    };
  }

  const useMix = wantsMixedTasks(message) || !explicit;
  const order = skillOrderForMix(skillMap);

  if (useMix) {
    const tasks: PracticeTask[] = [];
    for (let i = 0; i < count; i++) {
      tasks.push(
        buildOneTask(order[i % order.length]!, i, profession, country, skillMap, rotation, usedInBatch),
      );
    }

    const skillsUsed = [...new Set(tasks.map((t) => t.skill))];
    const reply =
      `OET has four sub-tests — Listening, Reading, Writing, and Speaking. ` +
      `Here is a **mixed set** for ${profLabel} (${skillsUsed.map(skillLabel).join(" · ")}):\n\n` +
      `${formatTaskLines(tasks)}\n\n` +
      `Work through them in any order — your Skill Map and plan update after each attempt. ` +
      `Ask for "listening only" or "writing practice" if you want one skill.`;

    return { reply, tasks };
  }

  const skill = explicit ?? skillMap?.priority?.[0] ?? "writing";
  const tasks: PracticeTask[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(
      buildOneTask(skill, i, profession, country, skillMap, rotation, usedInBatch),
    );
  }

  const reply =
    `Here are ${tasks.length} **${skillLabel(skill)}** tasks for ${profLabel}:\n\n` +
    `${formatTaskLines(tasks)}\n\n` +
    `Open each task below — your plan updates after each attempt. ` +
    `Want all four skills? Ask for **mixed tasks**.`;

  return { reply, tasks };
}
