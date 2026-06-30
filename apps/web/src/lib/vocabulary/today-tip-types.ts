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
  /** curated | gemini:… | groq */
  source?: string;
}

function cacheKey(profession?: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const prof = profession?.trim().toLowerCase().replace(/-/g, "_") || "any";
  return `oet-today-tip:${day}:${prof}`;
}

export function cacheTodayTip(tip: TodayTip): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(tip.profession), JSON.stringify(tip));
    // Drop legacy single-key cache from older builds
    localStorage.removeItem("oet-today-tip-cache");
  } catch {
    /* ignore */
  }
}

export function loadCachedTodayTip(expectedProfession?: string): TodayTip | null {
  if (typeof window === "undefined") return null;
  try {
    const expected = expectedProfession?.trim().toLowerCase().replace(/-/g, "_");
    const raw =
      localStorage.getItem(cacheKey(expected)) ??
      localStorage.getItem(cacheKey()) ??
      localStorage.getItem("oet-today-tip-cache");
    if (!raw) return null;
    const tip = JSON.parse(raw) as TodayTip;
    if (tip.date !== new Date().toISOString().slice(0, 10)) return null;
    if (expected && tip.profession !== expected) return null;
    return tip;
  } catch {
    return null;
  }
}
