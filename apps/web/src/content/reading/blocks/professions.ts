import type { OetProfession } from "@/lib/domain/types";

import { matchingQuestions } from "./helpers";
import type { ReadingBlock } from "../types";
import { PROFESSION_READING_BLOCKS_WAVE2 } from "./professions-wave2";

interface ProfessionPartAConfig {
  id: string;
  profession: OetProfession;
  title: string;
  localeContext: string;
  texts: [string, string, string, string];
  matches: {
    id: string;
    prompt: string;
    answer: "Text A" | "Text B" | "Text C" | "Text D";
    explanation: string;
  }[];
}

const PART_A_CONFIGS: ProfessionPartAConfig[] = [
  {
    id: "r-med-part-a",
    profession: "medicine",
    title: "Medical ward notices",
    localeContext: "Acute medical unit · all countries",
    texts: [
      "Text A — Consultant review: Mr Hassan febrile 38.4°C — blood cultures sent. Empirical antibiotics per sepsis pathway. Repeat obs hourly.",
      "Text B — Discharge summary pending for Mrs O'Brien — pharmacy to reconcile amiodarone before TTO. GP letter by 16:00.",
      "Text C — Radiology: CT chest for Ms Patel booked urgent — nil by mouth from midnight. Consent form in notes.",
      "Text D — MDT minutes: discuss oncology referral for Mr Jones Tuesday 08:30 — junior to present imaging.",
    ],
    matches: [
      { id: "r-med-a-q1", prompt: "Which text mentions fasting before imaging?", answer: "Text C", explanation: "Text C specifies nil by mouth from midnight for CT." },
      { id: "r-med-a-q2", prompt: "Which text requires hourly observations?", answer: "Text A", explanation: "Text A orders repeat obs hourly for sepsis pathway." },
      { id: "r-med-a-q3", prompt: "Which text involves pharmacy reconciliation?", answer: "Text B", explanation: "Text B asks pharmacy to reconcile amiodarone before TTO." },
      { id: "r-med-a-q4", prompt: "Which text schedules a multidisciplinary meeting?", answer: "Text D", explanation: "Text D sets MDT discussion for Tuesday." },
    ],
  },
  {
    id: "r-nurs-part-a",
    profession: "nursing",
    title: "Nursing handover extracts",
    localeContext: "Ward handover · all countries",
    texts: [
      "Text A — NEWS2 7 on Bed 12 — medical review requested. Oxygen started 2 L/min via nasal cannula.",
      "Text B — Pressure area: sacral dressing changed — wound nurse review Friday. Reposition two-hourly.",
      "Text C — Insulin protocol: Bed 8 on variable rate infusion — hourly BM chart attached.",
      "Text D — Social: daughter translating for Bed 3 — book interpreter for consent discussion.",
    ],
    matches: [
      { id: "r-nurs-a-q1", prompt: "Which text reports an elevated early warning score?", answer: "Text A", explanation: "NEWS2 7 triggers medical review." },
      { id: "r-nurs-a-q2", prompt: "Which text documents wound care?", answer: "Text B", explanation: "Text B describes sacral dressing change." },
      { id: "r-nurs-a-q3", prompt: "Which text involves variable rate insulin?", answer: "Text C", explanation: "Text C references VRII and hourly BM chart." },
      { id: "r-nurs-a-q4", prompt: "Which text addresses language support?", answer: "Text D", explanation: "Text D books an interpreter for consent." },
    ],
  },
  {
    id: "r-pharm-part-a",
    profession: "pharmacy",
    title: "Pharmacy ward bulletin",
    localeContext: "Hospital pharmacy · all countries",
    texts: [
      "Text A — Cold chain: Ward fridge 4 recorded 12°C overnight — quarantine contents until pharmacy inspection.",
      "Text B — Anticoagulant counselling: new apixaban starter pack for Bed 6 — counsel before first dose.",
      "Text C — Stock outage: piperacillin-tazobactam alternative per microbiology until Friday delivery.",
      "Text D — Discharge: TTO for Mrs Lee ready — pharmacist check complete; patient education on inhaler technique documented.",
    ],
    matches: [
      { id: "r-pharm-a-q1", prompt: "Which text describes a temperature excursion?", answer: "Text A", explanation: "Fridge at 12°C requires quarantine." },
      { id: "r-pharm-a-q2", prompt: "Which text requires patient counselling?", answer: "Text B", explanation: "Apixaban starter pack needs counselling before first dose." },
      { id: "r-pharm-a-q3", prompt: "Which text mentions a medicine shortage?", answer: "Text C", explanation: "Piperacillin-tazobactam outage with alternative." },
      { id: "r-pharm-a-q4", prompt: "Which text confirms discharge medicines checked?", answer: "Text D", explanation: "TTO ready with pharmacist check complete." },
    ],
  },
  {
    id: "r-dent-part-a",
    profession: "dentistry",
    title: "Dental clinic notices",
    localeContext: "Dental practice · all countries",
    texts: [
      "Text A — Emergency list: Mr Costa periapical abscess — slot 15:30 Room 2. Prescribe antibiotics only if systemic signs.",
      "Text B — Recall: children fluoride varnish programme Thursday — consent forms in reception.",
      "Text C — Referral: orthopantomogram for Ms Wright sent to maxillofacial — await triage letter.",
      "Text D — IPC: slow handpiece steriliser out of service — use autoclave B only until engineer attends.",
    ],
    matches: [
      { id: "r-dent-a-q1", prompt: "Which text schedules an emergency appointment?", answer: "Text A", explanation: "Text A books Mr Costa for abscess at 15:30." },
      { id: "r-dent-a-q2", prompt: "Which text involves preventive care for children?", answer: "Text B", explanation: "Text B covers fluoride varnish programme." },
      { id: "r-dent-a-q3", prompt: "Which text mentions imaging referral?", answer: "Text C", explanation: "Text C sends OPG to maxillofacial." },
      { id: "r-dent-a-q4", prompt: "Which text affects sterilisation workflow?", answer: "Text D", explanation: "Text D redirects to autoclave B." },
    ],
  },
  {
    id: "r-phys-part-a",
    profession: "physiotherapy",
    title: "Physiotherapy department slips",
    localeContext: "Physio department · all countries",
    texts: [
      "Text A — Post-TKR group moved to Gym 2 — patients check screen on arrival.",
      "Text B — Acute referral: Bed 14 stroke — assess sitting balance today before mobilising.",
      "Text C — Equipment: walking frame ordered for Mrs Duong — fit before discharge planning meeting.",
      "Text D — Outpatient: Mr Singh cancelled — rebook pulmonary rehab within two weeks per pathway.",
    ],
    matches: [
      { id: "r-phys-a-q1", prompt: "Which text notes a venue change?", answer: "Text A", explanation: "Post-TKR group moved to Gym 2." },
      { id: "r-phys-a-q2", prompt: "Which text prioritises balance assessment?", answer: "Text B", explanation: "Assess sitting balance before mobilising." },
      { id: "r-phys-a-q3", prompt: "Which text links equipment to discharge?", answer: "Text C", explanation: "Walking frame needed before discharge meeting." },
      { id: "r-phys-a-q4", prompt: "Which text requires rebooking rehab?", answer: "Text D", explanation: "Pulmonary rehab rebook within two weeks." },
    ],
  },
  {
    id: "r-ot-part-a",
    profession: "occupational_therapy",
    title: "OT ward alerts",
    localeContext: "Occupational therapy · all countries",
    texts: [
      "Text A — Home visit: Mrs Adebayo — kitchen assessment Tuesday — keys from daughter.",
      "Text B — Cognitive screen: Bed 9 delirium — OT to assess ADLs before discharge destination agreed.",
      "Text C — Equipment trial: raised toilet seat for Bed 2 — document tolerance in notes.",
      "Text D — Group: fatigue management session cancelled — send handouts via email.",
    ],
    matches: [
      { id: "r-ot-a-q1", prompt: "Which text schedules a home assessment?", answer: "Text A", explanation: "Kitchen assessment with home visit on Tuesday." },
      { id: "r-ot-a-q2", prompt: "Which text links cognition to discharge planning?", answer: "Text B", explanation: "ADL assessment before discharge destination." },
      { id: "r-ot-a-q3", prompt: "Which text documents equipment trial?", answer: "Text C", explanation: "Raised toilet seat trial with tolerance note." },
      { id: "r-ot-a-q4", prompt: "Which text replaces a cancelled session?", answer: "Text D", explanation: "Handouts sent by email instead of group." },
    ],
  },
  {
    id: "r-rad-part-a",
    profession: "radiography",
    title: "Imaging department notices",
    localeContext: "Diagnostic imaging · all countries",
    texts: [
      "Text A — MRI safety: patient with pacemaker referred — cardiologist clearance required before booking.",
      "Text B — CT contrast: eGFR 28 for Mr Li — refer to radiologist before iodinated contrast.",
      "Text C — Portable chest X-ray Bed 18 — infection control precautions — full PPE required.",
      "Text D — Ultrasound biopsy clinic running 30 minutes late — notify day surgery unit.",
    ],
    matches: [
      { id: "r-rad-a-q1", prompt: "Which text requires cardiologist clearance?", answer: "Text A", explanation: "Pacemaker needs clearance before MRI." },
      { id: "r-rad-a-q2", prompt: "Which text flags renal function concern?", answer: "Text B", explanation: "Low eGFR requires radiologist review before contrast." },
      { id: "r-rad-a-q3", prompt: "Which text specifies PPE?", answer: "Text C", explanation: "Infection precautions require full PPE." },
      { id: "r-rad-a-q4", prompt: "Which text requires notifying another unit?", answer: "Text D", explanation: "Day surgery must be told of delay." },
    ],
  },
  {
    id: "r-opt-part-a",
    profession: "optometry",
    title: "Optometry clinic memos",
    localeContext: "Optometry practice · all countries",
    texts: [
      "Text A — Urgent: Ms Tran suspected acute angle closure — same-day ophthalmology referral.",
      "Text B — Contact lens trial follow-up booked — document corneal staining result.",
      "Text C — Diabetic screening: retinal photos uploaded to shared record — GP summary letter generated.",
      "Text D — Stock: single-vision lenses back-ordered — offer temporary loan frames.",
    ],
    matches: [
      { id: "r-opt-a-q1", prompt: "Which text requires urgent ophthalmology referral?", answer: "Text A", explanation: "Suspected angle closure needs same-day referral." },
      { id: "r-opt-a-q2", prompt: "Which text documents contact lens follow-up?", answer: "Text B", explanation: "Follow-up with corneal staining documentation." },
      { id: "r-opt-a-q3", prompt: "Which text involves diabetic eye screening?", answer: "Text C", explanation: "Retinal photos and GP summary for diabetic screening." },
      { id: "r-opt-a-q4", prompt: "Which text offers a temporary solution for stock delay?", answer: "Text D", explanation: "Loan frames while lenses back-ordered." },
    ],
  },
  {
    id: "r-pod-part-a",
    profession: "podiatry",
    title: "Podiatry service notices",
    localeContext: "Podiatry · all countries",
    texts: [
      "Text A — High-risk foot clinic: Mr Okonkwo neurovascular assessment due — ulcer prevention plan update.",
      "Text B — Nail surgery list full — redirect routine calluses to community clinic.",
      "Text C — Vascular referral sent for Ms Chen absent pedal pulses — await duplex result.",
      "Text D — Orthotics collection: adjust insoles for Mrs Silva before discharge walk test.",
    ],
    matches: [
      { id: "r-pod-a-q1", prompt: "Which text updates a high-risk foot plan?", answer: "Text A", explanation: "Neurovascular assessment for ulcer prevention." },
      { id: "r-pod-a-q2", prompt: "Which text redirects routine patients?", answer: "Text B", explanation: "Routine calluses sent to community clinic." },
      { id: "r-pod-a-q3", prompt: "Which text awaits vascular imaging?", answer: "Text C", explanation: "Duplex result pending after absent pulses." },
      { id: "r-pod-a-q4", prompt: "Which text prepares for mobility testing?", answer: "Text D", explanation: "Insole adjustment before discharge walk test." },
    ],
  },
  {
    id: "r-vet-part-a",
    profession: "veterinary_science",
    title: "Veterinary practice board",
    localeContext: "Veterinary clinic · all countries",
    texts: [
      "Text A — Emergency: canine GDV — theatre prepped — owner consent and estimate signed.",
      "Text B — Rabbit vaccination recall texts sent — stock Nobivac Myxo due low, order placed.",
      "Text C — Farm visit: herd TB test scheduled — DEFRA/APHA forms in van folder.",
      "Text D — Lab: feline renal panel abnormal — vet to call owner before 17:00.",
    ],
    matches: [
      { id: "r-vet-a-q1", prompt: "Which text describes surgical emergency prep?", answer: "Text A", explanation: "GDV case with theatre and consent." },
      { id: "r-vet-a-q2", prompt: "Which text mentions vaccine stock?", answer: "Text B", explanation: "Low Nobivac stock with order placed." },
      { id: "r-vet-a-q3", prompt: "Which text involves regulatory herd testing?", answer: "Text C", explanation: "TB test with official forms in van." },
      { id: "r-vet-a-q4", prompt: "Which text requires owner phone call?", answer: "Text D", explanation: "Abnormal renal panel — call owner before 17:00." },
    ],
  },
  {
    id: "r-sp-part-a",
    profession: "speech_pathology",
    title: "Speech pathology alerts",
    localeContext: "Speech pathology · all countries",
    texts: [
      "Text A — Bed 11 dysphagia — modified fluids until videofluoroscopy review Wednesday.",
      "Text B — Paediatric: parent training for AAC device — interpreter booked Thursday.",
      "Text C — Stroke group moved online — send swallow-safe recipe pack by email.",
      "Text D — ENT referral for Bed 6 hoarse voice >3 weeks — copy GP letter to notes.",
    ],
    matches: [
      { id: "r-sp-a-q1", prompt: "Which text restricts fluids pending assessment?", answer: "Text A", explanation: "Modified fluids until videofluoroscopy." },
      { id: "r-sp-a-q2", prompt: "Which text involves assisted communication training?", answer: "Text B", explanation: "AAC device training with interpreter." },
      { id: "r-sp-a-q3", prompt: "Which text replaces an in-person group?", answer: "Text C", explanation: "Online group with recipe pack emailed." },
      { id: "r-sp-a-q4", prompt: "Which text requests ENT assessment?", answer: "Text D", explanation: "Hoarse voice >3 weeks — ENT referral." },
    ],
  },
  {
    id: "r-diet-part-a",
    profession: "dietetics",
    title: "Dietetics ward notices",
    localeContext: "Clinical dietetics · all countries",
    texts: [
      "Text A — Bed 5 refeeding risk — start protocol, monitor phosphate daily.",
      "Text B — Diabetes education class Thursday — carbohydrate counting module.",
      "Text C — Texture-modified menu for Bed 19 — IDDSI Level 4 — kitchen notified.",
      "Text D — Home enteral feed delivery delayed — ward stock for 48 hours in store.",
    ],
    matches: [
      { id: "r-diet-a-q1", prompt: "Which text initiates refeeding monitoring?", answer: "Text A", explanation: "Refeeding protocol with daily phosphate." },
      { id: "r-diet-a-q2", prompt: "Which text schedules structured education?", answer: "Text B", explanation: "Diabetes class with carb counting module." },
      { id: "r-diet-a-q3", prompt: "Which text specifies IDDSI level?", answer: "Text C", explanation: "IDDSI Level 4 diet for Bed 19." },
      { id: "r-diet-a-q4", prompt: "Which text covers enteral feed contingency?", answer: "Text D", explanation: "48-hour ward stock while delivery delayed." },
    ],
  },
];

