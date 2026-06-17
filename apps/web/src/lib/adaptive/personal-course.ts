import { pickPlanListeningBlock, blockRoute as listeningBlockRoute } from "@/content/listening";
import { pickPlanReadingBlock, blockRoute as readingBlockRoute } from "@/content/reading";
import { pickPlanRoleCard } from "@/content/speaking";
import { formatWeakTagLabel, pickPlanScenario } from "@/content/writing/scenarios";
import { sortSkillsByGap } from "@/lib/domain/grades";
import type { OetSkill, SkillMap, UserProfile } from "@/lib/domain/types";
import {
  lessonIdsForWeakTags,
  recommendedWritingStage,
} from "@/lib/adaptive/skill-map";
import {
  recommendedListeningPart,
  recommendedListeningStage,
  recommendedReadingPart,
  recommendedReadingStage,
  recommendedSpeakingStage,
} from "@/lib/quiz/engine";
import { computeExamCountdown } from "@/lib/exam/countdown";

import type { CourseModule, CourseModuleItem, PersonalCourse } from "./types";

const LESSON_ROUTES: Record<string, string> = {
  "writing:purpose": "/writing/learn/w-lesson-purpose",
  "writing:content-selection": "/writing/learn/w-lesson-content",
  "writing:content": "/writing/learn/w-lesson-content",
  "writing:conciseness": "/writing/learn/w-lesson-concise",
  "writing:genre": "/writing/learn/w-lesson-genre",
  "writing:organisation": "/writing/learn/w-lesson-org",
  "writing:language": "/writing/learn/w-lesson-language",
};

function writingModuleItems(
  skillMap: SkillMap,
  profession?: string,
  country?: string,
): CourseModuleItem[] {
  const writing = skillMap.diagnostic.writing;
  const tags = writing.weakTags.length ? writing.weakTags : ["writing:purpose"];
  const stage = recommendedWritingStage(skillMap);
  const scenario = pickPlanScenario(profession, country, writing.gap);
  const items: CourseModuleItem[] = [];

  const lessonId = lessonIdsForWeakTags(tags)[0];
  const learnRoute = lessonId
    ? `/writing/learn/${lessonId}`
    : (LESSON_ROUTES[tags[0]!] ?? "/writing/learn");

  if (stage === "learn") {
    items.push({
      type: "lesson",
      title: `Criterion — ${formatWeakTagLabel(tags[0]!)}`,
      route: learnRoute,
      durationMinutes: 15,
    });
    items.push({
      type: "drill",
      title: "Content-selection drills",
      route: "/writing/learn/drills",
      durationMinutes: 10,
    });
  }
  if (stage === "guided") {
    items.push({
      type: "guided",
      title: `Guided letter — ${scenario.meta.title}`,
      route: `/writing/guided/${scenario.id}`,
      durationMinutes: 20,
    });
  }
  if (stage === "practice" || stage === "guided") {
    items.push({
      type: "practice",
      title: scenario.meta.title,
      route: `/writing/practice/${scenario.id}`,
      durationMinutes: 25,
    });
  }
  if (stage === "practice" && writing.gap === 0) {
    items.push({
      type: "exam",
      title: "Exam timing simulation",
      route: `/writing/exam/${scenario.id}`,
      durationMinutes: 45,
    });
  }
  return items;
}

function readingModuleItems(
  skillMap: SkillMap,
  profession?: string,
  country?: string,
): CourseModuleItem[] {
  const reading = skillMap.diagnostic.reading;
  const part = recommendedReadingPart(skillMap);
  const stage = recommendedReadingStage(skillMap);
  const block = pickPlanReadingBlock(profession, country, reading.gap, part);
  const items: CourseModuleItem[] = [];

  if (stage === "learn") {
    items.push({
      type: "drill",
      title: "Adaptive reading quiz",
      route: "/reading/quiz",
      durationMinutes: 10,
    });
  }
  items.push({
    type: "practice",
    title: `Part ${part} — ${block.title}`,
    route: readingBlockRoute(part, block.id),
    durationMinutes: block.durationMinutes,
  });
  if (stage === "exam") {
    items.push({
      type: "exam",
      title: "Reading exam — Parts B & C",
      route: "/reading/exam",
      durationMinutes: 45,
    });
  }
  items.push({
    type: "review",
    title: "Flashcard review",
    route: "/reading/flashcards",
    durationMinutes: 10,
  });
  return items;
}

