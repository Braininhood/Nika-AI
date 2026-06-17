import type { WritingScenario } from "./types";

export const PHARMACY_SCENARIOS: WritingScenario[] = [
  {
    id: "w-pharm-001",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "BP review after amlodipine",
      letterType: "referral",
      readerRole: "General Practitioner",
      readerName: "Dr Sarah Chen",
      estimatedWordCount: 180,
      countryCode: "AU",
    },
    taskSheet: {
      instruction:
        "Using the information in the case notes, write a letter of referral to Dr Sarah Chen requesting review of the patient's blood pressure management.",
      bulletPoints: [
        "Refer Mr Holt for BP review",
        "Mention ankle swelling since starting amlodipine",
        "Request appointment within 2 weeks",
      ],
    },
    caseNotes: [
      { id: "n1", date: "12/06/26", text: "Mr James Holt, 58y, community pharmacy visit", relevant: true },
      { id: "n2", text: "BP today: 142/88 mmHg (seated, right arm)", relevant: true },
      { id: "n3", text: "Rx: amlodipine 5mg OD commenced 05/06/26", relevant: true },
      { id: "n4", text: "C/o bilateral ankle swelling x 4 days", relevant: true },
      { id: "n5", text: "Childhood asthma — resolved", relevant: false },
      { id: "n6", text: "Smoker 10/day", relevant: true },
    ],
    assessorGuide: {
      purposeStatement: "Refer for BP review due to possible amlodipine side effect",
      mustInclude: ["n2", "n3", "n4", "n6"],
      shouldOmit: ["n5"],
    },
  },
  {
    id: "w-pharm-002",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "Warfarin–antibiotic interaction",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr James O'Brien",
      estimatedWordCount: 175,
      countryCode: "IE",
    },
    taskSheet: {
      instruction:
        "Write to Dr O'Brien summarising your counselling of Mrs Byrne about a newly prescribed antibiotic while she takes warfarin.",
      bulletPoints: [
        "State purpose of letter and patient identity",
        "Document warfarin dose and recent INR",
        "Explain interaction risk and counselling given",
        "Request INR monitoring plan",
      ],
    },
    caseNotes: [
      { id: "n1", date: "15/06/26", text: "Mrs Maeve Byrne, 67y — dispensing review", relevant: true },
      { id: "n2", text: "Warfarin 3mg nocte; INR 2.4 (01/06/26)", relevant: true },
      { id: "n3", text: "GP prescribed amoxicillin 500mg TDS x 7 days today", relevant: true },
      { id: "n4", text: "Counselled: report bleeding, bruising, dark stools", relevant: true },
      { id: "n5", text: "Suggested INR repeat in 3–5 days", relevant: true },
      { id: "n6", text: "Patient's daughter is a nurse", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Inform GP of interaction counselling and need for INR monitoring",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
  {
    id: "w-pharm-003",
    profession: "pharmacy",
    difficulty: 2,
    meta: {
      title: "Methotrexate monitoring reminder",
      letterType: "advice",
      readerRole: "General Practitioner",
      readerName: "Dr Rachel Hughes",
      estimatedWordCount: 170,
      countryCode: "UK",
    },
    taskSheet: {
      instruction:
        "Write to Dr Hughes regarding Mr Okonkwo's weekly methotrexate and the need for blood monitoring after a missed FBC.",
      bulletPoints: [
        "State patient identity and current methotrexate regimen",
        "Note missed blood test and counselling provided today",
        "Request repeat FBC and LFT within one week",
        "Document folic acid supply and red-flag symptoms",
      ],
    },
    caseNotes: [
      { id: "n1", date: "17/06/26", text: "Mr Chike Okonkwo, 52y — MTX counselling visit", relevant: true },
      { id: "n2", text: "Methotrexate 15mg weekly; folic acid 5mg weekly", relevant: true },
      { id: "n3", text: "FBC due 10/06/26 — not completed; patient forgot", relevant: true },
      { id: "n4", text: "No mouth ulcers, fever, or breathlessness reported", relevant: true },
      { id: "n5", text: "Advised urgent FBC/LFT; supplied spare folic acid", relevant: true },
      { id: "n6", text: "Works night shifts at warehouse", relevant: false },
    ],
    assessorGuide: {
      purposeStatement: "Alert GP to overdue methotrexate monitoring and patient counselling",
      mustInclude: ["n1", "n2", "n3", "n4", "n5"],
      shouldOmit: ["n6"],
    },
  },
];
