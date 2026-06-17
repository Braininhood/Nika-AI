import { buildSample } from "./helpers";
import type { GradedSampleLetter } from "./types";

export const NURSING_SAMPLES: GradedSampleLetter[] = [
  buildSample({
    id: "sample-nurs-discharge-b",
    scenarioId: "w-nurs-012",
    profession: "nursing",
    title: "Discharge — post-op hip wound handover",
    letterType: "discharge",
    estimatedOverall: "B",
    wordCount: 192,
    paragraphs: [
      {
        label: "Purpose & handover",
        text: "Dear Ms Wright,\n\nRe: Mrs Geeta Patel, aged 72 years\n\nI am writing to hand over Mrs Patel's wound care following her hip replacement on day 5 post-operatively. She is medically stable for discharge home today.",
        sourceNoteIds: ["n1"],
        notes: ["Purpose and recipient stated immediately.", "Clinical context concise."],
      },
      {
        label: "Wound status & education",
        text: "The surgical wound is healing well with no redness or discharge. Mrs Patel demonstrated dressing change under supervision this morning and understands the aseptic technique required. Her daughter was present and will assist with mobility and dressings at home.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Handover focuses on what community nurse must continue.", "Carer involvement documented."],
      },
      {
        label: "Follow-up",
        text: "Please review the wound at your first visit within 48 hours and contact the ward if increased pain, fever, or wound leakage occurs.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: [],
        notes: ["Clear follow-up action for community nurse."],
      },
    ],
    assessorSummary:
      "Likely Grade B: discharge purpose clear, relevant findings selected, appropriate handover tone.",
  }),
];

export const MEDICINE_SAMPLES: GradedSampleLetter[] = [
  buildSample({
    id: "sample-med-reply-b",
    scenarioId: "w-med-015",
    profession: "medicine",
    title: "Reply — fatigue investigation results",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 186,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr Khan,\n\nRe: Mrs Elena Lopez, aged 48 years\n\nThank you for referring Mrs Lopez for investigation of persistent fatigue over three months. I saw her in clinic on 10 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Referral acknowledged; patient identified."],
      },
      {
        label: "Findings",
        text: "Full blood count was normal. Ferritin was 45 mcg/L (low-normal). Thyroid function showed TSH 6.2 mIU/L with mildly elevated TSH and normal free T4. Mrs Lopez works night shifts, which may contribute to her symptoms.",
        sourceNoteIds: ["n2", "n3", "n5"],
        notes: ["Key results paraphrased, not copied as a list.", "Relevant lifestyle factor included."],
      },
      {
        label: "Plan",
        text: "I have advised lifestyle measures and arranged repeat thyroid function tests in six weeks. I would appreciate your continued monitoring of her symptoms in primary care.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: ["n4"],
        notes: ["Management plan and GP follow-up clear."],
      },
    ],
    assessorSummary:
      "Likely Grade B: direct reply structure with findings and plan; holiday plans appropriately omitted.",
  }),
];
