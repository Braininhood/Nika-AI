import {
  blockRoute,
  formatReadingTagLabel,
  pickPlanReadingBlock,
} from "@/content/reading";
import {
  blockRoute as listeningBlockRoute,
  formatListeningTagLabel,
  pickPlanListeningBlock,
} from "@/content/listening";
import {
  formatSpeakingTagLabel,
  pickPlanRoleCard,
  roleCardRoute,
} from "@/content/speaking";
import {
  formatWeakTagLabel,
  letterTypeLabel,
  pickPlanScenario,
} from "@/content/writing/scenarios";
import { gradeBSampleForScenario } from "@/lib/writing/recommendations";
import { primarySampleForProfession } from "@/content/writing/sample-letters";
import {
  lessonIdsForWeakTags,
  recommendedWritingStage,
} from "@/lib/adaptive/skill-map";
import {
  recommendedReadingPart,
  recommendedReadingStage,
  recommendedListeningPart,
  recommendedListeningStage,
  recommendedSpeakingStage,
} from "@/lib/quiz/engine";
import type { SkillMap, UserProfile } from "@/lib/domain/types";

import type { DailyPlan, PlanItem } from "./types";

const LESSON_ROUTES: Record<string, string> = {
  "writing:purpose": "/writing/learn/w-lesson-purpose",
  "writing:content-selection": "/writing/learn/w-lesson-content",
  "writing:content": "/writing/learn/w-lesson-content",
  "writing:conciseness": "/writing/learn/w-lesson-concise",
  "writing:genre": "/writing/learn/w-lesson-genre",
  "writing:organisation": "/writing/learn/w-lesson-org",
  "writing:language": "/writing/learn/w-lesson-language",
};

import type { ReadinessStatus } from "@/lib/adaptive/types";
import type { RotationContext } from "@/lib/content/rotation-context";
import { EMPTY_ROTATION } from "@/lib/content/rotation-context";

export interface BuildDailyPlanInput {
  profession?: string;
  targetCountry?: string;
  skillMap?: SkillMap;
  readiness?: ReadinessStatus | null;
  flashcardsDue?: number;
  rotation?: RotationContext;
}

