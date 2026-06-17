export interface PlanItem {
  type: "learn" | "drill" | "sample" | "guided" | "practice" | "exam" | "review";
  skill: string;
  title: string;
  durationMinutes: number;
  route: string;
  scenarioId?: string;
}

export interface DailyPlan {
  date: string;
  prioritySkill: string;
  items: PlanItem[];
  estimatedMinutes: number;
  /** Primary writing scenario driving guided/practice routes */
  primaryScenarioId?: string;
}
