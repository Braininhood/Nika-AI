export interface VocabularyEntry {
  id: string;
  word: string;
  phrase?: string;
  context?: string;
  englishExplanation: string;
  nativeTranslation?: string;
  nativeLanguage: string;
  phoneticHint?: string;
  tags: string[];
  source: "manual" | "reading" | "quiz" | "nika" | "today_tip";
  addedAt: number;
  lastReviewedAt?: number;
}

export interface GeneratedAssessmentRecord {
  id: string;
  title: string;
  skill: string;
  questions: Record<string, unknown>[];
  createdAt: number;
  completedAt?: number;
}

export const NATIVE_LANGUAGES = [
  { code: "PL", label: "Polish" },
  { code: "HI", label: "Hindi" },
  { code: "AR", label: "Arabic" },
  { code: "ZH", label: "Chinese" },
  { code: "ES", label: "Spanish" },
  { code: "FR", label: "French" },
  { code: "DE", label: "German" },
  { code: "PT", label: "Portuguese" },
  { code: "TR", label: "Turkish" },
  { code: "VI", label: "Vietnamese" },
  { code: "TL", label: "Filipino" },
  { code: "KO", label: "Korean" },
  { code: "JA", label: "Japanese" },
  { code: "RU", label: "Russian" },
  { code: "UK", label: "Ukrainian" },
] as const;

export function defaultNativeLanguage(profileLang?: string): string {
  if (profileLang) return profileLang.toUpperCase().split("-")[0]!;
  return "PL";
}
