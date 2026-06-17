export interface LetterTypeModule {
  id: string;
  professions: string[];
  title: string;
  summary: string;
  structure: string[];
  tip: string;
}

export const LETTER_TYPE_MODULES: LetterTypeModule[] = [
  {
    id: "lt-referral",
    professions: [
      "pharmacy",
      "medicine",
      "dentistry",
      "physiotherapy",
      "optometry",
      "podiatry",
      "radiography",
      "speech_pathology",
      "veterinary_science",
    ],
    title: "Referral letter",
    summary: "Refer a patient (or animal) to another clinician for assessment or ongoing care.",
    structure: [
      "Opening: I am writing to refer [patient] for…",
      "Presenting issue + relevant findings from notes",
      "Current medications / context",
      "Clear request (appointment, review, investigation)",
    ],
    tip: "Match every task bullet to a sentence — omit unrelated history.",
  },
  {
    id: "lt-discharge",
    professions: ["nursing", "medicine", "occupational_therapy"],
    title: "Discharge / transfer letter",
    summary: "Hand over care to community nurse, GP, or another service.",
    structure: [
      "Purpose: discharge / transfer to named recipient",
      "Diagnosis, treatment during stay, current status",
      "Medications and follow-up plan",
      "Warning signs + who to contact",
    ],
    tip: "Focus on what the next carer must do — not the full hospital record.",
  },
  {
    id: "lt-transfer",
    professions: ["nursing"],
    title: "Transfer letter",
    summary: "Hand over ongoing monitoring to district or community nursing.",
    structure: [
      "Reason for transfer and current stability",
      "Monitoring plan (weights, symptoms, medications)",
      "Red-flag symptoms requiring urgent review",
      "Contact details and review timing",
    ],
    tip: "Emphasise safety-netting and measurable monitoring tasks.",
  },
  {
    id: "lt-advice",
    professions: [
      "pharmacy",
      "dietetics",
      "physiotherapy",
      "occupational_therapy",
      "speech_pathology",
      "veterinary_science",
    ],
    title: "Advice / update letter",
    summary: "Document counselling, rehabilitation progress, or a management plan for the referrer.",
    structure: [
      "Purpose of advice / update",
      "Key recommendations in plain professional language",
      "Safety-netting and follow-up",
    ],
    tip: "Keep tone formal even when summarising spoken advice.",
  },
  {
    id: "lt-reply",
    professions: ["medicine", "physiotherapy", "dentistry", "radiography", "podiatry"],
    title: "Reply to referral",
    summary: "Respond to another professional with findings or a completed plan.",
    structure: [
      "Acknowledge referral and patient",
      "Assessment findings",
      "Management plan or completed action",
      "Further requests if needed",
    ],
    tip: "Answer the referrer's question directly in the opening.",
  },
];

export function letterTypesForProfession(profession: string): LetterTypeModule[] {
  if (!profession) return [];
  return LETTER_TYPE_MODULES.filter((m) => m.professions.includes(profession));
}