function buildProfessionPartA(config: ProfessionPartAConfig): ReadingBlock {
  const blockId = config.id;
  const tags = ["reading:part-a", "reading:part-a-speed", "reading:scan"];

  return {
    id: blockId,
    part: "A",
    title: config.title,
    paragraphs: config.texts,
    durationMinutes: 15,
    profession: config.profession,
    countryCode: "ALL",
    difficulty: 2,
    tags,
    localeContext: config.localeContext,
    questions: matchingQuestions(
      blockId,
      config.matches.map((m) => ({
        id: m.id,
        prompt: m.prompt,
        answer: m.answer,
        explanation: m.explanation,
      })),
      tags,
      config.profession,
      "ALL",
    ),
  };
}

export const PROFESSION_READING_BLOCKS: ReadingBlock[] = PART_A_CONFIGS.map(buildProfessionPartA);

export function professionPartABlock(profession: OetProfession): ReadingBlock | undefined {
  return PROFESSION_READING_BLOCKS.find((b) => b.profession === profession);
}

export function professionPartABlocksAll(profession: OetProfession): ReadingBlock[] {
  return [
    ...PROFESSION_READING_BLOCKS.filter((b) => b.profession === profession),
    ...PROFESSION_READING_BLOCKS_WAVE2.filter((b) => b.profession === profession),
  ];
}
