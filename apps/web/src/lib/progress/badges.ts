import type { ProgressBadge, ProgressBadgeId, ProgressSnapshot } from "@/lib/progress/types";

export const PROGRESS_BADGES: ProgressBadge[] = [
  {
    id: "skill_map_ready",
    title: "Skill Map",
    description: "Complete your diagnostic placement test",
    icon: "🗺️",
    category: "journey",
  },
  {
    id: "first_practice",
    title: "First steps",
    description: "Finish any practice session",
    icon: "👣",
    category: "journey",
  },
  {
    id: "quiz_rookie",
    title: "Quiz starter",
    description: "Submit your first adaptive reading quiz",
    icon: "📖",
    category: "skills",
  },
  {
    id: "quiz_perfect",
    title: "Sharp reader",
    description: "Score 100% on a 5-question quiz",
    icon: "✨",
    category: "skills",
  },
  {
    id: "clever_mind",
    title: "Quiz explorer",
    description: "Complete a quick mixed-question quiz",
    icon: "🧩",
    category: "skills",
  },
  {
    id: "streak_3",
    title: "3-day streak",
    description: "Study three days in a row",
    icon: "🔥",
    category: "streak",
  },
  {
    id: "streak_7",
    title: "Week warrior",
    description: "Study seven days in a row",
    icon: "⚡",
    category: "streak",
  },
  {
    id: "all_four_skills",
    title: "Full toolkit",
    description: "Practice all four OET skills",
    icon: "🎯",
    category: "skills",
  },
  {
    id: "nika_fledgling",
    title: "Nika fledgling",
    description: "Reach Fledgling stage with Nika",
    icon: "🥚",
    category: "nika",
  },
  {
    id: "nika_rising",
    title: "Nika rising",
    description: "Reach Rising stage with Nika",
    icon: "🪽",
    category: "nika",
  },
  {
    id: "nika_guardian",
    title: "Nika guardian",
    description: "Reach Guardian stage with Nika",
    icon: "🐉",
    category: "nika",
  },
  {
    id: "skill_at_target",
    title: "On target",
    description: "Bring any skill to your target grade",
    icon: "🏅",
    category: "journey",
  },
  {
    id: "mock_complete",
    title: "Mock courage",
    description: "Complete a full OET mock exam",
    icon: "📝",
    category: "journey",
  },
];

export function badgeById(id: ProgressBadgeId): ProgressBadge {
  return PROGRESS_BADGES.find((b) => b.id === id)!;
}

type BadgeCheck = (snapshot: ProgressSnapshot) => boolean;

const CHECKS: Record<ProgressBadgeId, BadgeCheck> = {
  skill_map_ready: (s) => s.hasSkillMap,
  first_practice: (s) => s.totalAttempts >= 1,
  quiz_rookie: (s) => s.readingQuizCount >= 1,
  quiz_perfect: (s) => s.bestQuizAccuracy >= 1,
  clever_mind: (s) => s.cleverQuizCount >= 1,
  streak_3: (s) => s.studyStreakDays >= 3,
  streak_7: (s) => s.studyStreakDays >= 7,
  all_four_skills: (s) => s.skillsAttempted.size >= 4,
  nika_fledgling: (s) => s.nikaStageRank >= 1,
  nika_rising: (s) => s.nikaStageRank >= 2,
  nika_guardian: (s) => s.nikaStageRank >= 4,
  skill_at_target: (s) => s.skillsAtTarget >= 1,
  mock_complete: (s) => s.mockCompleted >= 1,
};

export function evaluateNewBadges(
  snapshot: ProgressSnapshot,
  unlockedIds: ProgressBadgeId[],
): ProgressBadgeId[] {
  const have = new Set(unlockedIds);
  return PROGRESS_BADGES.filter((b) => !have.has(b.id) && CHECKS[b.id](snapshot)).map(
    (b) => b.id,
  );
}

export function countUnlockedBadges(unlockedIds: ProgressBadgeId[]): number {
  return unlockedIds.length;
}
