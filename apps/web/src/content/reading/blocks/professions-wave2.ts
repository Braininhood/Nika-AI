import type { OetProfession } from "@/lib/domain/types";

import { matchingQuestions } from "./helpers";
import type { ReadingBlock } from "../types";

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

/** Wave 3 — second Part A block per profession (rotation variety). */
const PART_A_WAVE2_CONFIGS: ProfessionPartAConfig[] = [
  {
    id: "r-med-part-a-2",
    profession: "medicine",
    title: "Medical clinic memos",
    localeContext: "Outpatient clinic · all countries",
    texts: [
      "Text A — Anticoagulation clinic: Mrs Okonkwo INR 4.8 — hold warfarin tonight, repeat Friday.",
      "Text B — Cardiology: stress test negative for Mr Lee — continue medical management, review 6 months.",
      "Text C — Endoscopy list: colonoscopy for Ms Tan — bowel prep kit collected, escort required post sedation.",
      "Text D — Rheumatology: start methotrexate for Mr Singh — folic acid 5mg weekly, baseline CXR filed.",
    ],
    matches: [
      { id: "r-med-a2-q1", prompt: "Which text advises holding warfarin?", answer: "Text A", explanation: "INR 4.8 — hold warfarin tonight." },
      { id: "r-med-a2-q2", prompt: "Which text documents a negative stress test?", answer: "Text B", explanation: "Stress test negative — continue medical management." },
      { id: "r-med-a2-q3", prompt: "Which text mentions post-sedation escort?", answer: "Text C", explanation: "Escort required after colonoscopy sedation." },
      { id: "r-med-a2-q4", prompt: "Which text initiates DMARD therapy?", answer: "Text D", explanation: "Start methotrexate with folic acid." },
    ],
  },
  {
    id: "r-nurs-part-a-2",
    profession: "nursing",
    title: "Nursing shift updates",
    localeContext: "Acute ward · all countries",
    texts: [
      "Text A — Falls risk Bed 7 — bed alarm on, non-slip socks, hourly toileting chart started.",
      "Text B — IV antibiotics due 14:00 Bed 15 — flush line before piperacillin-tazobactam.",
      "Text C — Palliative family meeting 16:30 Room 4 — chaplain notified, notes in folder.",
      "Text D — New admission Bed 22 — MRSA screen pending, side room until result.",
    ],
    matches: [
      { id: "r-nurs-a2-q1", prompt: "Which text documents falls prevention?", answer: "Text A", explanation: "Bed alarm, socks, hourly toileting." },
      { id: "r-nurs-a2-q2", prompt: "Which text schedules IV antibiotic administration?", answer: "Text B", explanation: "Piperacillin-tazobactam due 14:00." },
      { id: "r-nurs-a2-q3", prompt: "Which text arranges a family meeting?", answer: "Text C", explanation: "Palliative family meeting with chaplain." },
      { id: "r-nurs-a2-q4", prompt: "Which text involves infection isolation?", answer: "Text D", explanation: "Side room until MRSA screen result." },
    ],
  },
  {
    id: "r-pharm-part-a-2",
    profession: "pharmacy",
    title: "Pharmacy dispensary alerts",
    localeContext: "Hospital pharmacy · all countries",
    texts: [
      "Text A — Stock shortage: amoxicillin suspension — use alternative strength, label clearly.",
      "Text B — High-risk medicine check: insulin chart Bed 9 — double-sign with second pharmacist.",
      "Text C — Discharge Rx query: warfarin dose change — confirm with medical team before release.",
      "Text D — Cold-chain delivery: adalimumab pens — store 2–8°C, fridge log updated.",
    ],
    matches: [
      { id: "r-pharm-a2-q1", prompt: "Which text addresses a medicine shortage?", answer: "Text A", explanation: "Amoxicillin suspension shortage — alternative strength." },
      { id: "r-pharm-a2-q2", prompt: "Which text requires double pharmacist sign-off?", answer: "Text B", explanation: "High-risk insulin chart check." },
      { id: "r-pharm-a2-q3", prompt: "Which text delays discharge pending confirmation?", answer: "Text C", explanation: "Warfarin dose change needs medical confirmation." },
      { id: "r-pharm-a2-q4", prompt: "Which text specifies refrigerated storage?", answer: "Text D", explanation: "Adalimumab 2–8°C cold chain." },
    ],
  },
  {
    id: "r-dent-part-a-2",
    profession: "dentistry",
    title: "Dental practice notices",
    localeContext: "Dental surgery · all countries",
    texts: [
      "Text A — Emergency slot 11:30: avulsed tooth — store in milk, see within 1 hour.",
      "Text B — Sedation list: anxious patient LR6 root canal — fasting from 07:00 confirmed.",
      "Text C — Lab delay: crown for Mr Costa — temporary bridge fitted, recall 2 weeks.",
      "Text D — Radiograph QC: OPG machine service due — use alternate room until Friday.",
    ],
    matches: [
      { id: "r-dent-a2-q1", prompt: "Which text gives avulsion first-aid advice?", answer: "Text A", explanation: "Store tooth in milk, see within 1 hour." },
      { id: "r-dent-a2-q2", prompt: "Which text confirms fasting before sedation?", answer: "Text B", explanation: "Fasting from 07:00 for sedation case." },
      { id: "r-dent-a2-q3", prompt: "Which text uses a temporary prosthesis?", answer: "Text C", explanation: "Temporary bridge while crown delayed." },
      { id: "r-dent-a2-q4", prompt: "Which text affects imaging equipment?", answer: "Text D", explanation: "OPG service — alternate room until Friday." },
    ],
  },
  {
    id: "r-phys-part-a-2",
    profession: "physiotherapy",
    title: "Physiotherapy department board",
    localeContext: "Physio gym · all countries",
    texts: [
      "Text A — ACL group 10:00 — cones set, crutches checked for three post-op patients.",
      "Text B — Hydro pool closed until 13:00 — chemical balance — land-based alternatives ready.",
      "Text C — Home visit 15:00: Mrs Okafor stairs practice — OT notified for rail assessment.",
      "Text D — Equipment order: resistance bands low — reorder placed, body-weight circuit today.",
    ],
    matches: [
      { id: "r-phys-a2-q1", prompt: "Which text schedules a post-op group?", answer: "Text A", explanation: "ACL group with crutches check." },
      { id: "r-phys-a2-q2", prompt: "Which text explains pool closure?", answer: "Text B", explanation: "Hydro pool closed for chemical balance." },
      { id: "r-phys-a2-q3", prompt: "Which text coordinates with occupational therapy?", answer: "Text C", explanation: "Stairs practice — OT for rail assessment." },
      { id: "r-phys-a2-q4", prompt: "Which text substitutes equipment?", answer: "Text D", explanation: "Low bands — body-weight circuit instead." },
    ],
  },
  {
    id: "r-ot-part-a-2",
    profession: "occupational_therapy",
    title: "OT service announcements",
    localeContext: "Rehab unit · all countries",
    texts: [
      "Text A — Kitchen assessment 09:00 Room 12 — cognitive screen completed, family attending.",
      "Text B — Wheelchair clinic moved to Thursday — vendor rep delayed, patients contacted.",
      "Text C — Splinting workshop: rheumatoid hands — heat pack and gentle ROM before fabrication.",
      "Text D — Discharge equipment: raised toilet frame Bed 18 — delivery ETA tomorrow AM.",
    ],
    matches: [
      { id: "r-ot-a2-q1", prompt: "Which text involves a kitchen assessment?", answer: "Text A", explanation: "Kitchen assessment with family present." },
      { id: "r-ot-a2-q2", prompt: "Which text reschedules an appointment?", answer: "Text B", explanation: "Wheelchair clinic moved to Thursday." },
      { id: "r-ot-a2-q3", prompt: "Which text prepares for splint fabrication?", answer: "Text C", explanation: "Heat pack and ROM before splinting." },
      { id: "r-ot-a2-q4", prompt: "Which text orders bathroom equipment?", answer: "Text D", explanation: "Raised toilet frame delivery tomorrow." },
    ],
  },
  {
    id: "r-pod-part-a-2",
    profession: "podiatry",
    title: "Podiatry clinic memos",
    localeContext: "Podiatry service · all countries",
    texts: [
      "Text A — High-risk foot clinic: new ulcer Bed — vascular referral same day, offloading boot issued.",
      "Text B — Nail surgery list 14:00 — local anaesthetic stocks checked, post-op advice sheets ready.",
      "Text C — Orthotics collection: Mr Silva insoles ready — gait review booked next week.",
      "Text D — Diabetic foot screen training — all staff 12:00 seminar Room 3.",
    ],
    matches: [
      { id: "r-pod-a2-q1", prompt: "Which text issues offloading for an ulcer?", answer: "Text A", explanation: "Vascular referral and offloading boot." },
      { id: "r-pod-a2-q2", prompt: "Which text prepares for nail surgery?", answer: "Text B", explanation: "LA stocks and post-op sheets ready." },
      { id: "r-pod-a2-q3", prompt: "Which text schedules gait review?", answer: "Text C", explanation: "Insoles ready — gait review next week." },
      { id: "r-pod-a2-q4", prompt: "Which text announces staff training?", answer: "Text D", explanation: "Diabetic foot screen seminar 12:00." },
    ],
  },
  {
    id: "r-opt-part-a-2",
    profession: "optometry",
    title: "Optometry practice board",
    localeContext: "Optometry clinic · all countries",
    texts: [
      "Text A — Urgent slot: flashing lights — dilated fundoscopy within 2 hours, driver advised not to drive.",
      "Text B — Contact lens trial: keratoconus fit — topography uploaded, follow-up 1 week.",
      "Text C — Low-vision assessment Thursday — magnifier order forms in tray.",
      "Text D — OCT machine calibration — morning list delayed 30 minutes.",
    ],
    matches: [
      { id: "r-opt-a2-q1", prompt: "Which text manages possible retinal symptoms?", answer: "Text A", explanation: "Flashing lights — urgent fundoscopy." },
      { id: "r-opt-a2-q2", prompt: "Which text documents keratoconus fitting?", answer: "Text B", explanation: "Topography uploaded for lens trial." },
      { id: "r-opt-a2-q3", prompt: "Which text prepares low-vision aids?", answer: "Text C", explanation: "Magnifier order forms for assessment." },
      { id: "r-opt-a2-q4", prompt: "Which text delays the morning list?", answer: "Text D", explanation: "OCT calibration — 30 min delay." },
    ],
  },
  {
    id: "r-rad-part-a-2",
    profession: "radiography",
    title: "Radiology department notices",
    localeContext: "Imaging suite · all countries",
    texts: [
      "Text A — MRI safety: patient with pacemaker — cardiology clearance faxed, scan cancelled pending review.",
      "Text B — Fluoroscopy list: barium swallow 11:00 — consent and pregnancy check complete.",
      "Text C — PACS downtime 13:00–13:30 — paper reports for ED until restored.",
      "Text D — Interventional radiology: biopsy Bed 6 — coagulation screen within range.",
    ],
    matches: [
      { id: "r-rad-a2-q1", prompt: "Which text cancels MRI for safety?", answer: "Text A", explanation: "Pacemaker — scan cancelled pending cardiology." },
      { id: "r-rad-a2-q2", prompt: "Which text confirms pre-procedure checks?", answer: "Text B", explanation: "Consent and pregnancy check for barium swallow." },
      { id: "r-rad-a2-q3", prompt: "Which text uses paper reports temporarily?", answer: "Text C", explanation: "PACS downtime — paper for ED." },
      { id: "r-rad-a2-q4", prompt: "Which text proceeds with biopsy?", answer: "Text D", explanation: "Coagulation screen OK for biopsy." },
    ],
  },
  {
    id: "r-sp-part-a-2",
    profession: "speech_pathology",
    title: "Speech pathology schedule",
    localeContext: "Communication clinic · all countries",
    texts: [
      "Text A — Videofluoroscopy 10:00: Bed 14 — nil by mouth 4 hours, wheelchair transport booked.",
      "Text B — Laryngectomy group moved online — speech valves demonstrated via video.",
      "Text C — Paediatric assessment: 3yo speech delay — parent questionnaire returned, interpreter not required.",
      "Text D — Voice rest orders: teacher with nodules — written handout to ward nurse.",
    ],
    matches: [
      { id: "r-sp-a2-q1", prompt: "Which text requires fasting?", answer: "Text A", explanation: "Nil by mouth 4 hours before VFSS." },
      { id: "r-sp-a2-q2", prompt: "Which text changes delivery to online?", answer: "Text B", explanation: "Laryngectomy group online with valve demo." },
      { id: "r-sp-a2-q3", prompt: "Which text involves a preschool assessment?", answer: "Text C", explanation: "3yo speech delay — parent form returned." },
      { id: "r-sp-a2-q4", prompt: "Which text advises voice rest?", answer: "Text D", explanation: "Voice rest handout for vocal nodules." },
    ],
  },
  {
    id: "r-diet-part-a-2",
    profession: "dietetics",
    title: "Dietetics service updates",
    localeContext: "Nutrition team · all countries",
    texts: [
      "Text A — ICU round: enteral feed intolerance Bed 4 — reduce rate, prokinetic discussed with medical team.",
      "Text B — Allergy clinic: peanut anaphylaxis education — adrenaline pen technique demonstrated.",
      "Text C — Ward menu change: renal-friendly options highlighted — potassium guide on tray cards.",
      "Text D — Home visit cancelled — snow — telephone review for malnutrition screen instead.",
    ],
    matches: [
      { id: "r-diet-a2-q1", prompt: "Which text adjusts enteral feeding?", answer: "Text A", explanation: "Reduce feed rate for intolerance." },
      { id: "r-diet-a2-q2", prompt: "Which text teaches adrenaline use?", answer: "Text B", explanation: "Epi pen technique in allergy clinic." },
      { id: "r-diet-a2-q3", prompt: "Which text supports renal diet choices?", answer: "Text C", explanation: "Renal options with potassium guide." },
      { id: "r-diet-a2-q4", prompt: "Which text switches to phone review?", answer: "Text D", explanation: "Home visit cancelled — phone malnutrition screen." },
    ],
  },
  {
    id: "r-vet-part-a-2",
    profession: "veterinary_science",
    title: "Veterinary practice notices",
    localeContext: "Small animal clinic · all countries",
    texts: [
      "Text A — Emergency C-section booked 19:00 — theatre prepped, neonatal warming box ready.",
      "Text B — Kennel cough outbreak: suspend group puppy classes until culture results.",
      "Text C — Orthopaedic review: post TPLO dog — suture removal day 10, lead exercise only.",
      "Text D — Exotic consult: bearded dragon anorexia — UVB output checked, faecal sample sent.",
    ],
    matches: [
      { id: "r-vet-a2-q1", prompt: "Which text prepares for caesarean?", answer: "Text A", explanation: "Theatre and warming box for C-section." },
      { id: "r-vet-a2-q2", prompt: "Which text suspends group classes?", answer: "Text B", explanation: "Kennel cough — suspend puppy classes." },
      { id: "r-vet-a2-q3", prompt: "Which text restricts exercise post surgery?", answer: "Text C", explanation: "TPLO — lead exercise, suture removal day 10." },
      { id: "r-vet-a2-q4", prompt: "Which text investigates reptile anorexia?", answer: "Text D", explanation: "UVB check and faecal sample for bearded dragon." },
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

export const PROFESSION_READING_BLOCKS_WAVE2: ReadingBlock[] =
  PART_A_WAVE2_CONFIGS.map(buildProfessionPartA);

export function professionPartABlocks(profession: OetProfession): ReadingBlock[] {
  return PROFESSION_READING_BLOCKS_WAVE2.filter((b) => b.profession === profession);
}
