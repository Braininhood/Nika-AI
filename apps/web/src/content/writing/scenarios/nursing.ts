import type { WritingScenario } from "./types";

export const NURSING_SCENARIOS: WritingScenario[] = [
  {
    id: "w-nurs-012",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Post-op hip wound handover",
      letterType: "discharge",
      readerRole: "Community Nurse",
      readerName: "Ms Helen Wright",
      estimatedWordCount: 200,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Using the case notes, write a discharge letter to Ms Helen Wright, community nurse, for Mrs Patel following hip replacement and wound care education.",
      bulletPoints: [
        "Hand over wound care to community nurse",
        "State wound is healing well",
        "Confirm patient demonstrated dressing change",
        "Note daughter will assist at home",
      ],
    },
    caseNotes: [
      { id: "n1", date: "14/06/26", text: "Mrs Geeta Patel, 72y, post-op hip replacement day 5", relevant: true },
      { id: "n2", text: "Surgical wound healing well, no redness or discharge", relevant: true },
      { id: "n3", text: "Patient demonstrated dressing change under supervision today", relevant: true },
      { id: "n4", text: "Daughter present; will assist with mobility and dressings at home", relevant: true },
      { id: "n5", text: "Patient prefers morning showers", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Discharge handover for community wound care",
      mustInclude: ["n1", "n2", "n3", "n4"],
      shouldOmit: ["n5"],
    },
  },
  {
    id: "w-nurs-013",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Heart failure titration transfer",
      letterType: "transfer",
      readerRole: "District Nurse",
      readerName: "Mr David Lowe",
      estimatedWordCount: 195,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Write a transfer letter to the district nurse regarding Mr Singh's heart failure management after inpatient diuretic adjustment.",
      bulletPoints: [
        "State reason for transfer and current clinical status",
        "Document weight, oedema, and daily weights plan",
        "List medication changes including frusemide dose",
        "Specify red-flag symptoms for urgent review",
      ],
    },
    caseNotes: [
      { id: "n1", date: "16/06/26", text: "Mr Harpreet Singh, 74y, ready for home today", relevant: true },
      { id: "n2", text: "Weight down 2.1 kg since admission; ankle oedema improved", relevant: true },
      { id: "n3", text: "Frusemide increased to 40mg mane; continue ramipril 5mg OD", relevant: true },
      { id: "n4", text: "Daily weights chart provided; limit fluid 1.5L/day", relevant: true },
      { id: "n5", text: "Red flags explained: sudden weight gain, breathlessness at rest", relevant: true },
      { id: "n6", text: "Wife requests Hindi interpreter at next visit", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Safe handover of heart failure monitoring to community nursing",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-nurs-014",
    profession: "nursing",
    difficulty: 2,
    meta: {
      title: "Insulin education discharge",
      letterType: "discharge",
      readerRole: "Practice Nurse",
      readerName: "Ms Karen Webb",
      estimatedWordCount: 195,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Write a discharge letter to Ms Webb regarding Mr Torres, newly commenced on basal insulin after type 2 diabetes decompensation.",
      bulletPoints: [
        "Summarise admission reason and current glycaemic control",
        "Document insulin regimen and injection technique taught",
        "Outline hypoglycaemia education and sick-day rules",
        "Request GP practice nurse follow-up within one week",
      ],
    },
    caseNotes: [
      { id: "n1", date: "19/06/26", text: "Mr Luis Torres, 58y, discharged home today", relevant: true },
      { id: "n2", text: "HbA1c 89 mmol/mol on admission; BSL now 8–12 mmol/L", relevant: true },
      { id: "n3", text: "Started insulin glargine 14 units nocte; metformin continued", relevant: true },
      { id: "n4", text: "Demonstrated pen technique; sharps container supplied", relevant: true },
      { id: "n5", text: "Hypo kit and sick-day plan reviewed with wife", relevant: true },
      { id: "n6", text: "Patient enjoys gardening", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Handover of new insulin therapy to primary care nursing",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
