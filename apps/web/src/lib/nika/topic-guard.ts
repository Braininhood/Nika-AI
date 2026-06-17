/** Client-side topic guard — mirrors server; UX hint before send. */

export type TopicVerdict = "allowed" | "refused";

export interface GuardResult {
  verdict: TopicVerdict;
  reason: string;
}

const OFF_TOPIC =
  /\b(weather|football|movie|netflix|dating|recipe|cook(ing)?|politics|bitcoin|crypto)\b/i;

const VOCABULARY =
  /\b(what\s+does|what\s+is|what'?s|explain|define|meaning\s+of|translate|vocab|vocabulary|pronunciation|how\s+do\s+you\s+say)\b/i;

const ALLOWED =
  /\b(oet|listening|reading|writing|speaking|gphc|gmc|nmc|hcpc|ahpra|regulator|mock|study|import|flashcard|ice|criteria|oet\.com|progress|plan|practice|tasks?|exercises?|create|mix(ed)?|balanced|schedule|sub-?tests?)\b/i;

export function classifyQuestion(message: string): GuardResult {
  const text = message.trim();
  if (!text) return { verdict: "refused", reason: "empty" };
  if (OFF_TOPIC.test(text)) return { verdict: "refused", reason: "off_topic" };
  if (VOCABULARY.test(text) && !/\b(quiz|test|assessment)\b/i.test(text)) {
    return { verdict: "allowed", reason: "vocabulary" };
  }
  if (ALLOWED.test(text)) return { verdict: "allowed", reason: "matched" };
  if (/^(hi|hello|hey|thanks)\b/i.test(text)) return { verdict: "allowed", reason: "greeting" };
  return { verdict: "refused", reason: "out_of_scope" };
}

export const REFUSAL_HINT =
  "Nika only answers OET exam, official regulator, and app study questions.";
