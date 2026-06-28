import { apiUrl } from "@/lib/api/base-url";

import {
  cacheTodayTip,
  loadCachedTodayTip,
  type TodayTip,
} from "./today-tip-types";

export type { TodayTip, TodayTipPhrase, TodayTipSpeaking } from "./today-tip-types";

export async function fetchTodayTip(
  accessToken?: string,
  expectedProfession?: string,
): Promise<TodayTip | null> {
  const profession = expectedProfession?.trim().toLowerCase().replace(/-/g, "_");
  const cached = loadCachedTodayTip(profession);
  if (cached) return cached;

  if (!accessToken || !navigator.onLine) {
    return cached ?? null;
  }

  try {
    const res = await fetch(apiUrl("/api/v1/vocabulary/today-tip"), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const tip = (await res.json()) as TodayTip;
    cacheTodayTip(tip);
    return tip;
  } catch {
    return null;
  }
}

/** Collect all phrases worth adding to vocabulary from a tip. */
export function phrasesFromTodayTip(tip: TodayTip): Array<{
  phrase: string;
  meaning: string;
  example: string;
}> {
  const rows = [...tip.vocabulary_phrases];
  const termRow = {
    phrase: tip.term,
    meaning: tip.definition,
    example: tip.example,
  };
  if (!rows.some((r) => r.phrase.toLowerCase() === tip.term.toLowerCase())) {
    rows.unshift(termRow);
  }
  return rows;
}

/** Flat list of speaking/writing lines for optional display. */
export function allTipLines(tip: TodayTip): string[] {
  const s = tip.speaking;
  return [
    ...(s.opening ?? []),
    ...(s.clinical_questions ?? []),
    ...(s.empathy ?? []),
    ...(s.explanation ?? []),
    ...(s.advice ?? []),
    ...tip.writing_clinical,
    ...tip.writing_key_phrases,
    tip.grade_a_phrase,
  ].filter(Boolean);
}
