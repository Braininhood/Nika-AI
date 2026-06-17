/** OET writing typical word-count band (Grade B letters). */
export const OET_WORD_MIN = 150;
export const OET_WORD_MAX = 220;
export const OET_WORD_TARGET = 180;

export type WordCountStatus = "empty" | "low" | "ok" | "high";

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function wordCountStatus(
  count: number,
  min = OET_WORD_MIN,
  max = OET_WORD_MAX,
): WordCountStatus {
  if (count === 0) return "empty";
  if (count < min) return "low";
  if (count > max) return "high";
  return "ok";
}

export function wordCountLabel(
  count: number,
  min = OET_WORD_MIN,
  max = OET_WORD_MAX,
): string {
  const status = wordCountStatus(count, min, max);
  switch (status) {
    case "empty":
      return `${count} words · aim ${min}–${max}`;
    case "low":
      return `${count} words · below ${min} (too short)`;
    case "high":
      return `${count} words · above ${max} (trim if possible)`;
    case "ok":
      return `${count} words · in range ✓`;
  }
}

export const WORD_COUNT_STATUS_CLASS: Record<WordCountStatus, string> = {
  empty: "text-ink-soft",
  low: "text-warning",
  ok: "text-forest",
  high: "text-danger",
};
