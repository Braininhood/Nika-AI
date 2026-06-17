import { buildSample } from "./helpers";
import type { GradedSampleLetter } from "./types";

export const PHARMACY_SAMPLES: GradedSampleLetter[] = [
  buildSample({
    id: "sample-pharm-referral-b",
    scenarioId: "w-pharm-001",
    profession: "pharmacy",
    title: "Referral — BP review after amlodipine",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 168,
    paragraphs: [
      {
        label: "Opening & purpose",
        text: "Dear Dr Chen,\n\nRe: Mr James Holt, aged 58 years\n\nI am writing to refer Mr Holt for review of his blood pressure management. I would be grateful if you could arrange an appointment within two weeks.",
        sourceNoteIds: [],
        notes: ["Purpose clear in opening.", "Requested action matches task (2 weeks)."],
      },
      {
        label: "Clinical detail",
        text: "Mr Holt attended the pharmacy on 12 June 2026. His blood pressure was 142/88 mmHg (seated, right arm). He commenced amlodipine 5 mg once daily on 5 June 2026 and reports bilateral ankle swelling for four days since starting this medication. He continues to smoke approximately 10 cigarettes per day.",
        sourceNoteIds: ["n1", "n2", "n3", "n4", "n6"],
        notes: ["Irrelevant childhood asthma omitted.", "Swelling linked to medication start date."],
      },
      {
        label: "Closing request",
        text: "Given the ankle swelling following amlodipine initiation, I am concerned about a possible adverse effect and would appreciate your assessment and any adjustment to his antihypertensive regimen.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Closing reinforces purpose without repeating the full case."],
      },
    ],
    criterionComments: {
      Purpose: "Clear referral purpose and timeframe in opening; request restated in closing.",
      Content: "All task bullets covered; irrelevant childhood asthma excluded.",
    },
    assessorSummary:
      "Likely Grade B: task fully addressed with appropriate content selection and formal referral style.",
  }),
  buildSample({
    id: "sample-pharm-referral-c",
    scenarioId: "w-pharm-001",
    profession: "pharmacy",
    title: "Weak example — same task (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMr Holt came to the pharmacy. He has some health problems I want to tell you about.",
        sourceNoteIds: ["n1"],
        notes: ["Purpose vague; reader not named; no requested action."],
      },
      {
        label: "Body (weak)",
        text: "He had asthma as a child. His BP was 142/88. He takes amlodipine. His ankles are swollen. He smokes.",
        sourceNoteIds: ["n2", "n3", "n4", "n5", "n6"],
        notes: ["Note dump includes irrelevant asthma.", "Missing dose and medication start date."],
      },
      {
        label: "Closing (weak)",
        text: "Please see him when you can.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No two-week timeframe.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Purpose unclear; no explicit referral or timeframe.",
      Content: "Irrelevant detail included; key clinical links missing.",
      "Genre & Style": "Too informal for professional referral.",
    },
    assessorSummary:
      "Likely Grade C: compare with the Grade B sample — purpose, selected content, and formal request are missing.",
  }),
];
