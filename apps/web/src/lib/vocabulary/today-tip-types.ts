export interface TodayTipSpeaking {
  opening?: string[];
  clinical_questions?: string[];
  empathy?: string[];
  explanation?: string[];
  advice?: string[];
}

export interface TodayTipPhrase {
  phrase: string;
  meaning: string;
  example: string;
}

export interface TodayTip {
  date: string;
  profession: string;
  profession_label: string;
  tip_id: string;
  headline: string;
  term: string;
  phonetic: string;
  definition: string;
  example: string;
  speaking: TodayTipSpeaking;
  writing_clinical: string[];
  writing_key_phrases: string[];
  exam_tip_use: string[];
  exam_tip_avoid: string[];
  grade_a_phrase: string;
  vocabulary_phrases: TodayTipPhrase[];
}

export const TODAY_TIP_CACHE_KEY = "oet-today-tip-cache";

export function cacheTodayTip(tip: TodayTip): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TODAY_TIP_CACHE_KEY, JSON.stringify(tip));
  } catch {
    /* ignore */
  }
}

export function loadCachedTodayTip(): TodayTip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TODAY_TIP_CACHE_KEY);
    if (!raw) return null;
    const tip = JSON.parse(raw) as TodayTip;
    if (tip.date !== new Date().toISOString().slice(0, 10)) return null;
    return tip;
  } catch {
    return null;
  }
}