function listeningModuleItems(
  skillMap: SkillMap,
  profession?: string,
  country?: string,
): CourseModuleItem[] {
  const listening = skillMap.diagnostic.listening;
  const part = recommendedListeningPart(skillMap);
  const stage = recommendedListeningStage(skillMap);
  const block = pickPlanListeningBlock(profession, country, listening.gap, part);
  const items: CourseModuleItem[] = [];

  if (stage === "learn") {
    const partA = pickPlanListeningBlock(profession, country, listening.gap, "A");
    items.push({
      type: "practice",
      title: `Part A — ${partA.title}`,
      route: listeningBlockRoute("A", partA.id),
      durationMinutes: partA.durationMinutes,
    });
  }
  items.push({
    type: "practice",
    title: `Part ${part} — ${block.title}`,
    route: listeningBlockRoute(part, block.id),
    durationMinutes: block.durationMinutes,
  });
  if (stage === "exam") {
    items.push({
      type: "exam",
      title: "Listening exam flow",
      route: "/listening/exam",
      durationMinutes: 25,
    });
  }
  return items;
}

function speakingModuleItems(
  skillMap: SkillMap,
  profession?: string,
  country?: string,
): CourseModuleItem[] {
  const speaking = skillMap.diagnostic.speaking;
  const stage = recommendedSpeakingStage(skillMap);
  const card = pickPlanRoleCard(profession, country, speaking.gap);
  const items: CourseModuleItem[] = [];

  if (stage === "learn") {
    items.push({
      type: "lesson",
      title: `Model dialogue — ${card.setting}`,
      route: `/speaking/${card.id}`,
      durationMinutes: 15,
    });
  }
  items.push({
    type: "practice",
    title: card.cardText.overview.slice(0, 48),
    route: `/speaking/${card.id}`,
    durationMinutes: card.prepMinutes + card.durationMinutes + 5,
  });
  if (stage === "exam") {
    items.push({
      type: "exam",
      title: "Dual role-play simulation",
      route: `/speaking/${card.id}`,
      durationMinutes: 16,
    });
  }
  return items;
}

function moduleStatus(skill: OetSkill, skillMap: SkillMap, rank: number): CourseModule["status"] {
  const gap = skillMap.diagnostic[skill].gap;
  if (gap === 0) return rank > 2 ? "maintenance" : "completed";
  if (rank === 0) return "active";
  if (rank === 1) return "locked";
  return "locked";
}

function moduleRationale(skill: OetSkill, skillMap: SkillMap, rank: number): string {
  const diag = skillMap.diagnostic[skill];
  const tag = diag.weakTags[0] ?? `${skill}:foundation`;
  if (diag.gap === 0) {
    return `${skill.charAt(0).toUpperCase() + skill.slice(1)} is at target — maintenance only.`;
  }
  if (rank === 0) {
    return `Highest priority: ${diag.gap} grade step(s) to target. Focus: ${tag.replace(":", " — ")}.`;
  }
  return `Queued after Module ${rank}: gap of ${diag.gap} on ${tag.replace(":", " — ")}.`;
}

const MODULE_BUILDERS: Record<
  OetSkill,
  (sm: SkillMap, p?: string, c?: string) => CourseModuleItem[]
> = {
  writing: writingModuleItems,
  reading: readingModuleItems,
  listening: listeningModuleItems,
  speaking: speakingModuleItems,
};

const SKILL_TITLES: Record<OetSkill, string> = {
  writing: "Writing — criterion mastery",
  reading: "Reading — parts & inference",
  listening: "Listening — parts & detail",
  speaking: "Speaking — clinical communication",
};

export function generatePersonalCourse(
  profile: UserProfile,
  skillMap: SkillMap,
  version = 1,
): PersonalCourse {
  const ordered = sortSkillsByGap(skillMap.diagnostic);
  const countdown = profile.examDate ? computeExamCountdown(profile.examDate) : null;
  const examUrgencyWeeks =
    countdown != null && !countdown.isPast
      ? Math.ceil(countdown.daysRemaining / 7)
      : null;

  const modules: CourseModule[] = ordered.map((skill, index) => ({
    id: `mod-${skill}-${version}`,
    skill,
    title: SKILL_TITLES[skill],
    focusTags: skillMap.diagnostic[skill].weakTags,
    status: moduleStatus(skill, skillMap, index),
    sequence: index + 1,
    items: MODULE_BUILDERS[skill](skillMap, profile.profession, profile.targetCountry),
    rationale: moduleRationale(skill, skillMap, index),
  }));

  const topWeak = ordered[0];
  const summary =
    examUrgencyWeeks != null && examUrgencyWeeks <= 4
      ? `${examUrgencyWeeks} week(s) to exam — compressed course prioritising ${topWeak}.`
      : `Personal course for ${profile.profession ?? "your profession"} — start with ${topWeak}, then rotate through gaps.`;

  return {
    userId: profile.id,
    version,
    modules,
    generatedAt: new Date().toISOString(),
    examUrgencyWeeks,
    summary,
  };
}

export function courseTransparencyLine(course: PersonalCourse): string {
  const active = course.modules.find((m) => m.status === "active");
  if (!active) return course.summary;
  const tags = active.focusTags.slice(0, 2).map((t) => t.split(":").pop()?.replace(/-/g, " "));
  return `This week focuses on **${active.skill}** — especially ${tags.join(" and ")}. ${active.rationale}`;
}
