import type { ClinicalChecklistGroup } from "./clinical-checklist";

/** Sourced from docs/01-OET-RESEARCH/05-speaking-deep-dive.md */
export const OET_SPEAKING_OVERVIEW = {
  rolePlays: 2,
  prepMinutesEach: 3,
  durationMinutesEach: 5,
  warmUpMinutes: 2,
  totalAssessedMinutes: 20,
  totalWithWarmUp: 22,
} as const;

export interface SpeakingExamTip {
  id: string;
  title: string;
  body: string;
  group?: ClinicalChecklistGroup;
}

export const SPEAKING_EXAM_TIPS: SpeakingExamTip[] = [
  {
    id: "format",
    title: "Exam format",
    body: "Two role-plays (~5 min each) with 3 minutes prep per card. Warm-up is not assessed. Your profession determines scenario content.",
  },
  {
    id: "grade-b",
    title: "Grade B target",
    body: "Aim for mostly 5/6 on linguistic criteria and 2/3 on each clinical communication area. Perfect grammar without empathy still fails.",
  },
  {
    id: "ice",
    title: "ICE early",
    body: "Elicit Ideas, Concerns, and Expectations before giving information. OET assessors reward patient-centred structure.",
    group: "perspective",
  },
  {
    id: "open-closed",
    title: "Open → closed questions",
    body: "Start with open questions ('Tell me about…'). Use closed questions to confirm specifics. Avoid compound or leading questions.",
    group: "gathering",
  },
  {
    id: "check-understanding",
    title: "Check understanding",
    body: "Use teach-back: 'Can you tell me how you'll…' — not just 'Do you understand?'",
    group: "giving",
  },
  {
    id: "structure-flow",
    title: "Ideal flow",
    body: "Greeting → gather (ICE) → explain in chunks → check understanding → close. Signpost transitions.",
    group: "structure",
  },
  {
    id: "computer",
    title: "Computer-delivered speaking",
    body: "May be at home on video — quiet room, stable connection, professional dress. Interlocutor leads timing.",
  },
  {
    id: "language-only",
    title: "Language test",
    body: "Stay in role. Do not give real medical advice beyond the scenario — assessors score communication, not clinical management.",
  },
  {
    id: "accent-diversity",
    title: "Varied patient accents",
    body: "OET interlocutors use standard English with varied accents. Respond to clinical meaning — do not comment on accent. Use open questions and check understanding if a detail is unclear.",
  },
  {
    id: "intelligibility",
    title: "Your intelligibility",
    body: "Speak clearly at a moderate pace. Short sentences and plain terms help patients whose first language is not English — this is graded as linguistic clarity, not accent elimination.",
  },
];

export function tipsForSpeakingTags(weakTags: string[]): SpeakingExamTip[] {
  const tagSet = new Set(weakTags);
  const matched = SPEAKING_EXAM_TIPS.filter(
    (t) => t.group && tagSet.has(`speaking:${t.group === "perspective" ? "ice-expectations" : t.group === "gathering" ? "structure" : t.group}`),
  );
  if (matched.length) return matched.slice(0, 3);
  if (tagSet.has("speaking:ice-expectations")) {
    return SPEAKING_EXAM_TIPS.filter((t) => t.id === "ice" || t.id === "structure-flow");
  }
  if (tagSet.has("speaking:structure")) {
    return SPEAKING_EXAM_TIPS.filter((t) => t.id === "structure-flow" || t.id === "open-closed");
  }
  if (tagSet.has("speaking:clinical-comm")) {
    return SPEAKING_EXAM_TIPS.filter((t) => t.id === "ice" || t.id === "check-understanding");
  }
  return SPEAKING_EXAM_TIPS.slice(0, 3);
}

export const PREP_WORKSHEET_FIELDS = [
  { id: "opening", label: "Opening / rapport phrase", placeholder: "Good morning, I'm… How can I help?" },
  { id: "questions", label: "Questions to ask (open → closed)", placeholder: "What do you know about…? What concerns you?" },
  { id: "information", label: "Key information to give", placeholder: "Explain in 2–3 short chunks" },
  { id: "check", label: "Check understanding phrase", placeholder: "Can you tell me back…?" },
  { id: "close", label: "Close", placeholder: "Any other questions before you go?" },
] as const;

export type PrepWorksheetFieldId = (typeof PREP_WORKSHEET_FIELDS)[number]["id"];

export type PrepWorksheet = Record<PrepWorksheetFieldId, string>;

export function emptyPrepWorksheet(): PrepWorksheet {
  return { opening: "", questions: "", information: "", check: "", close: "" };
}
