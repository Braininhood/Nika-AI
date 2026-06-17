import type { WritingScenario } from "./types";

export const MEDICINE_SCENARIOS: WritingScenario[] = [
  {
    id: "w-med-015",
    profession: "medicine",
    difficulty: 2,
    meta: {
      title: "Fatigue investigation reply",
      letterType: "reply",
      readerRole: "General Practitioner",
      readerName: "Dr Ahmed Khan",
      estimatedWordCount: 190,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Write a reply to Dr Ahmed Khan regarding Mrs Lopez, whom he referred for investigation of persistent fatigue.",
      bulletPoints: [
        "Acknowledge referral and thank Dr Khan",
        "Summarise investigation findings (normal FBC, mildly raised TSH)",
        "Outline management plan and follow-up",
      ],
    },
    caseNotes: [
      { id: "n1", date: "10/06/26", text: "Mrs Elena Lopez, 48y, referred by Dr Khan — fatigue 3 months", relevant: true },
      { id: "n2", text: "FBC normal; ferritin 45 mcg/L (low-normal)", relevant: true },
      { id: "n3", text: "TSH 6.2 mIU/L (mildly elevated); free T4 normal", relevant: true },
      { id: "n4", text: "Plan: repeat TFTs in 6 weeks; lifestyle advice given", relevant: true },
      { id: "n5", text: "Patient works night shifts", relevant: true },
      { id: "n6", text: "Holiday to Spain booked next month", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Reply to GP with investigation results and plan",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-med-016",
    profession: "medicine",
    difficulty: 3,
    meta: {
      title: "Chest pain discharge to GP",
      letterType: "discharge",
      readerRole: "General Practitioner",
      readerName: "Dr Priya Nair",
      estimatedWordCount: 210,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write a discharge summary to Dr Nair for Mr Wallace, admitted with chest pain and ruled out for acute coronary syndrome.",
      bulletPoints: [
        "Summarise admission reason and key results",
        "List discharge medications and changes",
        "Outline follow-up with cardiology and GP",
        "Provide return precautions",
      ],
    },
    caseNotes: [
      { id: "n1", date: "18/06/26", text: "Mr Colin Wallace, 61y, discharged today", relevant: true },
      { id: "n2", text: "Troponin negative x2; ECG unchanged from baseline", relevant: true },
      { id: "n3", text: "Started aspirin 100mg, atorvastatin 40mg, GTN PRN", relevant: true },
      { id: "n4", text: "Cardiology OP clinic in 2 weeks; stress test booked", relevant: true },
      { id: "n5", text: "Return if chest pain >10 min or at rest", relevant: true },
      { id: "n6", text: "Patient anxious about driving", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Discharge handover after low-risk chest pain admission",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-med-017",
    profession: "medicine",
    difficulty: 2,
    meta: {
      title: "Abnormal LFT referral to hepatology",
      letterType: "referral",
      readerRole: "Hepatologist",
      readerName: "Dr Michael Grant",
      estimatedWordCount: 185,
      countryCode: "US",
    },
    taskSheet: {
      instruction:
        "Refer Ms Rivera to Dr Grant for evaluation of persistently elevated liver enzymes discovered during routine screening.",
      bulletPoints: [
        "State reason for referral and symptom status",
        "Summarise liver function trends and relevant imaging",
        "Include alcohol intake and medication history",
        "Request specialist assessment and management plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "11/06/26", text: "Ms Carmen Rivera, 44y — primary care review", relevant: true },
      { id: "n2", text: "ALT 78, AST 62 (x3 over 6 months); asymptomatic", relevant: true },
      { id: "n3", text: "Abdominal ultrasound: mild hepatic steatosis", relevant: true },
      { id: "n4", text: "EtOH ~2 drinks/day; no IV drug use", relevant: true },
      { id: "n5", text: "Medications: atorvastatin, levothyroxine only", relevant: true },
      { id: "n6", text: "Planning wedding in fall", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Refer for specialist review of chronic elevated transaminases",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
