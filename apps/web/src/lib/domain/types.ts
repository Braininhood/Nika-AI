export type OetProfession =
  | "medicine"
  | "nursing"
  | "pharmacy"
  | "dentistry"
  | "physiotherapy"
  | "radiography"
  | "occupational_therapy"
  | "optometry"
  | "podiatry"
  | "veterinary_science"
  | "speech_pathology"
  | "dietetics";

export type OetGrade = "A" | "B" | "C+" | "C" | "D" | "E";

/** Training-only learners vs users with a booked/planned OET date. */
export type StudyGoal = "training" | "exam_prep";

export type OetSkill = "listening" | "reading" | "writing" | "speaking";

export interface TargetGrades {
  listening: OetGrade;
  reading: OetGrade;
  writing: OetGrade;
  speaking: OetGrade;
  single_sitting: boolean;
}

export interface SkillDiagnostic {
  estBand: OetGrade;
  gap: number;
  weakTags: string[];
}

export interface SkillMap {
  userId: string;
  profession: OetProfession;
  targetRegulator: string;
  targetGrades: TargetGrades;
  diagnostic: Record<OetSkill, SkillDiagnostic>;
  priority: OetSkill[];
  estimatedWeeksToTarget: number;
  computedAt: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  profession?: OetProfession;
  targetCountry?: string;
  targetRegulator?: string;
  targetGrades?: TargetGrades;
  onboardingComplete: boolean;
  isGuest: boolean;
  skillMap?: SkillMap;
  examDate?: string;
  /** Defaults to training when unset — most users start without a booked exam. */
  studyGoal?: StudyGoal;
  /** ISO language code for vocabulary translations (e.g. PL, HI). */
  nativeLanguage?: string;
}
