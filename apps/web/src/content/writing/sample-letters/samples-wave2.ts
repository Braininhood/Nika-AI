import { buildSample } from "./helpers";
import type { GradedSampleLetter } from "./types";

export const WAVE2_GRADED_SAMPLES: GradedSampleLetter[] = [
  // ── pharmacy ──────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-pharm-us-wave2-b",
    scenarioId: "w-pharm-us-wave2",
    profession: "pharmacy",
    title: "Statin myalgia counselling",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 178,
    paragraphs: [
      {
        label: "Opening & purpose",
        text: "Dear Dr Smith,\n\nRe: Mrs Rosa Gonzalez, aged 61 years\n\nI am writing regarding Mrs Gonzalez, who attended the pharmacy on 12 June 2026 for statin counselling. She reports muscle aches since starting rosuvastatin and I would appreciate your review of her lipid management.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Purpose and patient identity stated clearly.", "Links symptoms to statin initiation."],
      },
      {
        label: "Clinical findings",
        text: "Rosuvastatin 10 mg was commenced on 18 May 2026. She has experienced bilateral thigh ache for ten days. Creatine kinase was 420 U/L, mildly elevated. She denies dark urine or weakness.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["Dose, onset, and CK result documented.", "Relevant negatives included."],
      },
      {
        label: "Advice & request",
        text: "I advised her to hold the statin and to report immediately if weakness or urine changes develop. I would be grateful if you could review her within one week to reassess her lipid plan and consider an alternative agent.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n4", "n5"],
        notes: ["Temporary cessation and safety advice clear.", "Specific GP review timeframe requested."],
      },
    ],
    criterionComments: {
      Purpose: "Clear advice purpose with explicit request for GP review within one week.",
      Content: "All relevant clinical details included; recreational walking omitted.",
      "Genre & Style": "Appropriate formal advice letter to named GP.",
    },
    assessorSummary:
      "Likely Grade B: purpose clear, statin myalgia fully documented, appropriate cessation advice and GP review request.",
  }),
  buildSample({
    id: "sample-pharm-us-wave2-c",
    scenarioId: "w-pharm-us-wave2",
    profession: "pharmacy",
    title: "Weak example — statin myalgia (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 152,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMrs Gonzalez came to the pharmacy. She has some muscle problems with her cholesterol medicine.",
        sourceNoteIds: ["n1"],
        notes: ["Reader not named.", "Purpose vague; no explicit request."],
      },
      {
        label: "Body (weak)",
        text: "She takes rosuvastatin. Her legs hurt. She walks daily with a church group. Blood tests were done. I told her to stop the tablets.",
        sourceNoteIds: ["n2", "n4", "n6"],
        notes: ["Irrelevant social detail included.", "CK result and symptom onset missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please check her when you can.\n\nThanks",
        sourceNoteIds: [],
        notes: ["No one-week review timeframe.", "Informal closing."],
      },
    ],
    criterionComments: {
      Purpose: "Purpose unclear; no structured request for lipid reassessment.",
      Content: "Irrelevant church group included; CK and safety negatives omitted.",
      "Genre & Style": "Too informal for professional correspondence.",
    },
    assessorSummary:
      "Likely Grade C: compare with Grade B — missing CK, safety advice incomplete, irrelevant detail included.",
  }),

  buildSample({
    id: "sample-pharm-nz-wave2-b",
    scenarioId: "w-pharm-nz-wave2",
    profession: "pharmacy",
    title: "DOAC initiation counselling",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 172,
    paragraphs: [
      {
        label: "Opening & indication",
        text: "Dear Dr Williams,\n\nRe: Mr Raj Patel, aged 72 years\n\nI am writing to summarise my counselling of Mr Patel following dispensing of his first apixaban prescription on 14 June 2026 for atrial fibrillation.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Patient identity and indication confirmed.", "Purpose stated in opening."],
      },
      {
        label: "Counselling detail",
        text: "Apixaban 5 mg twice daily was prescribed; his eGFR is 58 mL/min. I counselled him to take doses with food and not to double missed doses. Bleeding red flags were reviewed and he was advised to avoid NSAIDs unless you agree.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Dose, renal function, and key safety points covered.", "NSAID caution appropriately documented."],
      },
      {
        label: "Follow-up",
        text: "A pill organiser was supplied to support adherence. I suggest renal function review in six months. Please contact me if further clarification is required.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n5"],
        notes: ["Adherence aid and monitoring recommendation included."],
      },
    ],
    criterionComments: {
      Purpose: "Documents DOAC counselling with clear advisory purpose.",
      Content: "All task bullets addressed; family location appropriately omitted.",
    },
    assessorSummary:
      "Likely Grade B: comprehensive DOAC counselling documented with dosing, safety, and monitoring advice.",
  }),
  buildSample({
    id: "sample-pharm-nz-wave2-c",
    scenarioId: "w-pharm-nz-wave2",
    profession: "pharmacy",
    title: "Weak example — DOAC counselling (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 148,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Williams,\n\nMr Patel got his new blood thinner today.",
        sourceNoteIds: ["n1"],
        notes: ["Indication not stated.", "Minimal professional context."],
      },
      {
        label: "Body (weak)",
        text: "Apixaban 5 mg BD. His son lives in Auckland. I told him about bleeding. He should take it properly. Kidneys need checking sometime.",
        sourceNoteIds: ["n2", "n4", "n6"],
        notes: ["Irrelevant family detail included.", "Food timing and missed-dose advice missing."],
      },
      {
        label: "Closing (weak)",
        text: "Let me know if needed.",
        sourceNoteIds: [],
        notes: ["No pill organiser or six-month renal review documented."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant detail included; adherence counselling incomplete.",
      "Conciseness & Clarity": "Fragmented note-dump style.",
    },
    assessorSummary:
      "Likely Grade C: incomplete counselling documentation with irrelevant family detail.",
  }),

  buildSample({
    id: "sample-pharm-ca-wave2-b",
    scenarioId: "w-pharm-ca-wave2",
    profession: "pharmacy",
    title: "Sertraline–St John's wort interaction",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 176,
    paragraphs: [
      {
        label: "Opening & reason",
        text: "Dear Dr Tremblay,\n\nRe: Ms Claire Dubois, aged 38 years\n\nI am writing following an OTC purchase review on 15 June 2026. I identified a potential herb–drug interaction risk for Ms Dubois, who takes sertraline 100 mg daily for anxiety.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Reason for contact and patient details clear.", "Current medication documented."],
      },
      {
        label: "Interaction & advice",
        text: "She had purchased St John's wort capsules for low mood. I advised her not to combine this product with sertraline and explained the risk of serotonin syndrome, including agitation, tremor, and fever. A refund was offered.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["OTC product and interaction risk explained.", "Counselling and refund documented."],
      },
      {
        label: "Request",
        text: "I encouraged GP review if her mood symptoms remain unchanged. I would appreciate your follow-up regarding her anxiety management.\n\nYours sincerely,\n[Pharmacist name]",
        sourceNoteIds: ["n5"],
        notes: ["GP follow-up request appropriate to task."],
      },
    ],
    criterionComments: {
      Purpose: "Alerts GP to interaction with clear advisory purpose.",
      Content: "Serotonin syndrome risk and counselling fully documented.",
    },
    assessorSummary:
      "Likely Grade B: interaction identified, patient counselled, GP alerted with appropriate follow-up request.",
  }),
  buildSample({
    id: "sample-pharm-ca-wave2-c",
    scenarioId: "w-pharm-ca-wave2",
    profession: "pharmacy",
    title: "Weak example — herb interaction (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 145,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMs Dubois bought some vitamins. She works as a school teacher.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant occupation included immediately.", "Interaction not identified in opening."],
      },
      {
        label: "Body (weak)",
        text: "She takes sertraline for anxiety. She wanted St John's wort. I said maybe don't mix them. She seemed upset.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["Serotonin syndrome symptoms not explained.", "Refund and specific advice missing."],
      },
      {
        label: "Closing (weak)",
        text: "Please see her.\n\nRegards",
        sourceNoteIds: [],
        notes: ["No request for mood follow-up if symptoms persist."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant occupation included; interaction risk poorly explained.",
      Purpose: "Alert purpose unclear; no structured GP follow-up request.",
    },
    assessorSummary:
      "Likely Grade C: weak interaction explanation, irrelevant detail, missing follow-up request.",
  }),

  // ── nursing ───────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-nurs-us-wave2-b",
    scenarioId: "w-nurs-us-wave2",
    profession: "nursing",
    title: "Fall prevention discharge handover",
    letterType: "discharge",
    estimatedOverall: "B",
    wordCount: 194,
    paragraphs: [
      {
        label: "Purpose & discharge",
        text: "Dear Ms Carter,\n\nRe: Mr James Washington, aged 79 years\n\nI am writing to hand over Mr Washington, who was discharged home today on 16 June 2026 following inpatient assessment after a fall at home.",
        sourceNoteIds: ["n1"],
        notes: ["Handover purpose and discharge date clear."],
      },
      {
        label: "Fall assessment & mobility",
        text: "He sustained a hip contusion only; X-ray confirmed no fracture. Gait remains unsteady. A rolling walker has been ordered and a physiotherapy referral placed. Bedtime zolpidem has been held pending Dr Smith's medication review.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Injuries, mobility plan, and medication hold documented.", "Assistive device and PT referral included."],
      },
      {
        label: "Monitoring plan",
        text: "Please arrange home visits three times weekly for two weeks. Report dizziness or any new falls urgently.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["Visit frequency and red-flag symptoms specified."],
      },
    ],
    criterionComments: {
      Purpose: "Clear discharge handover with monitoring expectations.",
      Content: "Fall event, mobility, medication review, and visit plan all included.",
    },
    assessorSummary:
      "Likely Grade B: safe community handover with fall details, mobility plan, and monitoring frequency.",
  }),
  buildSample({
    id: "sample-nurs-us-wave2-c",
    scenarioId: "w-nurs-us-wave2",
    profession: "nursing",
    title: "Weak example — fall discharge (Grade C)",
    letterType: "discharge",
    estimatedOverall: "C",
    wordCount: 158,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Nurse,\n\nMr Washington is going home. His daughter is the main caregiver.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant caregiver detail in opening.", "Fall context not summarised."],
      },
      {
        label: "Body (weak)",
        text: "He fell and hurt his hip. X-ray was OK. He needs a walker. Zolpidem stopped. He is a bit unsteady.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["PT referral and medication review pending not mentioned.", "Fragmented style."],
      },
      {
        label: "Closing (weak)",
        text: "Visit him sometimes. Call if worried.",
        sourceNoteIds: [],
        notes: ["No visit frequency or red-flag symptoms specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant caregiver detail; monitoring plan vague.",
      Purpose: "Handover purpose unclear; no structured monitoring request.",
    },
    assessorSummary:
      "Likely Grade C: missing visit frequency, red flags, and PT referral; irrelevant detail included.",
  }),

  buildSample({
    id: "sample-nurs-ie-wave2-b",
    scenarioId: "w-nurs-ie-wave2",
    profession: "nursing",
    title: "COPD exacerbation community handover",
    letterType: "transfer",
    estimatedOverall: "B",
    wordCount: 198,
    paragraphs: [
      {
        label: "Admission & status",
        text: "Dear Ms Kelly,\n\nRe: Mr Sean Doyle, aged 68 years\n\nI am writing regarding Mr Doyle, who is ready for discharge home on 17 June 2026 following admission for a COPD exacerbation. His SpO2 is 94% on room air.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Admission reason and current respiratory status documented."],
      },
      {
        label: "Treatment plan",
        text: "He will complete a prednisolone taper over five days. Please ensure he continues tiotropium and uses salbutamol as required; spacer technique was reviewed in hospital. A smoking cessation leaflet was provided and referral made to the HSE quit service.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Steroid taper, inhalers, and cessation support covered."],
      },
      {
        label: "Follow-up & red flags",
        text: "Dr O'Brien will review him in one week. Please advise him to attend the ED if he develops severe breathlessness or cyanosis.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["GP review and urgent symptoms clearly stated."],
      },
    ],
    criterionComments: {
      Purpose: "Community handover purpose clear with follow-up and safety advice.",
      Content: "Respiratory status, medications, smoking support, and red flags included.",
    },
    assessorSummary:
      "Likely Grade B: comprehensive COPD handover with treatment plan and urgent symptom guidance.",
  }),
  buildSample({
    id: "sample-nurs-ie-wave2-c",
    scenarioId: "w-nurs-ie-wave2",
    profession: "nursing",
    title: "Weak example — COPD handover (Grade C)",
    letterType: "transfer",
    estimatedOverall: "C",
    wordCount: 155,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Ms Kelly,\n\nMr Doyle has COPD and likes watching Gaelic football.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant leisure activity included.", "Discharge context missing."],
      },
      {
        label: "Body (weak)",
        text: "Oxygen OK. Steroids tapering. Inhalers same. He smokes sometimes. Spacer shown.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["HSE quit referral not mentioned.", "SpO2 value omitted."],
      },
      {
        label: "Closing (weak)",
        text: "GP to see him. ED if bad breathing.",
        sourceNoteIds: ["n5"],
        notes: ["One-week review timeframe missing.", "Red flags vaguely stated."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant TV hobby included; cessation referral and SpO2 missing.",
      "Conciseness & Clarity": "Telegraphic note-dump without professional structure.",
    },
    assessorSummary:
      "Likely Grade C: incomplete handover with irrelevant detail and vague follow-up.",
  }),

  buildSample({
    id: "sample-nurs-nz-wave2-b",
    scenarioId: "w-nurs-nz-wave2",
    profession: "nursing",
    title: "Anticoagulation bridging post TKR",
    letterType: "discharge",
    estimatedOverall: "B",
    wordCount: 192,
    paragraphs: [
      {
        label: "Surgery & wound",
        text: "Dear Mr Hughes,\n\nRe: Mrs Helen Thompson, aged 71 years\n\nI am writing regarding Mrs Thompson on post-operative day 4 following total knee replacement on 18 June 2026. Her wound is dry and she is mobilising with a frame.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Surgery date, wound status, and mobility documented."],
      },
      {
        label: "Anticoagulation plan",
        text: "DVT prophylaxis continues with enoxaparin 40 mg subcutaneously daily until her INR is therapeutic. Warfarin was restarted yesterday and she has an INR clinic appointment on Friday. She and her husband were taught injection technique; Dr Williams has been notified.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["Bridging regimen, warfarin restart, and teaching documented."],
      },
      {
        label: "Urgent contact",
        text: "Please contact the orthopaedic team or GP urgently if she develops calf pain, sudden breathlessness, or wound complications.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["Urgent contact criteria stated for community nurse."],
      },
    ],
    criterionComments: {
      Purpose: "Clear anticoagulation bridging handover to district nurse.",
      Content: "Surgery, wound, enoxaparin, warfarin, and injection teaching all covered.",
    },
    assessorSummary:
      "Likely Grade B: post-TKR handover with complete anticoagulation bridging plan.",
  }),
  buildSample({
    id: "sample-nurs-nz-wave2-c",
    scenarioId: "w-nurs-nz-wave2",
    profession: "nursing",
    title: "Weak example — TKR anticoagulation (Grade C)",
    letterType: "discharge",
    estimatedOverall: "C",
    wordCount: 150,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Mr Hughes,\n\nMrs Thompson had knee surgery. She was a librarian.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant occupation included.", "Surgery day and wound status missing."],
      },
      {
        label: "Body (weak)",
        text: "Wound OK. Walking with frame. Blood thinner injections daily. Warfarin started. INR check Friday.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Enoxaparin dose not specified.", "Injection teaching not documented."],
      },
      {
        label: "Closing (weak)",
        text: "Call doctor if problems.",
        sourceNoteIds: [],
        notes: ["No specific urgent symptoms listed."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant occupation; injection teaching and dose details missing.",
      Purpose: "Handover purpose vague; urgent criteria not specified.",
    },
    assessorSummary:
      "Likely Grade C: incomplete anticoagulation handover with irrelevant detail.",
  }),

  buildSample({
    id: "sample-nurs-ca-wave2-b",
    scenarioId: "w-nurs-ca-wave2",
    profession: "nursing",
    title: "Postpartum mood screening handover",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 188,
    paragraphs: [
      {
        label: "Screening result",
        text: "Dear Dr Tremblay,\n\nRe: Ms Isabelle Lavoie, aged 29 years\n\nI am writing regarding Ms Lavoie on postpartum day 3, identified on 19 June 2026 with an elevated Edinburgh Postnatal Depression Scale score of 16.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Screening result and gestational context stated.", "Purpose clear in opening."],
      },
      {
        label: "Assessment & safety",
        text: "She reports tearfulness, poor sleep, and intrusive guilt. Breastfeeding is established and her infant is well; her partner is supportive. No self-harm was disclosed. A safety plan and crisis line number were provided.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Mood symptoms, infant feeding, and safety assessment documented."],
      },
      {
        label: "Referral request",
        text: "Referral to community maternal mental health has been initiated. I would be grateful for urgent GP follow-up within seven days.\n\nYours sincerely,\n[Nurse name]",
        sourceNoteIds: ["n5"],
        notes: ["Referral and one-week GP review request clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear referral with urgent GP follow-up request.",
      Content: "EPDS score, symptoms, safety, and support plan all included.",
    },
    assessorSummary:
      "Likely Grade B: postpartum mood concern documented with safety assessment and urgent referral.",
  }),
  buildSample({
    id: "sample-nurs-ca-wave2-c",
    scenarioId: "w-nurs-ca-wave2",
    profession: "nursing",
    title: "Weak example — postpartum mood (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 148,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Doctor,\n\nMs Lavoie is sad after having her baby. She plans to return to work in ten months.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant work plans included.", "EPDS score not stated."],
      },
      {
        label: "Body (weak)",
        text: "She cries a lot and doesn't sleep. Baby is fine. Partner helps. No suicide thoughts.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Safety plan and crisis line not mentioned.", "Intrusive guilt omitted."],
      },
      {
        label: "Closing (weak)",
        text: "Please see her soon.",
        sourceNoteIds: [],
        notes: ["No seven-day timeframe or maternal mental health referral."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant work plans; EPDS score and referral missing.",
      Purpose: "Urgent follow-up request not specified.",
    },
    assessorSummary:
      "Likely Grade C: weak referral without screening score, safety plan, or timeframe.",
  }),

  // ── medicine ──────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-med-ie-wave2-b",
    scenarioId: "w-med-ie-wave2",
    profession: "medicine",
    title: "New AF anticoagulation plan",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 184,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr O'Brien,\n\nRe: Mr Patrick Keane, aged 74 years\n\nThank you for referring Mr Keane, whom I assessed on 11 June 2026 for newly detected atrial fibrillation on opportunistic pulse check.",
        sourceNoteIds: ["n1"],
        notes: ["Referral acknowledged; diagnosis context clear."],
      },
      {
        label: "Findings & risk",
        text: "ECG confirmed atrial fibrillation with controlled rate. Echocardiography showed mild left ventricular hypertrophy only. His CHA2DS2-VASc score is 3 and HAS-BLED score is 1. Apixaban 5 mg twice daily was commenced.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["ECG, echo, and risk scores documented.", "Anticoagulation choice stated."],
      },
      {
        label: "Plan",
        text: "Alcohol reduction and weight management were discussed. I will review him in four weeks with repeat ECG and renal function.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: ["n4", "n5"],
        notes: ["Lifestyle advice and follow-up interval included."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply with diagnosis confirmation and management plan.",
      Content: "Risk scores, anticoagulation, lifestyle, and follow-up all covered.",
    },
    assessorSummary:
      "Likely Grade B: comprehensive AF reply with risk stratification and anticoagulation plan.",
  }),
  buildSample({
    id: "sample-med-ie-wave2-c",
    scenarioId: "w-med-ie-wave2",
    profession: "medicine",
    title: "Weak example — new AF (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMr Keane has an irregular heartbeat. He plays golf.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant hobby included.", "Referral not acknowledged."],
      },
      {
        label: "Body (weak)",
        text: "ECG showed AF. Echo OK mostly. Started blood thinner. Told him to drink less.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Risk scores not documented.", "Drug name and dose missing."],
      },
      {
        label: "Closing (weak)",
        text: "See him again later.",
        sourceNoteIds: [],
        notes: ["Four-week review and repeat tests not specified."],
      },
    ],
    criterionComments: {
      Content: "Risk scores omitted; irrelevant golf detail included.",
      Purpose: "Reply structure weak; follow-up plan vague.",
    },
    assessorSummary:
      "Likely Grade C: missing risk scores, anticoagulation details, and follow-up interval.",
  }),

  buildSample({
    id: "sample-med-nz-wave2-b",
    scenarioId: "w-med-nz-wave2",
    profession: "medicine",
    title: "Acute gout flare management",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 182,
    paragraphs: [
      {
        label: "Presentation",
        text: "Dear Dr Williams,\n\nRe: Ms Fiona Morrison, aged 52 years\n\nI reviewed Ms Morrison on 13 June 2026 for an acute gout flare affecting the right first metatarsophalangeal joint, which was hot and swollen. Serum urate was 0.52 mmol/L.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Presentation and examination findings documented."],
      },
      {
        label: "Acute treatment",
        text: "Colchicine 500 micrograms twice daily for three days was prescribed. Naproxen was avoided due to chronic kidney disease stage 2.",
        sourceNoteIds: ["n3"],
        notes: ["Acute treatment and CKD contraindication explained."],
      },
      {
        label: "Long-term plan",
        text: "Allopurinol 100 mg will commence after the flare settles, with colchicine prophylaxis for three months. Beer intake reduction and weight loss were discussed. I will review serum urate in six weeks.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: ["n4", "n5"],
        notes: ["Urate-lowering strategy and lifestyle advice included."],
      },
    ],
    criterionComments: {
      Purpose: "Clear GP update on acute and long-term gout management.",
      Content: "Acute treatment, CKD consideration, urate-lowering, and follow-up covered.",
    },
    assessorSummary:
      "Likely Grade B: gout flare managed with appropriate acute treatment and urate-lowering plan.",
  }),
  buildSample({
    id: "sample-med-nz-wave2-c",
    scenarioId: "w-med-nz-wave2",
    profession: "medicine",
    title: "Weak example — acute gout (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 138,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Williams,\n\nMs Morrison has gout. She travels to Fiji every year.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant travel detail included.", "Joint and urate level missing."],
      },
      {
        label: "Body (weak)",
        text: "Big toe swollen. Colchicine given. Allopurinol later maybe.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Naproxen avoidance reason not stated.", "Prophylaxis duration missing."],
      },
      {
        label: "Closing (weak)",
        text: "Lifestyle advice given. Follow up sometime.",
        sourceNoteIds: ["n5"],
        notes: ["Six-week urate review not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant travel; CKD contraindication and prophylaxis omitted.",
      "Conciseness & Clarity": "Vague plan without specific follow-up.",
    },
    assessorSummary:
      "Likely Grade C: incomplete gout management with irrelevant detail and vague follow-up.",
  }),

  buildSample({
    id: "sample-med-ca-wave2-b",
    scenarioId: "w-med-ca-wave2",
    profession: "medicine",
    title: "Pre-operative medical clearance",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 190,
    paragraphs: [
      {
        label: "Purpose & procedure",
        text: "Dear Dr Tremblay,\n\nRe: Mr Marc Bergeron, aged 66 years\n\nI am writing to provide pre-operative medical clearance for Mr Bergeron's planned total hip arthroplasty on 2 July 2026 for osteoarthritis. His BMI is 29.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Purpose, procedure date, and indication stated."],
      },
      {
        label: "Assessment",
        text: "ECG was normal and he achieves greater than four metabolic equivalents. Mild COPD is stable on tiotropium. Aspirin should be held seven days pre-operatively per your surgical protocol; inhalers should continue.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Cardiac, pulmonary, and medication adjustments documented."],
      },
      {
        label: "Clearance",
        text: "He is cleared for surgery. I recommend post-operative DVT prophylaxis and early physiotherapy.\n\nYours sincerely,\n[Doctor name]",
        sourceNoteIds: ["n5"],
        notes: ["Fitness confirmed with rehab recommendations."],
      },
    ],
    criterionComments: {
      Purpose: "Clear pre-operative clearance with procedure date.",
      Content: "Cardiac, pulmonary assessment, medication hold, and clearance included.",
    },
    assessorSummary:
      "Likely Grade B: complete pre-operative clearance with medication adjustments and rehab advice.",
  }),
  buildSample({
    id: "sample-med-ca-wave2-c",
    scenarioId: "w-med-ca-wave2",
    profession: "medicine",
    title: "Weak example — pre-op clearance (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 145,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Tremblay,\n\nMr Bergeron needs hip surgery. He speaks French at home.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant language detail included.", "Procedure date missing."],
      },
      {
        label: "Body (weak)",
        text: "Heart OK. Lungs a bit bad. Stop aspirin. Inhalers fine. BMI 29.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["METs and aspirin hold duration not specified.", "COPD stability not described."],
      },
      {
        label: "Closing (weak)",
        text: "He can have surgery.",
        sourceNoteIds: ["n5"],
        notes: ["DVT prophylaxis and physio recommendations missing."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant language detail; aspirin hold duration and rehab omitted.",
      Purpose: "Clearance stated but supporting detail insufficient.",
    },
    assessorSummary:
      "Likely Grade C: incomplete clearance letter with vague medication and rehab advice.",
  }),

  // ── dentistry ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-dent-us-wave2-b",
    scenarioId: "w-dent-us-wave2",
    profession: "dentistry",
    title: "Dental abscess antibiotic stewardship",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 182,
    paragraphs: [
      {
        label: "Referral reason",
        text: "Dear Dr Smith,\n\nRe: Ms Carmen Rivera, aged 34 years\n\nI am referring Ms Rivera for urgent surgical assessment of a persistent mandibular abscess seen on 10 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Urgent referral purpose stated immediately."],
      },
      {
        label: "Examination & prior treatment",
        text: "She has had swelling in the lower right quadrant for five days with fever of 38.1°C yesterday. Periapical radiograph shows a periapical abscess at LR6 with incomplete root canal treatment. Amoxicillin 500 mg three times daily for five days was completed with only partial improvement.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Symptoms, radiograph, and antibiotic course documented."],
      },
      {
        label: "Medical history & request",
        text: "She has no penicillin allergy and mild controlled asthma. I would be grateful for urgent drainage and further management.\n\nYours sincerely,\n[Dentist name]",
        sourceNoteIds: ["n5"],
        notes: ["Allergy status and urgent request included."],
      },
    ],
    criterionComments: {
      Purpose: "Urgent surgical referral clearly stated.",
      Content: "Examination, radiograph, antibiotics, and medical history covered.",
    },
    assessorSummary:
      "Likely Grade B: urgent referral for unresolved abscess with complete clinical documentation.",
  }),
  buildSample({
    id: "sample-dent-us-wave2-c",
    scenarioId: "w-dent-us-wave2",
    profession: "dentistry",
    title: "Weak example — dental abscess (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 148,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMs Rivera has a tooth problem. She is studying dental hygiene.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant occupation included.", "Urgency not conveyed."],
      },
      {
        label: "Body (weak)",
        text: "Swelling and fever. X-ray bad tooth. Antibiotics done. Asthma.",
        sourceNoteIds: ["n2", "n3", "n4", "n5"],
        notes: ["Quadrant, duration, and allergy status vague.", "Incomplete root canal not mentioned."],
      },
      {
        label: "Closing (weak)",
        text: "Please see her when possible.",
        sourceNoteIds: [],
        notes: ["No urgent surgical assessment requested."],
      },
    ],
    criterionComments: {
      Purpose: "Urgent referral purpose unclear.",
      Content: "Irrelevant occupation; radiograph and antibiotic details incomplete.",
    },
    assessorSummary:
      "Likely Grade C: weak referral without urgency, incomplete clinical detail.",
  }),

  buildSample({
    id: "sample-dent-ie-wave2-b",
    scenarioId: "w-dent-ie-wave2",
    profession: "dentistry",
    title: "TMJ dysfunction conservative plan",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 174,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr O'Brien,\n\nRe: Mr Conor Walsh, aged 42 years\n\nThank you for referring Mr Walsh for assessment of temporomandibular joint dysfunction. I reviewed him on 12 June 2026 for jaw pain and clicking.",
        sourceNoteIds: ["n1"],
        notes: ["Referral acknowledged; presenting complaint stated."],
      },
      {
        label: "Findings & management",
        text: "Examination revealed unilateral pre-auricular pain with clicking on opening but no locking. A soft occlusal splint was fitted for night-time wear. He was advised on soft diet, jaw rest, warm compresses, and paracetamol as required.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Examination findings and conservative plan documented."],
      },
      {
        label: "Review plan",
        text: "I will review him in six weeks. Please re-refer to maxillofacial surgery if symptoms worsen or trismus develops.\n\nYours sincerely,\n[Dentist name]",
        sourceNoteIds: ["n5"],
        notes: ["Review interval and re-referral criteria clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply documenting conservative TMJ management.",
      Content: "Examination, splint, self-care, and review plan all included.",
    },
    assessorSummary:
      "Likely Grade B: comprehensive TMJ reply with splint plan and re-referral criteria.",
  }),
  buildSample({
    id: "sample-dent-ie-wave2-c",
    scenarioId: "w-dent-ie-wave2",
    profession: "dentistry",
    title: "Weak example — TMJ dysfunction (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 140,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMr Walsh has jaw pain. He plays hurling.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant sport included.", "Referral not acknowledged."],
      },
      {
        label: "Body (weak)",
        text: "Clicking jaw. Splint made. Soft food advised. Pain tablets OK.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Pre-auricular location and locking status missing.", "Splint wear schedule vague."],
      },
      {
        label: "Closing (weak)",
        text: "Review later. Refer if worse.",
        sourceNoteIds: ["n5"],
        notes: ["Six-week interval and trismus criterion not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant sport; examination detail and review interval vague.",
      Purpose: "Reply structure weak without clear management summary.",
    },
    assessorSummary:
      "Likely Grade C: incomplete TMJ reply with irrelevant detail and vague follow-up.",
  }),

  // ── physiotherapy ─────────────────────────────────────────────────────────
  buildSample({
    id: "sample-phys-us-wave2-b",
    scenarioId: "w-phys-us-wave2",
    profession: "physiotherapy",
    title: "Rotator cuff tendinopathy reply",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 186,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr Smith,\n\nRe: Mr David Johnson, aged 48 years\n\nThank you for referring Mr Johnson, whom I assessed on 9 June 2026 for subacromial shoulder pain present for eight weeks without red flags.",
        sourceNoteIds: ["n1", "n3"],
        notes: ["Referral acknowledged; duration and red-flag status stated."],
      },
      {
        label: "Objective findings",
        text: "Painful arc was positive and supraspinatus weakness was grade 4/5. There was no night pain or neurological signs; ultrasound has not yet been performed.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["Key examination findings documented.", "Imaging status noted."],
      },
      {
        label: "Programme & review",
        text: "A scapular stability and isometric loading programme has commenced. I will review him in four weeks and arrange imaging if there is no improvement.\n\nYours sincerely,\n[Physiotherapist name]",
        sourceNoteIds: ["n4", "n5"],
        notes: ["Rehab plan and review timeline clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply with rehab plan and review expectations.",
      Content: "Findings, programme, and imaging criteria all covered.",
    },
    assessorSummary:
      "Likely Grade B: rotator cuff reply with objective findings and progressive loading plan.",
  }),
  buildSample({
    id: "sample-phys-us-wave2-c",
    scenarioId: "w-phys-us-wave2",
    profession: "physiotherapy",
    title: "Weak example — rotator cuff (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMr Johnson has shoulder pain. He coaches baseball.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant occupation included.", "Referral and duration not acknowledged."],
      },
      {
        label: "Body (weak)",
        text: "Painful movement. Weak muscle. Exercises started.",
        sourceNoteIds: ["n2", "n4"],
        notes: ["Painful arc and weakness grade not specified.", "Red flags and imaging plan missing."],
      },
      {
        label: "Closing (weak)",
        text: "See him again if needed.",
        sourceNoteIds: [],
        notes: ["Four-week review not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant coaching detail; objective findings vague.",
      Purpose: "Reply lacks structured findings and review plan.",
    },
    assessorSummary:
      "Likely Grade C: weak reply with vague findings and no review timeline.",
  }),

  buildSample({
    id: "sample-phys-ie-wave2-b",
    scenarioId: "w-phys-ie-wave2",
    profession: "physiotherapy",
    title: "Post-stroke shoulder subluxation",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 192,
    paragraphs: [
      {
        label: "Context",
        text: "Dear Dr O'Brien,\n\nRe: Mrs Maeve Byrne, aged 70 years\n\nI am writing regarding physiotherapy management of Mrs Byrne's painful shoulder subluxation in post-stroke week 4, assessed on 11 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Stroke timeline and presenting problem stated."],
      },
      {
        label: "Assessment & programme",
        text: "She has left hemiplegia with shoulder subluxation confirmed on X-ray and pain rated 6/10. A support sling is used for transfers only and not worn at rest. A gentle range-of-motion programme with electrical stimulation has commenced.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Assessment, pain score, sling use, and therapy documented."],
      },
      {
        label: "Analgesia request",
        text: "I would appreciate review of her paracetamol dose if pain persists above 5/10 and limits therapy participation.\n\nYours sincerely,\n[Physiotherapist name]",
        sourceNoteIds: ["n5"],
        notes: ["Analgesia review threshold clearly stated."],
      },
    ],
    criterionComments: {
      Purpose: "Clear advice on hemiplegic shoulder management with analgesia request.",
      Content: "Stroke timeline, assessment, positioning, and exercise programme covered.",
    },
    assessorSummary:
      "Likely Grade B: hemiplegic shoulder management documented with appropriate analgesia request.",
  }),
  buildSample({
    id: "sample-phys-ie-wave2-c",
    scenarioId: "w-phys-ie-wave2",
    profession: "physiotherapy",
    title: "Weak example — shoulder subluxation (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 148,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMrs Byrne had a stroke. She was a school principal.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant former occupation included.", "Shoulder problem not stated."],
      },
      {
        label: "Body (weak)",
        text: "Weak left side. Shoulder hurts. Sling sometimes. Exercises done.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Pain score and subluxation confirmation missing.", "Sling use guidance vague."],
      },
      {
        label: "Closing (weak)",
        text: "More pain relief maybe needed.",
        sourceNoteIds: ["n5"],
        notes: ["No specific pain threshold for analgesia review."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant occupation; pain score and sling protocol incomplete.",
      Purpose: "Advice purpose vague; analgesia request imprecise.",
    },
    assessorSummary:
      "Likely Grade C: incomplete shoulder management with irrelevant detail.",
  }),

  // ── occupational therapy ──────────────────────────────────────────────────
  buildSample({
    id: "sample-ot-us-wave2-b",
    scenarioId: "w-ot-us-wave2",
    profession: "occupational_therapy",
    title: "Dementia home safety assessment",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 196,
    paragraphs: [
      {
        label: "Context",
        text: "Dear Dr Smith,\n\nRe: Mr Robert Henderson, aged 76 years\n\nI am writing to summarise my home safety assessment on 13 June 2026 for Mr Henderson, who has early Alzheimer's disease with MMSE 22/30 and lives with his wife.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Cognitive status and living arrangement documented."],
      },
      {
        label: "Modifications",
        text: "A stove auto-shutoff device was installed and a medication blister pack set up. Grab rails were fitted in the bathroom and clutter was removed from the stairs.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Hazards identified and modifications made."],
      },
      {
        label: "Recommendations",
        text: "I recommend GP review of driving suitability and medication adherence. I will conduct an occupational therapy review in eight weeks.\n\nYours sincerely,\n[Occupational therapist name]",
        sourceNoteIds: ["n5"],
        notes: ["Driving assessment and review interval recommended."],
      },
    ],
    criterionComments: {
      Purpose: "Clear home safety summary with GP recommendations.",
      Content: "Cognitive status, hazards, modifications, and driving review covered.",
    },
    assessorSummary:
      "Likely Grade B: dementia home safety assessment with modifications and GP recommendations.",
  }),
  buildSample({
    id: "sample-ot-us-wave2-c",
    scenarioId: "w-ot-us-wave2",
    profession: "occupational_therapy",
    title: "Weak example — dementia home safety (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 152,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMr Henderson has memory problems. He likes woodworking.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant hobby included.", "MMSE and living arrangement missing."],
      },
      {
        label: "Body (weak)",
        text: "Home visit done. Kitchen safer. Pills organised. Bathroom rails. Stairs tidied.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Specific modifications vague.", "Carer education not mentioned."],
      },
      {
        label: "Closing (weak)",
        text: "Check his driving. Review later.",
        sourceNoteIds: ["n5"],
        notes: ["Eight-week review interval not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant woodworking; cognitive score and modifications incomplete.",
      Purpose: "Summary purpose weak without structured recommendations.",
    },
    assessorSummary:
      "Likely Grade C: incomplete home safety summary with irrelevant detail.",
  }),

  buildSample({
    id: "sample-ot-ie-wave2-b",
    scenarioId: "w-ot-ie-wave2",
    profession: "occupational_therapy",
    title: "Post carpal tunnel release rehab",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 184,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr O'Brien,\n\nRe: Ms Aoife Kelly, aged 44 years\n\nThank you for referring Ms Kelly for occupational therapy following carpal tunnel release two weeks ago. I reviewed her on 14 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Procedure timeline and referral acknowledged."],
      },
      {
        label: "Progress & restrictions",
        text: "Night pain has resolved and she has mild pillar pain; sutures were removed. Scar desensitisation and tendon gliding exercises were taught. Light desk work is permitted with no heavy lifting above 2 kg for four weeks.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Symptoms, scar management, and activity restrictions documented."],
      },
      {
        label: "Discharge plan",
        text: "I anticipate discharge in two weeks if grip strength continues to progress.\n\nYours sincerely,\n[Occupational therapist name]",
        sourceNoteIds: ["n5"],
        notes: ["Discharge criteria clearly stated."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply documenting post-surgical hand therapy progress.",
      Content: "Procedure date, symptoms, exercises, restrictions, and discharge plan covered.",
    },
    assessorSummary:
      "Likely Grade B: post-CTR reply with graded activity programme and discharge timeline.",
  }),
  buildSample({
    id: "sample-ot-ie-wave2-c",
    scenarioId: "w-ot-ie-wave2",
    profession: "occupational_therapy",
    title: "Weak example — carpal tunnel rehab (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 138,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMs Kelly had hand surgery. She is an admin assistant.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant occupation included.", "Procedure date and referral not acknowledged."],
      },
      {
        label: "Body (weak)",
        text: "Hand better. Exercises given. Can work a bit. No heavy stuff.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["Night pain resolution and weight limit not specified.", "Scar management omitted."],
      },
      {
        label: "Closing (weak)",
        text: "Discharge soon maybe.",
        sourceNoteIds: ["n5"],
        notes: ["Grip strength criterion for discharge not stated."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant occupation; scar management and restrictions vague.",
      Purpose: "Reply lacks structured progress summary.",
    },
    assessorSummary:
      "Likely Grade C: incomplete post-CTR reply with vague restrictions and discharge plan.",
  }),

  // ── podiatry ──────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-pod-us-wave2-b",
    scenarioId: "w-pod-us-wave2",
    profession: "podiatry",
    title: "Plantar fasciitis orthotic plan",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 172,
    paragraphs: [
      {
        label: "Acknowledgement",
        text: "Dear Dr Smith,\n\nRe: Mr Michael Davis, aged 45 years\n\nThank you for referring Mr Davis for chronic plantar heel pain consistent with plantar fasciitis, assessed on 10 June 2026 after four months of symptoms.",
        sourceNoteIds: ["n1"],
        notes: ["Referral acknowledged; symptom duration stated."],
      },
      {
        label: "Assessment & treatment",
        text: "He reports first-step pain with tenderness at the medial calcaneal tubercle. Moderate pes planus was noted and custom foot orthoses have been ordered. Calf stretching and night splint use were discussed.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Biomechanical findings and treatment plan documented."],
      },
      {
        label: "Review",
        text: "I will review him in six weeks and arrange imaging if there is no improvement.\n\nYours sincerely,\n[Podiatrist name]",
        sourceNoteIds: ["n5"],
        notes: ["Review interval and re-referral criteria clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear reply with plantar fasciitis management plan.",
      Content: "Symptom pattern, assessment, orthoses, and stretching programme covered.",
    },
    assessorSummary:
      "Likely Grade B: plantar fasciitis reply with orthotic prescription and review plan.",
  }),
  buildSample({
    id: "sample-pod-us-wave2-c",
    scenarioId: "w-pod-us-wave2",
    profession: "podiatry",
    title: "Weak example — plantar fasciitis (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 135,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMr Davis has heel pain. He runs marathons.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant running detail included.", "Symptom duration missing."],
      },
      {
        label: "Body (weak)",
        text: "Heel sore in morning. Flat feet. Orthotics ordered. Stretching advised.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Tenderness site and night splint not mentioned.", "Assessment detail vague."],
      },
      {
        label: "Closing (weak)",
        text: "Follow up later.",
        sourceNoteIds: [],
        notes: ["Six-week review and imaging criteria missing."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant marathon detail; assessment and review plan incomplete.",
      Purpose: "Reply structure weak without clear management summary.",
    },
    assessorSummary:
      "Likely Grade C: incomplete plantar fasciitis reply with irrelevant detail.",
  }),

  // ── optometry ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-opt-ie-wave2-b",
    scenarioId: "w-opt-ie-wave2",
    profession: "optometry",
    title: "Dry AMD monitoring referral",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 176,
    paragraphs: [
      {
        label: "Referral reason",
        text: "Dear Dr O'Brien,\n\nRe: Mrs Sheila Murphy, aged 74 years\n\nI am referring Mrs Murphy for specialist monitoring of dry age-related macular degeneration following routine macular review on 15 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Referral purpose and patient identity clear."],
      },
      {
        label: "Findings",
        text: "Visual acuity is 6/12 in both eyes with mild metamorphopsia in the left eye. OCT showed drusen with retinal pigment epithelium changes and no fluid, consistent with dry AMD. She is an ex-smoker and AREDS2 supplements were commenced.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Acuity, OCT, and smoking status documented."],
      },
      {
        label: "Request",
        text: "Amsler grid testing revealed distortion and I would be grateful for your macular service monitoring plan.\n\nYours sincerely,\n[Optometrist name]",
        sourceNoteIds: ["n5"],
        notes: ["Amsler result and specialist monitoring request included."],
      },
    ],
    criterionComments: {
      Purpose: "Clear AMD referral with monitoring request.",
      Content: "Acuity, OCT, smoking, supplements, and Amsler result covered.",
    },
    assessorSummary:
      "Likely Grade B: dry AMD referral with complete examination findings and monitoring request.",
  }),
  buildSample({
    id: "sample-opt-ie-wave2-c",
    scenarioId: "w-opt-ie-wave2",
    profession: "optometry",
    title: "Weak example — dry AMD (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMrs Murphy has eye problems. She knits for charity.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant hobby included.", "AMD diagnosis not stated."],
      },
      {
        label: "Body (weak)",
        text: "Vision not great. OCT scan done. Smoked before. Vitamins started.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Acuity values and metamorphopsia missing.", "Dry AMD classification vague."],
      },
      {
        label: "Closing (weak)",
        text: "Please monitor her eyes.",
        sourceNoteIds: [],
        notes: ["Amsler grid result not documented."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant knitting; OCT findings and Amsler result incomplete.",
      Purpose: "Referral reason vague; monitoring plan not requested.",
    },
    assessorSummary:
      "Likely Grade C: weak AMD referral with incomplete findings and irrelevant detail.",
  }),

  buildSample({
    id: "sample-opt-nz-wave2-b",
    scenarioId: "w-opt-nz-wave2",
    profession: "optometry",
    title: "Contact lens keratitis referral",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 180,
    paragraphs: [
      {
        label: "Urgent referral",
        text: "Dear Dr Williams,\n\nRe: Ms Amy Chen, aged 26 years\n\nI am referring Ms Chen for same-day urgent ophthalmology assessment of suspected contact lens-related keratitis, seen on 16 June 2026.",
        sourceNoteIds: ["n1", "n5"],
        notes: ["Urgency and diagnosis stated immediately."],
      },
      {
        label: "History & examination",
        text: "She wears daily disposable lenses and slept in them two nights ago. Visual acuity in the right eye is 6/18 with a central corneal infiltrate and fluorescein uptake. Lenses were removed and topical antibiotic commenced pending specialist review.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Lens history, examination, and interim treatment documented."],
      },
      {
        label: "Safety advice",
        text: "She was warned regarding risk of vision loss. I would be grateful for your urgent assessment today.\n\nYours sincerely,\n[Optometrist name]",
        sourceNoteIds: ["n5"],
        notes: ["Vision loss warning and same-day request included."],
      },
    ],
    criterionComments: {
      Purpose: "Urgent same-day referral clearly stated.",
      Content: "Lens history, examination, interim treatment, and safety warning covered.",
    },
    assessorSummary:
      "Likely Grade B: urgent keratitis referral with complete examination and safety documentation.",
  }),
  buildSample({
    id: "sample-opt-nz-wave2-c",
    scenarioId: "w-opt-nz-wave2",
    profession: "optometry",
    title: "Weak example — lens keratitis (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 145,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Williams,\n\nMs Chen has a red eye. She is a university student.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant student status included.", "Urgency not conveyed."],
      },
      {
        label: "Body (weak)",
        text: "Contact lenses. Slept in them. Eye sore. Drops started.",
        sourceNoteIds: ["n2", "n4"],
        notes: ["Visual acuity and infiltrate location missing.", "Fluorescein findings omitted."],
      },
      {
        label: "Closing (weak)",
        text: "Please see her soon.",
        sourceNoteIds: [],
        notes: ["Same-day review and vision loss warning not stated."],
      },
    ],
    criterionComments: {
      Purpose: "Urgent referral purpose unclear.",
      Content: "Irrelevant student detail; examination findings incomplete.",
    },
    assessorSummary:
      "Likely Grade C: weak keratitis referral without urgency or complete examination.",
  }),

  // ── dietetics ─────────────────────────────────────────────────────────────
  buildSample({
    id: "sample-diet-us-wave2-b",
    scenarioId: "w-diet-us-wave2",
    profession: "dietetics",
    title: "Celiac disease nutritional plan",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 174,
    paragraphs: [
      {
        label: "Diagnosis context",
        text: "Dear Dr Smith,\n\nRe: Ms Laura Anderson, aged 32 years\n\nI am writing to outline dietary management for Ms Anderson following a new celiac disease diagnosis, assessed on 10 June 2026.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Diagnosis context and patient identity stated."],
      },
      {
        label: "Education & monitoring",
        text: "Positive tissue transglutaminase IgA and duodenal biopsy confirmed the diagnosis. Strict gluten-free diet education and label-reading guidance were provided. Iron, vitamin B12, and vitamin D monitoring were discussed.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Diagnostic confirmation, education, and micronutrient monitoring covered."],
      },
      {
        label: "Follow-up",
        text: "Dietetic follow-up is arranged in six weeks. Please re-refer if ongoing diarrhoea persists despite dietary adherence.\n\nYours sincerely,\n[Dietitian name]",
        sourceNoteIds: ["n5"],
        notes: ["Follow-up interval and re-referral trigger stated."],
      },
    ],
    criterionComments: {
      Purpose: "Clear advice on celiac nutritional management.",
      Content: "Diagnosis, gluten-free education, micronutrient monitoring, and follow-up covered.",
    },
    assessorSummary:
      "Likely Grade B: celiac management letter with education, monitoring, and follow-up plan.",
  }),
  buildSample({
    id: "sample-diet-us-wave2-c",
    scenarioId: "w-diet-us-wave2",
    profession: "dietetics",
    title: "Weak example — celiac disease (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 138,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMs Anderson has coeliac disease. She likes baking.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant hobby included.", "Diagnostic confirmation missing."],
      },
      {
        label: "Body (weak)",
        text: "Gluten-free diet explained. Handout given. Vitamins discussed.",
        sourceNoteIds: ["n3", "n4"],
        notes: ["TTG and biopsy not mentioned.", "Specific micronutrients vague."],
      },
      {
        label: "Closing (weak)",
        text: "Follow up later. Call if problems.",
        sourceNoteIds: [],
        notes: ["Six-week follow-up and diarrhoea trigger not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant baking hobby; diagnostic and monitoring detail incomplete.",
      Purpose: "Advice purpose vague without structured follow-up.",
    },
    assessorSummary:
      "Likely Grade C: incomplete celiac advice with irrelevant detail and vague follow-up.",
  }),

  buildSample({
    id: "sample-diet-ie-wave2-b",
    scenarioId: "w-diet-ie-wave2",
    profession: "dietetics",
    title: "Oncology malnutrition support",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 180,
    paragraphs: [
      {
        label: "Treatment context",
        text: "Dear Dr O'Brien,\n\nRe: Mr Liam Doyle, aged 58 years\n\nI am writing to summarise nutritional support for Mr Doyle during cycle 3 of FOLFOX chemotherapy for colorectal cancer, assessed on 11 June 2026.",
        sourceNoteIds: ["n1"],
        notes: ["Treatment phase and cancer context stated."],
      },
      {
        label: "Nutritional assessment",
        text: "He has lost 4 kg in six weeks and his BMI is now 20. Nausea occurs on days 2–4 post-chemotherapy; small frequent meals were advised. A high-protein snack plan with two oral nutrition supplements daily was commenced.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Weight trend, symptoms, and supplement plan documented."],
      },
      {
        label: "Monitoring request",
        text: "Weekly weights are recommended. I would appreciate GP review if weight loss exceeds 2% in two weeks.\n\nYours sincerely,\n[Dietitian name]",
        sourceNoteIds: ["n5"],
        notes: ["Weight monitoring and GP review threshold clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear oncology nutrition summary with GP monitoring request.",
      Content: "Weight trend, intake assessment, supplement plan, and monitoring covered.",
    },
    assessorSummary:
      "Likely Grade B: oncology malnutrition support with weight monitoring and GP review criteria.",
  }),
  buildSample({
    id: "sample-diet-ie-wave2-c",
    scenarioId: "w-diet-ie-wave2",
    profession: "dietetics",
    title: "Weak example — oncology nutrition (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nMr Doyle is on chemo. He supports the local GAA club.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant club detail included.", "Treatment cycle and weight trend missing."],
      },
      {
        label: "Body (weak)",
        text: "Lost weight. Feels sick after treatment. Eating small meals. Supplements given.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["BMI and supplement quantity not specified.", "Nausea timing vague."],
      },
      {
        label: "Closing (weak)",
        text: "Weigh him sometimes. GP if worse.",
        sourceNoteIds: [],
        notes: ["2% weight loss threshold not specified."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant GAA detail; weight data and monitoring criteria incomplete.",
      Purpose: "Summary purpose weak without structured GP request.",
    },
    assessorSummary:
      "Likely Grade C: incomplete oncology nutrition summary with irrelevant detail.",
  }),

  // ── radiography ───────────────────────────────────────────────────────────
  buildSample({
    id: "sample-rad-us-wave2-b",
    scenarioId: "w-rad-us-wave2",
    profession: "radiography",
    title: "CT PE protocol report",
    letterType: "reply",
    estimatedOverall: "B",
    wordCount: 168,
    paragraphs: [
      {
        label: "Examination",
        text: "Dear Dr Smith,\n\nRe: Ms Jennifer Taylor, aged 49 years\n\nI am writing with CT pulmonary angiography findings for Ms Taylor, performed on 8 June 2026 for pleuritic chest pain.",
        sourceNoteIds: ["n1"],
        notes: ["Examination and clinical indication stated."],
      },
      {
        label: "Findings",
        text: "Her Wells score was intermediate with an elevated D-dimer. No pulmonary embolism was identified. Minor dependent atelectasis at the lung bases was the only additional finding.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Pre-test probability, main finding, and incidental finding documented."],
      },
      {
        label: "Recommendation",
        text: "I suggest clinical reassessment for a musculoskeletal cause of her symptoms.\n\nYours sincerely,\n[Radiographer name]",
        sourceNoteIds: ["n5"],
        notes: ["Correlation with clinical status recommended."],
      },
    ],
    criterionComments: {
      Purpose: "Clear communication of negative CTPA with clinical recommendation.",
      Content: "Indication, Wells score, emboli status, and incidental findings covered.",
    },
    assessorSummary:
      "Likely Grade B: negative CTPA reported with incidental findings and clinical correlation advice.",
  }),
  buildSample({
    id: "sample-rad-us-wave2-c",
    scenarioId: "w-rad-us-wave2",
    profession: "radiography",
    title: "Weak example — CT PE report (Grade C)",
    letterType: "reply",
    estimatedOverall: "C",
    wordCount: 132,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMs Taylor had a CT scan. She flew long-haul recently.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant travel history included.", "Clinical indication missing."],
      },
      {
        label: "Body (weak)",
        text: "No clot seen. Lungs OK mostly. D-dimer high.",
        sourceNoteIds: ["n2", "n3"],
        notes: ["Wells score and atelectasis not mentioned.", "Findings vaguely described."],
      },
      {
        label: "Closing (weak)",
        text: "Check her again.",
        sourceNoteIds: [],
        notes: ["Musculoskeletal reassessment not recommended."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant flight history; Wells score and incidental findings omitted.",
      Purpose: "Report purpose weak without clinical correlation advice.",
    },
    assessorSummary:
      "Likely Grade C: incomplete CTPA report with irrelevant detail and vague recommendation.",
  }),

  // ── speech pathology ────────────────────────────────────────────────────────
  buildSample({
    id: "sample-sp-us-wave2-b",
    scenarioId: "w-sp-us-wave2",
    profession: "speech_pathology",
    title: "Professional voice strain referral",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 186,
    paragraphs: [
      {
        label: "Referral reason",
        text: "Dear Dr Smith,\n\nRe: Ms Olivia Brooks, aged 35 years\n\nI am referring Ms Brooks for laryngoscopic assessment of hoarseness present for six weeks, assessed at voice clinic on 14 June 2026.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Symptom duration and referral purpose stated."],
      },
      {
        label: "Assessment",
        text: "She is a radio presenter with increased vocal load. Voice assessment revealed rough-harsh quality with reduced pitch range. A vocal hygiene and hydration plan was commenced; she does not smoke.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Occupational demands, voice findings, and hygiene plan documented."],
      },
      {
        label: "Request",
        text: "I would be grateful for stroboscopic examination and a joint management plan while voice therapy continues.\n\nYours sincerely,\n[Speech pathologist name]",
        sourceNoteIds: ["n5"],
        notes: ["ENT assessment and ongoing therapy request clear."],
      },
    ],
    criterionComments: {
      Purpose: "Clear ENT referral for occupational dysphonia.",
      Content: "Voice demands, assessment, hygiene plan, and joint management request covered.",
    },
    assessorSummary:
      "Likely Grade B: professional voice referral with assessment findings and joint management request.",
  }),
  buildSample({
    id: "sample-sp-us-wave2-c",
    scenarioId: "w-sp-us-wave2",
    profession: "speech_pathology",
    title: "Weak example — voice strain (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 145,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMs Brooks has a hoarse voice. She runs marathons.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant marathon detail included.", "Duration and occupation not stated."],
      },
      {
        label: "Body (weak)",
        text: "Voice sounds rough. Hydration discussed. No smoking. Therapy ongoing.",
        sourceNoteIds: ["n3", "n4", "n5"],
        notes: ["Radio presenter context and pitch range missing.", "Vocal load not documented."],
      },
      {
        label: "Closing (weak)",
        text: "Please look at her throat.",
        sourceNoteIds: [],
        notes: ["Stroboscopy and joint management plan not requested."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant marathon detail; occupational context and voice findings incomplete.",
      Purpose: "Referral request vague without stroboscopy specification.",
    },
    assessorSummary:
      "Likely Grade C: weak voice referral with irrelevant detail and incomplete assessment.",
  }),

  // ── veterinary science ────────────────────────────────────────────────────
  buildSample({
    id: "sample-vet-us-wave2-b",
    scenarioId: "w-vet-us-wave2",
    profession: "veterinary_science",
    title: "Canine parvovirus hospital update",
    letterType: "advice",
    estimatedOverall: "B",
    wordCount: 182,
    paragraphs: [
      {
        label: "Patient identification",
        text: "Dear Dr Smith,\n\nRe: Max, 4-month-old male Labrador, owner Mr Garcia\n\nI am writing to update you on hospital care for Max, admitted on 16 June 2026 with parvovirus enteritis.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Patient, age, owner, and admission reason identified."],
      },
      {
        label: "Clinical status",
        text: "Parvovirus antigen was positive with bloody diarrhoea for two days. He is receiving intravenous crystalloids and antiemetics; glucose is within normal limits today. He remains in the isolation ward under strict biosecurity with no visitors permitted.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Lab trends, treatment, and isolation protocol documented."],
      },
      {
        label: "Prognosis",
        text: "Prognosis remains guarded. Discharge criteria are eating for 48 hours without vomiting.\n\nYours sincerely,\n[Veterinarian name]",
        sourceNoteIds: ["n5"],
        notes: ["Prognosis and discharge criteria clearly stated."],
      },
    ],
    criterionComments: {
      Purpose: "Clear update to referring veterinarian on inpatient parvovirus care.",
      Content: "Patient ID, lab trends, treatment, isolation, and prognosis covered.",
    },
    assessorSummary:
      "Likely Grade B: parvovirus hospital update with treatment, isolation, and discharge criteria.",
  }),
  buildSample({
    id: "sample-vet-us-wave2-c",
    scenarioId: "w-vet-us-wave2",
    profession: "veterinary_science",
    title: "Weak example — parvovirus update (Grade C)",
    letterType: "advice",
    estimatedOverall: "C",
    wordCount: 148,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr Smith,\n\nMax the puppy is in hospital. His litter mate is vaccinated.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant litter mate detail included.", "Owner and age not identified."],
      },
      {
        label: "Body (weak)",
        text: "Parvo positive. Diarrhoea with blood. On fluids. Isolated.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Antiemetics and glucose trend missing.", "Biosecurity detail vague."],
      },
      {
        label: "Closing (weak)",
        text: "Hope he gets better soon.",
        sourceNoteIds: [],
        notes: ["Discharge criteria and guarded prognosis not stated."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant vaccination detail; treatment and discharge criteria incomplete.",
      Purpose: "Update purpose weak without structured clinical summary.",
    },
    assessorSummary:
      "Likely Grade C: incomplete parvovirus update with irrelevant detail and vague prognosis.",
  }),

  buildSample({
    id: "sample-vet-ie-wave2-b",
    scenarioId: "w-vet-ie-wave2",
    profession: "veterinary_science",
    title: "Equine colic surgical referral",
    letterType: "referral",
    estimatedOverall: "B",
    wordCount: 176,
    paragraphs: [
      {
        label: "Emergency referral",
        text: "Dear Dr O'Brien,\n\nRe: Thunder, 9-year-old Irish Sport Horse, owner Mr Walsh\n\nI am referring Thunder for emergency surgical evaluation of refractory colic, assessed on 17 June 2026.",
        sourceNoteIds: ["n1", "n2"],
        notes: ["Horse, owner, and emergency purpose identified."],
      },
      {
        label: "Examination & treatment",
        text: "Acute colic has persisted for four hours with rolling and flank watching. Nasogastric reflux of 3 litres was obtained; heart rate is 60 bpm and he remains painful on re-examination. Flunixin and intravenous fluids were administered with minimal response.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Presenting signs, reflux, vitals, and analgesia response documented."],
      },
      {
        label: "Request",
        text: "I am referring him to the equine hospital 90 km away. The owner consents to surgery if required and I would be grateful for your urgent assessment.\n\nYours sincerely,\n[Veterinarian name]",
        sourceNoteIds: ["n5"],
        notes: ["Transfer distance, owner consent, and urgent request included."],
      },
    ],
    criterionComments: {
      Purpose: "Emergency surgical referral clearly stated.",
      Content: "Presentation, examination, treatment response, and owner consent covered.",
    },
    assessorSummary:
      "Likely Grade B: emergency equine colic referral with complete examination and consent documentation.",
  }),
  buildSample({
    id: "sample-vet-ie-wave2-c",
    scenarioId: "w-vet-ie-wave2",
    profession: "veterinary_science",
    title: "Weak example — equine colic (Grade C)",
    letterType: "referral",
    estimatedOverall: "C",
    wordCount: 142,
    paragraphs: [
      {
        label: "Opening (weak)",
        text: "Dear Dr O'Brien,\n\nThunder the horse has colic. He competes in eventing.",
        sourceNoteIds: ["n1", "n6"],
        notes: ["Irrelevant competition detail included.", "Owner not identified."],
      },
      {
        label: "Body (weak)",
        text: "Rolling and pain. Stomach tube reflux. Heart fast. Painkillers given.",
        sourceNoteIds: ["n2", "n3", "n4"],
        notes: ["Reflux volume and heart rate not specified.", "Minimal treatment response not stated."],
      },
      {
        label: "Closing (weak)",
        text: "Send to hospital. Owner agrees.",
        sourceNoteIds: ["n5"],
        notes: ["Distance and urgency not conveyed.", "Surgical consent vague."],
      },
    ],
    criterionComments: {
      Content: "Irrelevant eventing detail; examination findings incomplete.",
      Purpose: "Emergency referral urgency not clearly stated.",
    },
    assessorSummary:
      "Likely Grade C: weak colic referral with incomplete examination and irrelevant detail.",
  }),
];
