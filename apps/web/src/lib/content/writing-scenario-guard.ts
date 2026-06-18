import type { WritingScenario } from "@/content/writing/scenarios/types";

/** Bundled/custom catalog payloads may omit meta — skip them to avoid runtime crashes. */
export function isValidWritingScenario(value: unknown): value is WritingScenario {
  if (!value || typeof value !== "object") return false;
  const s = value as WritingScenario;
  return (
    typeof s.id === "string" &&
    typeof s.profession === "string" &&
    typeof s.difficulty === "number" &&
    Boolean(s.meta) &&
    typeof s.meta.title === "string" &&
    typeof s.meta.countryCode === "string"
  );
}

export function scenarioSortTitle(s: WritingScenario): string {
  return s.meta?.title ?? s.id;
}
