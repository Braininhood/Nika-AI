export type ProgressBadgeId =
  | "skill_map_ready"
  | "first_practice"
  | "quiz_rookie"
  | "quiz_perfect"
  | "clever_mind"
  | "streak_3"
  | "streak_7"
  | "all_four_skills"
  | "nika_fledgling"
  | "nika_rising"
  | "nika_guardian"
  | "skill_at_target"
  | "mock_complete";

export type ProgressBadgeCategory = "journey" | "skills" | "streak" | "nika";

export interface ProgressBadge {
  id: ProgressBadgeId;
  title: string;
  description: string;
  icon: string;
  category: ProgressBadgeCategory;
}

export interface ProgressSnapshot {
  hasSkillMap: boolean;
  totalAttempts: number;
  skillsAttempted: Set<string>;
  readingQuizCount: number;
  cleverQuizCount: number;
  bestQuizAccuracy: number;
  studyStreakDays: number;
  nikaStageRank: number;
  skillsAtTarget: number;
  mockCompleted: number;
}

export interface BadgeUnlock {
  type: "badge";
  badgeId: ProgressBadgeId;
}
