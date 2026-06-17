import { buildSample } from "./helpers";
import type { GradedSampleLetter } from "./types";

export const WAVE5_BASELINE_GRADED_SAMPLES: GradedSampleLetter[] = [
  // ── pharmacy ──────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-pharm-002-b",
    scenarioId: "w-pharm-002",
    profession: "pharmacy",
    title: "Warfarin–antibiotic interaction counselling",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 178,
    paragraphs: [
      {
        label: "Opening & purpose",
        text: "Dear Dr O'Brien,\n\nRe: Mrs Maeve Byrne, aged 67 years\n\nI am writing to summarise my counselling of Mrs Byrne on 15 June 2026 regarding a newly prescribed antibiotic while she continues warfarin therapy. I would appreciate your guidance on INR monitoring.",
        sourceNoteIds: ["n1", "n3"],
        notes: ["Purpose and patient identity stated clearly.", "Links antibiotic to warfarin interaction risk."],
      },
      {
        label: "Clinical detail",
        text: "She takes warfarin 3 mg nocte; her most recent INR on 1 June 2026 was 2.4. Amoxicillin 500 mg three times daily for seven days was prescribed today. I counselled her to report promptly any bleeding, bruising, or dark stools.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Warfarin dose and INR documented.", "Interaction counselling and red flags included."],
      },
      {
        label: "Request",
        text: "Given the interaction risk, I suggested a repeat INR in three to five days and would be grateful if you could confirm an appropriate monitoring plan.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n5"],
        notes: ["INR monitoring timeframe requested.", "Appropriate closing to named GP."],
      },
    ],
    criterionComments: {
      Purpose: "Clear advice purpose with explicit request for INR monitoring plan.",
      Content: "All task bullets addressed; daughter's nursing background appropriately omitted.",
      "Genre & Style": "Appropriate formal advice letter to named GP.",
    },
    assessorSummary:
      "Likely Grade B: warfarin–antibiotic interaction fully documented with counselling and INR monitoring request.",
  }),
  buildSample({
    id: "sample-pharm-002-c",
    scenarioId: "w-pharm-002",
    profession: "pharmacy",
    title: "Weak example — warfarin interaction (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 152,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMrs Byrne came to the pharmacy. She has new antibiotics and takes warfarin.",
        sourceNoteIds: ["n1"],
        notes: ["Reader not named.", "Purpose vague; no monitoring request."],
      },
      {
        label: "Body (weak)",
        text: "Her daughter is a nurse. Warfarin dose not stated. Amoxicillin started. I told her to watch for bleeding.",
        sourceNoteIds: ["n3", "n4", "n6"],
        notes: ["Irrelevant family detail included.", "INR result and dose missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please check INR when you can.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No three-to-five-day timeframe.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Purpose unclear; no structured INR monitoring request.",
      Content: "Irrelevant daughter detail included; warfarin dose and INR omitted.",
      "Genre & Style": "Too informal for professional correspondence.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing INR, dose detail, and specific monitoring timeframe.",
  }),

  buildSample({
    id: "sample-pharm-003-b",
    scenarioId: "w-pharm-003",
    profession: "pharmacy",
    title: "Methotrexate monitoring reminder",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 172,
    paragraphs: [
      {
        label: "Opening & regimen",
        text: "Dear Dr Hughes,\n\nRe: Mr Chike Okonkwo, aged 52 years\n\nI am writing regarding Mr Okonkwo's weekly methotrexate therapy following his counselling visit on 17 June 2026. His scheduled blood monitoring was overdue and I would appreciate your arranging urgent repeat tests.",
        sourceNoteIds: ["n1", "n2", "n3"],
        notes: ["Patient identity and purpose stated.", "Missed FBC flagged in opening."],
      },
      {
        label: "Counselling & symptoms",
        text: "He takes methotrexate 15 mg weekly with folic acid 5 mg weekly. His FBC due on 10 June 2026 was not completed. He denies mouth ulcers, fever, or breathlessness. I advised urgent FBC and LFT and supplied spare folic acid.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["Regimen and missed test documented.", "Red-flag negatives and counselling included."],
      },
      {
        label: "Request",
        text: "I would be grateful if you could arrange repeat FBC and LFT within one week and confirm ongoing methotrexate monitoring.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n5"],
        notes: ["Specific one-week request for blood tests.", "Monitoring plan reinforced."],
      },
    ],
    criterionComments: {
      Purpose: "Clear alert regarding overdue monitoring with explicit test request.",
      Content: "All task bullets covered; night-shift occupation appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: methotrexate monitoring gap documented with counselling, red flags, and urgent FBC/LFT request.",
  }),
  buildSample({
    id: "sample-pharm-003-c",
    scenarioId: "w-pharm-003",
    profession: "pharmacy",
    title: "Weak example — methotrexate monitoring (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 158,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Hughes,\n\nMr Okonkwo missed a blood test. He takes methotrexate.",
        sourceNoteIds: ["n1", "n3"],
        notes: ["Patient age omitted.", "Purpose and regimen detail minimal."],
      },
      {
        label: "Body (weak)",
        text: "He works night shifts at a warehouse. Folic acid supplied. No mouth ulcers. Blood test overdue.",
        sourceNoteIds: ["n4", "n5", "n6"],
        notes: ["Irrelevant occupation included.", "Dose and LFT request missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please organise bloods soon.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No one-week timeframe.", "FBC and LFT not specified."],
      },
    ],
    criterionComments: {
      Purpose: "Monitoring alert vague; no structured request within one week.",
      Content: "Irrelevant work detail included; methotrexate dose omitted.",
      "Organisation & Layout": "Telegraphic note dump without clear structure.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing dose, LFT request, and one-week monitoring plan.",
  }),

  // ── nursing ───────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-nurs-013-b",
    scenarioId: "w-nurs-013",
    profession: "nursing",
    title: "Heart failure titration transfer",
    letterType: "transfer",
    estimatedOverall: "B",
    wordCount: 198,
    paragraphs: [
      {
        label: "Purpose & status",
        text: "Dear Mr Lowe,\n\nRe: Mr Harpreet Singh, aged 74 years\n\nI am writing to transfer Mr Singh's heart failure management to your district nursing team. He is medically stable for discharge home today, 16 June 2026, following inpatient diuretic adjustment.",
        sourceNoteIds: ["n1"],
        notes: ["Transfer purpose and discharge status clear.", "Recipient named appropriately."],
      },
      {
        label: "Clinical findings & medications",
        text: "His weight has decreased by 2.1 kg since admission and ankle oedema has improved. Frusemide has been increased to 40 mg mane; ramipril 5 mg once daily should continue. A daily weights chart has been provided and fluid intake is limited to 1.5 litres per day.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Weight, oedema, and medication changes documented.", "Home monitoring plan included."],
      },
      {
        label: "Red flags",
        text: "Please reinforce red-flag symptoms: sudden weight gain and breathlessness at rest require urgent medical review. I would be grateful for your first visit within 48 hours.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["Red flags specified for community follow-up.", "Visit timeframe requested."],
      },
    ],
    criterionComments: {
      Purpose: "Clear transfer handover with community nursing actions.",
      Content: "All task bullets addressed; interpreter request appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: safe heart failure handover with weight monitoring, medication changes, and red flags.",
  }),
  buildSample({
    id: "sample-nurs-013-c",
    scenarioId: "w-nurs-013",
    profession: "nursing",
    title: "Weak example — heart failure transfer (Grade C)",
    letterType: "transfer",
    estimatedOverall: "C",
    wordCount: 165,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Hi Mr Lowe,\n\nMr Singh is going home today. He has heart failure.",
        sourceNoteIds: ["n1"],
        notes: ["Informal greeting.", "Transfer purpose not structured."],
      },
      {
        label: "Body (weak)",
        text: "Weight better. Frusemide changed. Wife wants Hindi interpreter. Daily weights chart given.",
        sourceNoteIds: ["n2", "n3", "n4", "n6"],
        notes: ["Irrelevant interpreter request included.", "Dose and fluid limit missing."],
      },
      {
        label: "Closing (weak)",
        text: "Call if problems.\n\nThanks",
        sourceNoteIds: [],
        notes: ["Red flags not specified.", "No visit timeframe."],
      },
    ],
    criterionComments: {
      Purpose: "Handover purpose unclear; community actions not specified.",
      Content: "Irrelevant interpreter detail included; red flags omitted.",
      "Genre & Style": "Too informal for professional transfer letter.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing frusemide dose, fluid limit, and red-flag symptoms.",
  }),

  buildSample({
    id: "sample-nurs-014-b",
    scenarioId: "w-nurs-014",
    profession: "nursing",
    title: "Insulin education discharge",
    letterType: "discharge",
    estimatedOverall: "B",
    wordCount: 195,
    paragraphs: [
      {
        label: "Purpose & admission summary",
        text: "Dear Ms Webb,\n\nRe: Mr Luis Torres, aged 58 years\n\nI am writing to hand over Mr Torres's care following discharge home today, 19 June 2026, after admission for type 2 diabetes decompensation. He has been newly commenced on basal insulin.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Discharge purpose and admission reason clear.", "Insulin initiation flagged."],
      },
      {
        label: "Regimen & education",
        text: "His HbA1c on admission was 89 mmol/mol; blood glucose is now 8–12 mmol/L. Insulin glargine 14 units nocte has been started and metformin continues. He demonstrated pen injection technique and a sharps container was supplied.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Glycaemic control and insulin regimen documented.", "Injection teaching confirmed."],
      },
      {
        label: "Safety & follow-up",
        text: "Hypoglycaemia education and sick-day rules were reviewed with his wife. I would be grateful if your practice could arrange nurse follow-up within one week to reinforce insulin technique and glucose monitoring.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["Hypo kit and sick-day plan included.", "One-week GP practice nurse follow-up requested."],
      },
    ],
    criterionComments: {
      Purpose: "Clear discharge handover with primary care follow-up request.",
      Content: "All task bullets covered; gardening hobby appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: comprehensive insulin discharge handover with education, safety planning, and follow-up request.",
  }),
  buildSample({
    id: "sample-nurs-014-c",
    scenarioId: "w-nurs-014",
    profession: "nursing",
    title: "Weak example — insulin discharge (Grade C)",
    letterType: "discharge",
    estimatedOverall: "C",
    wordCount: 168,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Nurse,\n\nMr Torres discharged. He has diabetes and new insulin.",
        sourceNoteIds: ["n1"],
        notes: ["Recipient not named.", "Admission reason and glycaemic detail missing."],
      },
      {
        label: "Body (weak)",
        text: "Insulin started. Pen technique shown. He enjoys gardening. Wife present.",
        sourceNoteIds: ["n3", "n4", "n6"],
        notes: ["Irrelevant hobby included.", "Dose, HbA1c, and sick-day rules omitted."],
      },
      {
        label: "Closing (weak)",
        text: "Please see him sometime.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No one-week follow-up timeframe.", "Hypoglycaemia education not documented."],
      },
    ],
    criterionComments: {
      Purpose: "Handover purpose vague; no structured follow-up request.",
      Content: "Irrelevant gardening detail included; insulin dose and sick-day plan missing.",
      "Genre & Style": "Generic salutation; informal closing.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing HbA1c, insulin dose, hypo education, and one-week follow-up.",
  }),

  // ── medicine ──────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-med-016-b",
    scenarioId: "w-med-016",
    profession: "medicine",
    title: "Chest pain discharge to GP",
    letterType: "discharge",
    estimatedOverall: "B",
    wordCount: 205,
    paragraphs: [
      {
        label: "Admission summary",
        text: "Dear Dr Nair,\n\nRe: Mr Colin Wallace, aged 61 years\n\nI am writing to discharge Mr Wallace home today, 18 June 2026, following admission with chest pain. Acute coronary syndrome has been ruled out.",
        sourceNoteIds: ["n1"],
        notes: ["Discharge purpose and admission reason clear.", "ACS exclusion stated."],
      },
      {
        label: "Results & medications",
        text: "Troponin was negative on two occasions and the ECG was unchanged from baseline. He has been commenced on aspirin 100 mg daily, atorvastatin 40 mg daily, and sublingual GTN as required.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["Key negative results documented.", "Discharge medications listed."],
      },
      {
        label: "Follow-up & precautions",
        text: "Cardiology outpatient review is arranged in two weeks and a stress test has been booked. He should return immediately if chest pain lasts more than ten minutes or occurs at rest.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: ["n4", "n5"],
        notes: ["Cardiology follow-up and stress test included.", "Return precautions specified."],
      },
    ],
    criterionComments: {
      Purpose: "Clear discharge summary with follow-up and safety advice.",
      Content: "All task bullets addressed; driving anxiety appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: low-risk chest pain discharge with results, medications, follow-up, and return precautions.",
  }),
  buildSample({
    id: "sample-med-016-c",
    scenarioId: "w-med-016",
    profession: "medicine",
    title: "Weak example — chest pain discharge (Grade C)",
    letterType: "discharge",
    estimatedOverall: "C",
    wordCount: 178,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Nair,\n\nMr Wallace had chest pain. Going home today.",
        sourceNoteIds: ["n1"],
        notes: ["ACS exclusion not stated.", "Admission summary minimal."],
      },
      {
        label: "Body (weak)",
        text: "Tests OK. New tablets started. Patient anxious about driving. Cardiology booked.",
        sourceNoteIds: ["n3", "n4", "n6"],
        notes: ["Irrelevant anxiety detail included.", "Troponin, ECG, and medication names missing."],
      },
      {
        label: "Closing (weak)",
        text: "Come back if worse.\n\nRegards",
        sourceNoteIds: [],
        notes: ["Return precautions vague.", "Stress test not mentioned."],
      },
    ],
    criterionComments: {
      Purpose: "Discharge purpose stated but key clinical context incomplete.",
      Content: "Irrelevant driving anxiety included; troponin and specific medications omitted.",
      "Conciseness & Clarity": "Vague phrases such as 'tests OK' and 'new tablets'.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing troponin detail, medication names, and specific return precautions.",
  }),

  buildSample({
    id: "sample-med-017-b",
    scenarioId: "w-med-017",
    profession: "medicine",
    title: "Abnormal LFT referral to hepatology",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 188,
    paragraphs: [
      {
        label: "Referral purpose",
        text: "Dear Dr Grant,\n\nRe: Ms Carmen Rivera, aged 44 years\n\nI am writing to refer Ms Rivera for specialist evaluation of persistently elevated liver enzymes discovered during routine screening. She remains asymptomatic.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Referral purpose and symptom status clear.", "Patient identity stated."],
      },
      {
        label: "Investigations & history",
        text: "ALT has been 78 U/L and AST 62 U/L on three occasions over six months. Abdominal ultrasound showed mild hepatic steatosis. She reports approximately two alcoholic drinks per day and denies intravenous drug use. Current medications are atorvastatin and levothyroxine only.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["LFT trends and imaging documented.", "Alcohol and medication history included."],
      },
      {
        label: "Request",
        text: "I would be grateful if you could assess her and advise on further investigation and management.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: [],
        notes: ["Specialist assessment and management plan requested."],
      },
    ],
    criterionComments: {
      Purpose: "Clear hepatology referral with explicit request for assessment.",
      Content: "All task bullets covered; wedding plans appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: chronic elevated transaminases referral with trends, imaging, alcohol history, and management request.",
  }),
  buildSample({
    id: "sample-med-017-c",
    scenarioId: "w-med-017",
    profession: "medicine",
    title: "Weak example — abnormal LFT referral (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 162,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Specialist,\n\nMs Rivera has high liver enzymes.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Hepatologist not named.", "Referral reason vague."],
      },
      {
        label: "Body (weak)",
        text: "LFTs raised a few times. Ultrasound done. Planning wedding in fall. Takes statin.",
        sourceNoteIds: ["n2", "n3", "n5", "n6"],
        notes: ["Irrelevant wedding detail included.", "ALT/AST values and alcohol history missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please see when possible.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No request for management plan.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Referral purpose unclear; specialist not addressed by name.",
      Content: "Irrelevant social detail included; LFT trends and alcohol intake omitted.",
      "Genre & Style": "Too informal for specialist referral.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing LFT values, steatosis detail, alcohol history, and structured request.",
  }),

  // ── dentistry ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-dent-004-b",
    scenarioId: "w-dent-004",
    profession: "dentistry",
    title: "Periodontal maintenance reply to GP",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 176,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr Park,\n\nRe: Mr Duc Nguyen, aged 55 years\n\nThank you for referring Mr Nguyen regarding bleeding gums in the context of type 2 diabetes. I reviewed him on 13 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Referral acknowledged with diabetes context.", "Patient identity clear."],
      },
      {
        label: "Findings & treatment",
        text: "Generalised bleeding on probing was noted with pockets of 5–6 mm in posterior sextants. Scale and root planing has been completed and oral hygiene instruction was reinforced. His HbA1c of 64 mmol/mol per your letter was discussed with him.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Periodontal findings and treatment documented.", "Diabetes link addressed."],
      },
      {
        label: "Follow-up plan",
        text: "Recall is arranged in three months. I would appreciate your review of glycaemic control if his HbA1c is not improving, as this will support periodontal outcomes.\n\nYours sincerely,\n[Dentist name]",
        sourceNoteIds: ["n5"],
        notes: ["Coordinated follow-up intervals stated.", "GP review linked to diabetes control."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply documenting periodontal care and diabetes coordination.",
      Content: "All task bullets addressed; cycling commute appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: periodontal maintenance reply with diabetes link and coordinated follow-up plan.",
  }),
  buildSample({
    id: "sample-dent-004-c",
    scenarioId: "w-dent-004",
    profession: "dentistry",
    title: "Weak example — periodontal reply (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 155,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Hi Dr Park,\n\nMr Nguyen had gum bleeding. Treatment done.",
        sourceNoteIds: ["n1"],
        notes: ["Informal greeting.", "Referral and diabetes context not acknowledged."],
      },
      {
        label: "Body (weak)",
        text: "Pockets found. Scaling done. He cycles to work daily. HbA1c discussed.",
        sourceNoteIds: ["n2", "n3", "n4", "n6"],
        notes: ["Irrelevant commute detail included.", "Pocket depths and recall interval missing."],
      },
      {
        label: "Closing (weak)",
        text: "See him again later.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No three-month recall.", "GP coordination not requested."],
      },
    ],
    criterionComments: {
      Purpose: "Reply purpose unclear; referral not properly acknowledged.",
      Content: "Irrelevant cycling detail included; pocket measurements omitted.",
      "Genre & Style": "Informal tone inappropriate for GP correspondence.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing pocket depths, three-month recall, and GP glycaemic review request.",
  }),

  // ── physiotherapy ─────────────────────────────────────────────────────────
  buildSample({
    id: "sample-phys-005-b",
    scenarioId: "w-phys-005",
    profession: "physiotherapy",
    title: "ACL post-op rehab update",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 186,
    paragraphs: [
      {
        label: "Purpose & timeline",
        text: "Dear Dr Becker,\n\nRe: Ms Amy Chen, aged 28 years\n\nI am writing to update you on Ms Chen's rehabilitation progress at six weeks post anterior cruciate ligament reconstruction, reviewed on 16 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Purpose and post-operative week stated.", "Surgeon addressed by name."],
      },
      {
        label: "Milestones & programme",
        text: "Knee flexion is 115 degrees with extension lag of minus five degrees and mild effusion remains. Quadriceps strength is approximately 60% of the contralateral limb. Her programme includes closed-chain strengthening, stationary cycling, and balance training. Running is deferred pending your clearance.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["Range, strength, and programme documented.", "Running restriction noted."],
      },
      {
        label: "Request",
        text: "An extension lag persists and I would be grateful if you could review her at your next clinic appointment if this has not resolved.\n\nYours sincerely,\n[Physiotherapist name]",
        sourceNoteIds: ["n5"],
        notes: ["Extension lag flagged with surgical review request."],
      },
    ],
    criterionComments: {
      Purpose: "Clear rehab update with request for surgical review if lag persists.",
      Content: "All task bullets covered; student occupation appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: ACL rehab milestones documented with extension lag concern and surgeon review request.",
  }),
  buildSample({
    id: "sample-phys-005-c",
    scenarioId: "w-phys-005",
    profession: "physiotherapy",
    title: "Weak example — ACL rehab update (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 168,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMs Chen is doing rehab after knee surgery.",
        sourceNoteIds: ["n1"],
        notes: ["Surgeon not named.", "Post-operative week not stated."],
      },
      {
        label: "Body (weak)",
        text: "Knee moving better. She is a physio student. Exercises given. Some swelling.",
        sourceNoteIds: ["n2", "n4", "n6"],
        notes: ["Irrelevant occupation included.", "Flexion, strength, and extension lag missing."],
      },
      {
        label: "Closing (weak)",
        text: "Let me know if you want to see her.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No extension lag concern raised.", "Running restriction not mentioned."],
      },
    ],
    criterionComments: {
      Purpose: "Update purpose vague; no structured surgical review request.",
      Content: "Irrelevant student detail included; objective milestones omitted.",
      "Organisation & Layout": "Lacks structured milestone reporting.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing ROM values, strength percentage, extension lag, and running restriction.",
  }),

  // ── occupational therapy ──────────────────────────────────────────────────
  buildSample({
    id: "sample-ot-006-b",
    scenarioId: "w-ot-006",
    profession: "occupational_therapy",
    title: "Workplace return-to-work plan",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 192,
    paragraphs: [
      {
        label: "Purpose & capacity",
        text: "Dear Dr Fraser,\n\nRe: Mr Erik Olsen, aged 41 years\n\nI am writing to outline a graded return-to-work plan for Mr Olsen following workplace assessment on 14 June 2026. He sustained a distal radius fracture treated with ORIF eight weeks ago and grip strength is improving.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Purpose and injury context clear.", "Functional capacity stated."],
      },
      {
        label: "Modifications & phased hours",
        text: "He works in an office role. An ergonomic keyboard and padded mouse have been recommended. The plan is four hours per day in week one, six hours in week two, and full hours by week three. Heavy lifting above five kilograms should be avoided until orthopaedic review.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["Workplace modifications documented.", "Phased hours and lifting restriction clear."],
      },
      {
        label: "Request",
        text: "I would be grateful if you could support a fit-to-work certificate aligned with this graded plan.\n\nYours sincerely,\n[Occupational therapist name]",
        sourceNoteIds: [],
        notes: ["GP certificate support requested.", "Appropriate closing."],
      },
    ],
    criterionComments: {
      Purpose: "Clear RTW advice with fit-to-work certificate request.",
      Content: "All task bullets covered; hockey coaching appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: graded RTW plan with ergonomic modifications, phased hours, and GP certificate request.",
  }),
  buildSample({
    id: "sample-ot-006-c",
    scenarioId: "w-ot-006",
    profession: "occupational_therapy",
    title: "Weak example — return-to-work plan (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 175,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Fraser,\n\nMr Olsen broke his wrist. He wants to go back to work.",
        sourceNoteIds: ["n1"],
        notes: ["Injury detail minimal.", "Assessment date and ORIF not mentioned."],
      },
      {
        label: "Body (weak)",
        text: "Office job. New keyboard suggested. He coaches youth hockey. Gradual hours planned.",
        sourceNoteIds: ["n3", "n4", "n6"],
        notes: ["Irrelevant coaching detail included.", "Specific hour phases and lifting limit missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please give him a certificate.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No graded plan detail for certificate.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "RTW purpose stated but plan lacks structure for GP action.",
      Content: "Irrelevant hockey detail included; phased hours not specified.",
      "Genre & Style": "Directive tone inappropriate for professional advice.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing ORIF timeline, hour phases, and five-kilogram lifting restriction.",
  }),

  // ── podiatry ────────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-pod-007-b",
    scenarioId: "w-pod-007",
    profession: "podiatry",
    title: "Ingrown toenail procedure summary",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 168,
    paragraphs: [
      {
        label: "Procedure confirmation",
        text: "Dear Dr Murphy,\n\nRe: Ms Fiona Walsh, aged 22 years\n\nI am writing to confirm that partial nail avulsion with phenolisation was performed today, 12 June 2026, for her ingrown hallux nail.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Procedure and indication confirmed.", "Patient identity clear."],
      },
      {
        label: "Anaesthesia & aftercare",
        text: "Local anaesthetic was used. A dressing was applied and walking is permitted. She should soak and redress the toe daily for three days. Review is arranged in one week.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Anaesthesia and wound care documented.", "Healing timeline stated."],
      },
      {
        label: "Advice & re-referral",
        text: "Antibiotics were not required and she has no diabetes. Please re-refer if recurrence or infection develops.\n\nYours sincerely,\n[Podiatrist name]",
        sourceNoteIds: ["n5"],
        notes: ["Antibiotic decision and re-referral criteria included."],
      },
    ],
    criterionComments: {
      Purpose: "Clear procedure confirmation reply to named GP.",
      Content: "All task bullets covered; camogie sport appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: ingrown toenail procedure summary with aftercare, review interval, and re-referral advice.",
  }),
  buildSample({
    id: "sample-pod-007-c",
    scenarioId: "w-pod-007",
    profession: "podiatry",
    title: "Weak example — ingrown toenail reply (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 152,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMs Walsh had nail surgery today.",
        sourceNoteIds: ["n1"],
        notes: ["GP not named.", "Procedure type not specified."],
      },
      {
        label: "Body (weak)",
        text: "Toe treated. Dressing on. She plays camogie competitively. Walking OK.",
        sourceNoteIds: ["n3", "n6"],
        notes: ["Irrelevant sport detail included.", "Soak regimen and review date missing."],
      },
      {
        label: "Closing (weak)",
        text: "Contact if problems.\n\nRegards",
        sourceNoteIds: [],
        notes: ["Re-referral criteria vague.", "Antibiotic decision not stated."],
      },
    ],
    criterionComments: {
      Purpose: "Reply purpose minimal; procedure detail insufficient.",
      Content: "Irrelevant sport included; phenolisation and daily soak advice omitted.",
      "Genre & Style": "Generic salutation; informal closing.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing phenolisation, soak regimen, one-week review, and re-referral criteria.",
  }),

  // ── optometry ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-opt-008-b",
    scenarioId: "w-opt-008",
    profession: "optometry",
    title: "Diabetic retinopathy screening referral",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 178,
    paragraphs: [
      {
        label: "Referral purpose",
        text: "Dear Dr Wu,\n\nRe: Mr Derek Jackson, aged 59 years\n\nI am writing to refer Mr Jackson for assessment of moderate non-proliferative diabetic retinopathy identified at his diabetic eye examination on 15 June 2026.",
        sourceNoteIds: ["n1", "n3"],
        notes: ["Referral reason and examination date clear.", "Ophthalmologist named."],
      },
      {
        label: "Findings & history",
        text: "Visual acuity is 6/9 in both eyes with no symptomatic change. Moderate NPDR is present bilaterally with microaneurysms and dot haemorrhages. He has had type 2 diabetes for twelve years with HbA1c 8.1%. OCT showed no macular oedema.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["VA, retinal findings, and diabetes history documented.", "OCT result included."],
      },
      {
        label: "Request",
        text: "I would be grateful if you could review him and advise on specialist monitoring and treatment plan.\n\nYours sincerely,\n[Optometrist name]",
        sourceNoteIds: ["n5"],
        notes: ["Specialist review and management plan requested."],
      },
    ],
    criterionComments: {
      Purpose: "Clear ophthalmology referral for moderate diabetic retinopathy.",
      Content: "All task bullets covered; retirement occupation appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: diabetic retinopathy referral with VA, findings, diabetes history, OCT, and management request.",
  }),
  buildSample({
    id: "sample-opt-008-c",
    scenarioId: "w-opt-008",
    profession: "optometry",
    title: "Weak example — diabetic retinopathy referral (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 162,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Specialist,\n\nMr Jackson needs eye review. He has diabetic eye changes.",
        sourceNoteIds: ["n1"],
        notes: ["Ophthalmologist not named.", "NPDR severity not stated."],
      },
      {
        label: "Body (weak)",
        text: "Vision OK. Retired postal worker. Diabetes long time. Some haemorrhages seen.",
        sourceNoteIds: ["n2", "n3", "n4", "n6"],
        notes: ["Irrelevant occupation included.", "VA, HbA1c, and OCT detail missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please see when you can.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No treatment plan request.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Referral purpose vague; specialist not addressed.",
      Content: "Irrelevant retirement detail included; HbA1c and OCT omitted.",
      "Genre & Style": "Too informal for specialist referral.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing VA, NPDR grade, HbA1c, OCT result, and structured management request.",
  }),

  // ── dietetics ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-diet-009-b",
    scenarioId: "w-diet-009",
    profession: "dietetics",
    title: "Renal diet counselling summary",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 182,
    paragraphs: [
      {
        label: "Purpose & CKD context",
        text: "Dear Dr Desai,\n\nRe: Mrs Claire O'Brien, aged 68 years\n\nI am writing to summarise dietary counselling for Mrs O'Brien with stage 4 chronic kidney disease, reviewed on 10 June 2026. Her eGFR is 22 mL/min and she is not yet on dialysis.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Purpose and CKD stage stated.", "Dialysis status documented."],
      },
      {
        label: "Recommendations",
        text: "Protein intake of 0.8 g per kilogram was recommended and low-potassium food choices were discussed. Fluid is limited to 1.2 litres per day and a daily weight chart has been provided. Phosphate binders should be taken with meals.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["Protein, potassium, and fluid advice documented.", "Phosphate binder timing included."],
      },
      {
        label: "Follow-up",
        text: "I will review her after any phosphate binder dose changes. Please contact me if renal parameters alter significantly.\n\nYours sincerely,\n[Dietitian name]",
        sourceNoteIds: ["n5"],
        notes: ["Dietetic review linked to medication changes.", "Nephrology coordination offered."],
      },
    ],
    criterionComments: {
      Purpose: "Clear CKD dietary summary for nephrology team.",
      Content: "All task bullets covered; grandchildren visits appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: stage 4 CKD dietary plan with protein, potassium, fluid, and phosphate binder guidance.",
  }),
  buildSample({
    id: "sample-diet-009-c",
    scenarioId: "w-diet-009",
    profession: "dietetics",
    title: "Weak example — renal diet summary (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 168,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Desai,\n\nMrs O'Brien has kidney disease. Diet advice given.",
        sourceNoteIds: ["n1"],
        notes: ["CKD stage and eGFR not stated.", "Purpose minimally expressed."],
      },
      {
        label: "Body (weak)",
        text: "Low potassium discussed. Fluid restricted. Grandchildren visit weekly. Binders with food.",
        sourceNoteIds: ["n3", "n4", "n5", "n6"],
        notes: ["Irrelevant family detail included.", "Protein target and weight chart omitted."],
      },
      {
        label: "Closing (weak)",
        text: "Review later if needed.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No review after binder dose changes.", "Vague follow-up."],
      },
    ],
    criterionComments: {
      Purpose: "Summary purpose vague; CKD context incomplete.",
      Content: "Irrelevant grandchildren detail included; protein recommendation missing.",
      "Organisation & Layout": "Telegraphic list without clear structure.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing eGFR, protein target, fluid volume, and binder review plan.",
  }),

  // ── radiography ───────────────────────────────────────────────────────────
  buildSample({
    id: "sample-rad-010-b",
    scenarioId: "w-rad-010",
    profession: "radiography",
    title: "MRI knee meniscal tear report",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 172,
    paragraphs: [
      {
        label: "Examination & question",
        text: "Dear Mr Greer,\n\nRe: Mr Sam Ahmed, aged 35 years\n\nI am writing with MRI knee findings for Mr Ahmed, performed without contrast on 9 June 2026. The clinical question was medial meniscal tear following a twisting injury.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Examination and clinical question stated.", "Orthopaedic surgeon addressed."],
      },
      {
        label: "Findings",
        text: "There is a horizontal tear of the posterior horn of the medial meniscus. The anterior cruciate ligament is intact. Mild joint effusion is present and there is no significant chondral defect.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["Meniscal, ligament, and effusion findings documented.", "Cartilage status included."],
      },
      {
        label: "Recommendation",
        text: "These findings should be correlated with clinical examination. I would be grateful for your management plan.\n\nYours sincerely,\n[Radiographer name]",
        sourceNoteIds: [],
        notes: ["Clinical correlation recommended.", "Appropriate closing to surgeon."],
      },
    ],
    criterionComments: {
      Purpose: "Clear MRI report reply with clinical correlation advice.",
      Content: "All task bullets covered; football occupation appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: MRI knee findings communicated with meniscal tear, ACL status, effusion, and correlation advice.",
  }),
  buildSample({
    id: "sample-rad-010-c",
    scenarioId: "w-rad-010",
    profession: "radiography",
    title: "Weak example — MRI knee report (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 158,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Surgeon,\n\nMRI done for knee pain.",
        sourceNoteIds: ["n1"],
        notes: ["Surgeon not named.", "Patient identity and clinical question missing."],
      },
      {
        label: "Body (weak)",
        text: "Meniscus tear seen. ACL OK. He is semi-professional footballer. Some fluid.",
        sourceNoteIds: ["n3", "n4", "n6"],
        notes: ["Irrelevant occupation included.", "Tear location and chondral status missing."],
      },
      {
        label: "Closing (weak)",
        text: "Hope this helps.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No clinical correlation advice.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Report purpose minimal; clinical question not stated.",
      Content: "Irrelevant football detail included; tear morphology omitted.",
      "Genre & Style": "Informal phrasing such as 'hope this helps'.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing patient identity, tear location, chondral status, and correlation advice.",
  }),

  // ── speech pathology ──────────────────────────────────────────────────────
  buildSample({
    id: "sample-sp-011-b",
    scenarioId: "w-sp-011",
    profession: "speech_pathology",
    title: "Paediatric language delay update",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 176,
    paragraphs: [
      {
        label: "Purpose & context",
        text: "Dear Dr O'Connor,\n\nRe: Noah Byrne, aged 4 years\n\nI am writing to summarise my speech pathology assessment of Noah on 14 June 2026 regarding expressive language delay.",
        sourceNoteIds: ["n1"],
        notes: ["Assessment purpose and child identity clear.", "GP named appropriately."],
      },
      {
        label: "Profile & plan",
        text: "Expressive language is below age expectations while receptive skills are stronger. Hearing screening was normal and no autism red flags were identified on screening. Parent coaching strategies include expansions, labelling, and reduced screen time. Block therapy of six sessions is planned with progress review at eight weeks.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["Language profile and hearing status documented.", "Home strategies and therapy plan included."],
      },
      {
        label: "GP review",
        text: "I would appreciate your review if regression or new red flags develop.\n\nYours sincerely,\n[Speech pathologist name]",
        sourceNoteIds: [],
        notes: ["GP review criteria for regression stated."],
      },
    ],
    criterionComments: {
      Purpose: "Clear GP update on paediatric language delay management.",
      Content: "All task bullets covered; sibling detail appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: paediatric language delay update with profile, hearing, strategies, therapy plan, and GP review advice.",
  }),
  buildSample({
    id: "sample-sp-011-c",
    scenarioId: "w-sp-011",
    profession: "speech_pathology",
    title: "Weak example — language delay update (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 162,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nNoah has speech delay. Assessment done.",
        sourceNoteIds: ["n1"],
        notes: ["GP not named.", "Expressive vs receptive profile missing."],
      },
      {
        label: "Body (weak)",
        text: "Talking behind peers. Hearing fine. Older sibling in school. Some therapy planned.",
        sourceNoteIds: ["n2", "n3", "n5", "n6"],
        notes: ["Irrelevant sibling detail included.", "Parent strategies and session count missing."],
      },
      {
        label: "Closing (weak)",
        text: "Call if worried.\n\nThanks",
        sourceNoteIds: [],
        notes: ["Regression red flags not specified.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Update purpose vague; developmental context incomplete.",
      Content: "Irrelevant sibling detail included; coaching strategies omitted.",
      "Genre & Style": "Too informal for GP correspondence.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing receptive profile, parent strategies, six-session plan, and regression advice.",
  }),

  // ── veterinary science ──────────────────────────────────────────────────────
  buildSample({
    id: "sample-vet-012-b",
    scenarioId: "w-vet-012",
    profession: "veterinary_science",
    title: "Chronic kidney disease monitoring",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 178,
    paragraphs: [
      {
        label: "Patient identification",
        text: "Dear Dr Holt,\n\nRe: Mittens, 14-year-old domestic shorthair cat, owner Mr Lee\n\nI am writing to summarise chronic kidney disease monitoring for Mittens, reviewed on 18 June 2026, and to outline the owner compliance plan.",
        sourceNoteIds: ["n1"],
        notes: ["Species, age, owner, and purpose stated.", "Referring veterinarian named."],
      },
      {
        label: "Renal parameters & treatment",
        text: "Creatinine is 280 µmol/L with urine specific gravity 1.018, consistent with IRIS stage 3. Systolic blood pressure was 165 mmHg and amlodipine 0.625 mg once daily has been started. Renal diet transition is underway; subcutaneous fluids were discussed but the owner declined.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Renal staging and BP documented.", "Diet and fluid plan with owner decision included."],
      },
      {
        label: "Recheck plan",
        text: "Recheck of renal profile and blood pressure is scheduled in four weeks. Please contact me if clinical deterioration occurs earlier.\n\nYours sincerely,\n[Veterinarian name]",
        sourceNoteIds: ["n5"],
        notes: ["Four-week recheck stated.", "Escalation advice included."],
      },
    ],
    criterionComments: {
      Purpose: "Clear CKD monitoring summary for referring clinic.",
      Content: "All task bullets covered; indoor-only status appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: feline CKD staging with BP management, diet plan, owner compliance, and four-week recheck.",
  }),
  buildSample({
    id: "sample-vet-012-c",
    scenarioId: "w-vet-012",
    profession: "veterinary_science",
    title: "Weak example — CKD monitoring (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 165,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Colleague,\n\nMittens the cat has kidney problems.",
        sourceNoteIds: ["n1"],
        notes: ["Referring vet not named.", "Age, species detail, and owner missing."],
      },
      {
        label: "Body (weak)",
        text: "Kidneys not great. Indoor-only cat. New diet started. Owner said no to fluids.",
        sourceNoteIds: ["n2", "n4", "n6"],
        notes: ["Irrelevant indoor status included.", "Creatinine, IRIS stage, and BP treatment missing."],
      },
      {
        label: "Closing (weak)",
        text: "Check again soon.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No four-week recheck.", "Escalation criteria vague."],
      },
    ],
    criterionComments: {
      Purpose: "Monitoring summary vague; patient identification incomplete.",
      Content: "Irrelevant indoor detail included; IRIS stage and amlodipine omitted.",
      "Genre & Style": "Colloquial phrasing such as 'kidneys not great'.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing creatinine, IRIS stage, BP treatment, and four-week recheck plan.",
  }),
];
