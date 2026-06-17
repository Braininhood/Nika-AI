import type { StudyGoal } from "@/lib/domain/types";

export const STUDY_GOAL_OPTIONS: {
  value: StudyGoal;
  title: string;
  description: string;
}[] = [
  {
    value: "training",
    title: "Training only",
    description:
      "Build skills at your own pace. No exam date needed — lessons, drills, and your daily plan.",
  },
  {
    value: "exam_prep",
    title: "Preparing for OET",
    description:
      "Booked or planning an exam? Add your date later for a countdown on Home and Progress.",
  },
];

interface StudyGoalPickerProps {
  value: StudyGoal;
  onChange: (goal: StudyGoal) => void;
  disabled?: boolean;
}

export function StudyGoalPicker({ value, onChange, disabled }: StudyGoalPickerProps) {
  return (
    <div className="space-y-2">
      {STUDY_GOAL_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${
              selected
                ? "border-brand-primary bg-brand-accent-soft/40"
                : "border-border bg-surface hover:bg-surface-muted"
            }`}
          >
            <p className="font-semibold text-ink">{option.title}</p>
            <p className="mt-1 text-xs text-ink-soft">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export function studyGoalLabel(goal: StudyGoal): string {
  return STUDY_GOAL_OPTIONS.find((o) => o.value === goal)?.title ?? goal;
}
