/** Exam date helpers — reusable in Phase 2+ mock countdowns. */

import type { StudyGoal } from "@/lib/domain/types";

export interface ExamCountdown {
  examDate: string;
  daysRemaining: number;
  label: string;
  urgency: "past" | "soon" | "mid" | "far";
  isPast: boolean;
}

export function parseExamDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatExamDate(value: string): string {
  const d = parseExamDate(value);
  if (!d) return value;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function computeExamCountdown(examDate?: string): ExamCountdown | null {
  if (!examDate) return null;
  const target = parseExamDate(examDate);
  if (!target) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const ms = target.getTime() - today.getTime();
  const daysRemaining = Math.ceil(ms / 86_400_000);
  const isPast = daysRemaining < 0;

  let label: string;
  let urgency: ExamCountdown["urgency"];

  if (isPast) {
    label = `Exam was ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago`;
    urgency = "past";
  } else if (daysRemaining === 0) {
    label = "Exam is today";
    urgency = "soon";
  } else if (daysRemaining === 1) {
    label = "1 day until exam";
    urgency = "soon";
  } else if (daysRemaining <= 14) {
    label = `${daysRemaining} days until exam`;
    urgency = "soon";
  } else if (daysRemaining <= 60) {
    label = `${daysRemaining} days until exam`;
    urgency = "mid";
  } else {
    label = `${daysRemaining} days until exam`;
    urgency = "far";
  }

  return { examDate, daysRemaining, label, urgency, isPast };
}

/** Minimum date for date picker — today. */
export function minExamDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function resolveStudyGoal(profile?: {
  studyGoal?: StudyGoal;
  examDate?: string;
}): StudyGoal {
  if (profile?.studyGoal) return profile.studyGoal;
  return profile?.examDate ? "exam_prep" : "training";
}

/** Countdown only for users explicitly in exam-prep mode with a date set. */
export function shouldShowExamCountdown(profile?: {
  studyGoal?: StudyGoal;
  examDate?: string;
}): boolean {
  if (!profile?.examDate) return false;
  return resolveStudyGoal(profile) === "exam_prep";
}