export function buildDailyPlan(input: BuildDailyPlanInput): DailyPlan {
  const {
    profession,
    targetCountry,
    skillMap,
    readiness,
    flashcardsDue = 0,
    rotation = EMPTY_ROTATION,
  } = input;
  const prioritySkill = skillMap?.priority?.[0] ?? "writing";
  const writing = skillMap?.diagnostic.writing;
  const weakTags = writing?.weakTags?.length
    ? writing.weakTags
    : ["writing:purpose"];
  const topTag = weakTags[0];
  const stage = recommendedWritingStage(skillMap);
  const scenario = pickPlanScenario(
    profession,
    targetCountry,
    writing?.gap,
    rotation.writing,
  );

  const items: PlanItem[] = [];

  if (flashcardsDue > 0) {
    items.push({
      type: "review",
      skill: "mixed",
      title: `Flashcard review (${flashcardsDue} due)`,
      durationMinutes: Math.min(15, flashcardsDue * 2),
      route: "/reading/flashcards",
    });
  }

  if (
    readiness &&
    (readiness.state === "mock_eligible" ||
      readiness.state === "mock_pass_pending" ||
      readiness.state === "exam_ready")
  ) {
    items.unshift({
      type: "exam",
      skill: "mixed",
      title:
        readiness.state === "exam_ready"
          ? "Maintenance mock — stay exam sharp"
          : readiness.state === "mock_pass_pending"
            ? "2nd OET mock — confirm exam readiness"
            : "Full OET mock — all 4 skills",
      durationMinutes: 170,
      route: "/mock",
    });
  }

  if (prioritySkill === "reading") {
    const reading = skillMap?.diagnostic.reading;
    const readingTags = reading?.weakTags?.length
      ? reading.weakTags
      : ["reading:part-b-gist"];
    const readingTopTag = readingTags[0]!;
    const readingStage = recommendedReadingStage(skillMap);
    const part = recommendedReadingPart(skillMap);
    const block = pickPlanReadingBlock(
      profession,
      targetCountry,
      reading?.gap,
      part,
      rotation.reading,
    );

    if (readingStage === "learn") {
      items.push({
        type: "drill",
        skill: "reading",
        title: `Adaptive quiz — ${formatReadingTagLabel(readingTopTag)}`,
        durationMinutes: 10,
        route: "/reading/quiz",
      });
    }

    if (readingStage === "learn" || readingStage === "practice") {
      items.push({
        type: "practice",
        skill: "reading",
        title: `Reading Part ${part} — ${block.title}`,
        durationMinutes: block.durationMinutes,
        route: blockRoute(part, block.id),
      });
    }

    if (readingStage === "exam") {
      items.push({
        type: "exam",
        skill: "reading",
        title: "Reading exam — Parts B & C (45 min)",
        durationMinutes: 45,
        route: "/reading/exam",
      });
    }
  } else if (prioritySkill === "listening") {
    const listening = skillMap?.diagnostic.listening;
    const listeningTags = listening?.weakTags?.length
      ? listening.weakTags
      : ["listening:part-b-gist"];
    const listeningTopTag = listeningTags[0]!;
    const listeningStage = recommendedListeningStage(skillMap);
    const part = recommendedListeningPart(skillMap);
    const block = pickPlanListeningBlock(
      profession,
      targetCountry,
      listening?.gap,
      part,
      rotation.listening,
    );

    if (listeningStage === "learn") {
      const partABlock = pickPlanListeningBlock(
        profession,
        targetCountry,
        listening?.gap,
        "A",
        rotation.listening,
      );
      items.push({
        type: "practice",
        skill: "listening",
        title: `Listening Part A — ${partABlock.title}`,
        durationMinutes: partABlock.durationMinutes,
        route: listeningBlockRoute("A", partABlock.id),
      });
    }

    if (listeningStage === "learn" || listeningStage === "practice") {
      items.push({
        type: "practice",
        skill: "listening",
        title: `Listening Part ${part} — ${block.title}`,
        durationMinutes: block.durationMinutes,
        route: listeningBlockRoute(part, block.id),
      });
    }

    if (listeningStage === "exam") {
      items.push({
        type: "exam",
        skill: "listening",
        title: "Listening exam — Parts B & C flow",
        durationMinutes: 25,
        route: "/listening/exam",
      });
    }

    items.push({
      type: "review",
      skill: "listening",
      title: `Weak tag focus — ${formatListeningTagLabel(listeningTopTag)}`,
      durationMinutes: 5,
      route: "/listening",
    });
  } else if (prioritySkill === "speaking") {
    const speaking = skillMap?.diagnostic.speaking;
    const speakingTags = speaking?.weakTags?.length
      ? speaking.weakTags
      : ["speaking:ice-expectations"];
    const speakingTopTag = speakingTags[0]!;
    const speakingStage = recommendedSpeakingStage(skillMap);
    const card = pickPlanRoleCard(
      profession,
      targetCountry,
      speaking?.gap,
      rotation.speaking,
    );

    if (speakingStage === "learn") {
      items.push({
        type: "learn",
        skill: "speaking",
        title: `Model dialogue — ${card.setting}`,
        durationMinutes: 15,
        route: roleCardRoute(card.id),
      });
    }

    if (speakingStage === "learn" || speakingStage === "practice") {
      items.push({
        type: "practice",
        skill: "speaking",
        title: `Role-play — ${card.cardText.overview.slice(0, 40)}…`,
        durationMinutes: card.prepMinutes + card.durationMinutes + 5,
        route: roleCardRoute(card.id),
        scenarioId: card.id,
      });
    }

    if (speakingStage === "exam") {
      items.push({
        type: "exam",
        skill: "speaking",
        title: "Speaking exam — dual role-play simulation",
        durationMinutes: 16,
        route: roleCardRoute(card.id),
        scenarioId: card.id,
      });
    }

    items.push({
      type: "review",
      skill: "speaking",
      title: `Weak tag focus — ${formatSpeakingTagLabel(speakingTopTag)}`,
      durationMinutes: 5,
      route: "/speaking",
    });
  } else {
    const lessonId = lessonIdsForWeakTags(weakTags)[0];
    const learnRoute = lessonId
      ? `/writing/learn/${lessonId}`
      : (LESSON_ROUTES[topTag] ?? "/writing/learn");

    if (stage === "learn" || writing?.gap !== undefined && writing.gap >= 1) {
      items.push({
        type: "learn",
        skill: "writing",
        title: `Writing Academy — ${formatWeakTagLabel(topTag)}`,
        durationMinutes: 15,
        route: learnRoute,
      });
    }

    if (stage === "learn") {
      items.push({
        type: "drill",
        skill: "writing",
        title: "Content-selection drills",
        durationMinutes: 10,
        route: "/writing/learn/drills",
      });

      const sample =
        gradeBSampleForScenario(scenario.id) ??
        (profession ? primarySampleForProfession(profession) : undefined);
      if (sample) {
        items.push({
          type: "sample",
          skill: "writing",
          title: `Read Grade B sample — ${sample.title}`,
          durationMinutes: 10,
          route: `/writing/learn/samples/${sample.id}`,
        });
      }
    }

    if (stage === "guided") {
      items.push({
        type: "guided",
        skill: "writing",
        title: `Guided: ${scenario.meta.title}`,
        durationMinutes: 20,
        route: `/writing/guided/${scenario.id}`,
        scenarioId: scenario.id,
      });
    }

    if (stage === "practice" || stage === "guided") {
      items.push({
        type: "practice",
        skill: "writing",
        title: `${letterTypeLabel(scenario.meta.letterType)} — ${scenario.meta.title}`,
        durationMinutes: 25,
        route: `/writing/practice/${scenario.id}`,
        scenarioId: scenario.id,
      });
    }

    if (stage === "practice" && (writing?.gap ?? 1) === 0) {
      items.push({
        type: "exam",
        skill: "writing",
        title: `Exam timing — ${scenario.meta.title}`,
        durationMinutes: 45,
        route: `/writing/exam/${scenario.id}`,
        scenarioId: scenario.id,
      });
    }
  }

  items.push({
    type: "learn",
    skill: "mixed",
    title: "Your personal course",
    durationMinutes: 5,
    route: "/course",
  });

  items.push({
    type: "review",
    skill: "mixed",
    title: "Review Skill Map progress",
    durationMinutes: 5,
    route: "/progress",
  });

  return {
    date: new Date().toISOString().slice(0, 10),
    prioritySkill,
    items,
    estimatedMinutes: items.reduce((sum, item) => sum + item.durationMinutes, 0),
    primaryScenarioId: scenario.id,
  };
}

/** Convenience wrapper using a loaded user profile. */
export function buildDailyPlanForProfile(profile: UserProfile | null): DailyPlan {
  return buildDailyPlan({
    profession: profile?.profession,
    targetCountry: profile?.targetCountry,
    skillMap: profile?.skillMap,
  });
}

export type { DailyPlan, PlanItem };
