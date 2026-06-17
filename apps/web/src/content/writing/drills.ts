import type { OetProfession } from "@/lib/domain/types";

export interface ContentDrill {
  id: string;
  type: "include-omit" | "purpose-match" | "whats-missing";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  tag: string;
  /** Professions this drill applies to; omit or empty = all professions */
  professions?: OetProfession[];
}

export const CONTENT_DRILLS: ContentDrill[] = [
  {
    id: "drill-io-generic-1",
    type: "include-omit",
    prompt: "Discharge letter to community nurse. Include 'Patient prefers morning showers'?",
    options: ["Include — personal preference", "Omit — not relevant to handover", "Lead paragraph", "Subject line only"],
    correctIndex: 1,
    explanation: "Shower preference does not affect wound care or nursing actions.",
    tag: "writing:content-selection",
  },
  {
    id: "drill-io-generic-2",
    type: "include-omit",
    prompt: "Referral for medication side effect. Include exact medication start date?",
    options: ["Omit — too detailed", "Include — links symptom to drug", "Optional", "Verbal only"],
    correctIndex: 1,
    explanation: "Timeline connects the adverse effect to the medicine.",
    tag: "writing:content-selection",
  },
  {
    id: "drill-pm-generic-1",
    type: "purpose-match",
    prompt: "Best opening for a discharge handover to a named community nurse?",
    options: [
      "I am writing to hand over Mrs Patel's wound care following hip replacement.",
      "Mrs Patel had surgery last week.",
      "Nurses should read hospital notes.",
      "This patient is elderly.",
    ],
    correctIndex: 0,
    explanation: "States purpose, patient, and reason for writing.",
    tag: "writing:purpose",
  },
  {
    id: "drill-io-1",
    type: "include-omit",
    prompt: "Pharmacy referral for BP review + ankle swelling on amlodipine. Include 'Childhood asthma — resolved'?",
    options: ["Include — full history", "Omit — not relevant", "Include in opening only", "Include as main focus"],
    correctIndex: 1,
    explanation: "Resolved childhood asthma is irrelevant to this GP referral.",
    tag: "writing:content-selection",
    professions: ["pharmacy"],
  },
  {
    id: "drill-io-2",
    type: "include-omit",
    prompt: "Same pharmacy task. Include 'Smoker 10/day'?",
    options: ["Omit always", "Include — relevant lifestyle factor", "Only if space", "Put in subject line"],
    correctIndex: 1,
    explanation: "Smoking status can be relevant for cardiovascular management.",
    tag: "writing:content-selection",
    professions: ["pharmacy"],
  },
  {
    id: "drill-io-3",
    type: "include-omit",
    prompt: "Pharmacy BP referral. Include BP reading 142/88 mmHg?",
    options: ["No — too detailed", "Yes — required clinical fact", "Optional", "Only verbal handover"],
    correctIndex: 1,
    explanation: "Current BP is essential for a referral about blood pressure management.",
    tag: "writing:content-selection",
    professions: ["pharmacy"],
  },
  {
    id: "drill-pm-1",
    type: "purpose-match",
    prompt: "Best opening for pharmacy referral to Dr Chen about Mr Holt's BP?",
    options: [
      "I am writing to refer Mr James Holt for review of his blood pressure management.",
      "Mr Holt visited the pharmacy yesterday.",
      "Blood pressure is an important vital sign.",
      "Please read the attached notes.",
    ],
    correctIndex: 0,
    explanation: "Clear purpose, patient, and reason in one sentence.",
    tag: "writing:purpose",
    professions: ["pharmacy"],
  },
  {
    id: "drill-wm-1",
    type: "whats-missing",
    prompt: "Letter mentions BP and swelling but NOT amlodipine start date. Problem?",
    options: [
      "No problem",
      "Missing medication timeline — affects clinical picture",
      "Too much detail already",
      "Should remove BP instead",
    ],
    correctIndex: 1,
    explanation: "Linking swelling to recently started amlodipine requires the start date.",
    tag: "writing:content-selection",
    professions: ["pharmacy"],
  },
  {
    id: "drill-wm-2",
    type: "whats-missing",
    prompt: "Letter has clinical details but no request for appointment within 2 weeks. Effect?",
    options: ["Purpose criterion weak", "Language criterion only", "No effect", "Organisation only"],
    correctIndex: 0,
    explanation: "Task requires a clear action request — missing purpose/closing action.",
    tag: "writing:purpose",
  },
  // Profession-tagged drills — official case-note structures (Layer B)
  {
    id: "drill-io-medicine-1",
    type: "include-omit",
    prompt: "Referral to cardiologist for chest pain. Include 'Patient enjoys gardening'?",
    options: ["Include — rapport", "Omit — not clinically relevant", "Lead paragraph", "Subject only"],
    correctIndex: 1,
    explanation: "Hobbies do not affect cardiology referral unless task asks for psychosocial factors.",
    tag: "writing:content-selection",
    professions: ["medicine"],
  },
  {
    id: "drill-io-nursing-1",
    type: "include-omit",
    prompt: "Discharge to community nurse. Include current wound dimensions and dressing regime?",
    options: ["Omit", "Include — essential handover", "Optional", "Verbal only"],
    correctIndex: 1,
    explanation: "Wound size and dressing are core nursing handover facts.",
    tag: "writing:content-selection",
    professions: ["nursing"],
  },
  {
    id: "drill-io-dentistry-1",
    type: "include-omit",
    prompt: "Referral after extraction with dry socket. Include date of extraction?",
    options: ["No", "Yes — timeline for complication", "Optional", "Delete all dates"],
    correctIndex: 1,
    explanation: "Dry socket management requires when the extraction occurred.",
    tag: "writing:content-selection",
    professions: ["dentistry"],
  },
  {
    id: "drill-io-physio-1",
    type: "include-omit",
    prompt: "GP letter re low back pain. Include home exercise programme compliance?",
    options: ["Include — functional progress", "Omit always", "Subject line only", "Not relevant"],
    correctIndex: 0,
    explanation: "Compliance with exercises is clinically relevant for ongoing management.",
    tag: "writing:content-selection",
    professions: ["physiotherapy"],
  },
  {
    id: "drill-io-ot-1",
    type: "include-omit",
    prompt: "OT report to social services. Include ADL bathing score change?",
    options: ["Omit", "Include — demonstrates functional change", "Optional", "Verbal handover"],
    correctIndex: 1,
    explanation: "ADL scores show occupational therapy outcomes.",
    tag: "writing:content-selection",
    professions: ["occupational_therapy"],
  },
  {
    id: "drill-io-podiatry-1",
    type: "include-omit",
    prompt: "Diabetic foot review to GP. Include monofilament test result?",
    options: ["Yes — neuropathy screening", "No — too detailed", "Optional", "Delete"],
    correctIndex: 0,
    explanation: "Monofilament result is key diabetic foot assessment data.",
    tag: "writing:content-selection",
    professions: ["podiatry"],
  },
  {
    id: "drill-io-optometry-1",
    type: "include-omit",
    prompt: "Referral for visual field defect. Include IOP reading?",
    options: ["Include — glaucoma work-up", "Omit", "Not relevant", "Subject only"],
    correctIndex: 0,
    explanation: "Intraocular pressure supports ophthalmology referral.",
    tag: "writing:content-selection",
    professions: ["optometry"],
  },
  {
    id: "drill-io-dietetics-1",
    type: "include-omit",
    prompt: "Dietitian letter to GP re Type 2 diabetes. Include HbA1c trend?",
    options: ["Include — outcome measure", "Omit — diet only", "Optional", "Verbal"],
    correctIndex: 0,
    explanation: "HbA1c trend shows dietary intervention effectiveness.",
    tag: "writing:content-selection",
    professions: ["dietetics"],
  },
  {
    id: "drill-io-radiography-1",
    type: "include-omit",
    prompt: "Clarification letter about chest X-ray. Include comparison with prior film date?",
    options: ["Include — interval change", "Omit", "Not needed", "Delete dates"],
    correctIndex: 0,
    explanation: "Prior imaging date helps interpret interval change.",
    tag: "writing:content-selection",
    professions: ["radiography"],
  },
  {
    id: "drill-io-speech-1",
    type: "include-omit",
    prompt: "Swallowing assessment to nursing home. Include aspiration risk level?",
    options: ["Include — safety planning", "Omit", "Optional", "Verbal only"],
    correctIndex: 0,
    explanation: "Aspiration risk drives texture modification and supervision.",
    tag: "writing:content-selection",
    professions: ["speech_pathology"],
  },
  {
    id: "drill-io-vet-1",
    type: "include-omit",
    prompt: "Post-op update to owner. Include suture removal date?",
    options: ["Include — owner action required", "Omit", "Optional", "Not clinical"],
    correctIndex: 0,
    explanation: "Suture removal date is a clear owner instruction.",
    tag: "writing:content-selection",
    professions: ["veterinary_science"],
  },
  {
    id: "drill-pm-medicine-1",
    type: "purpose-match",
    prompt: "Best opening for cardiology referral about exertional chest pain?",
    options: [
      "I am writing to refer Mr Singh for assessment of exertional chest pain.",
      "Mr Singh has chest pain sometimes.",
      "Cardiology is a specialty.",
      "Please see attached.",
    ],
    correctIndex: 0,
    explanation: "Clear purpose, patient, and clinical reason.",
    tag: "writing:purpose",
    professions: ["medicine"],
  },
  {
    id: "drill-pm-nursing-1",
    type: "purpose-match",
    prompt: "Best opening for discharge handover to district nurse?",
    options: [
      "I am writing to hand over Mrs Okafor's post-operative wound care following discharge today.",
      "The patient went home.",
      "Nurses should read notes.",
      "Hospital discharge happens often.",
    ],
    correctIndex: 0,
    explanation: "States handover purpose with patient and clinical focus.",
    tag: "writing:purpose",
    professions: ["nursing"],
  },
];

export function drillsForProfession(profession?: string): ContentDrill[] {
  if (!profession) {
    return CONTENT_DRILLS.filter((d) => !d.professions?.length);
  }
  return CONTENT_DRILLS.filter(
    (d) => !d.professions?.length || d.professions.includes(profession as OetProfession),
  );
}

export function scoreDrills(
  answers: Record<string, number>,
  drills: ContentDrill[] = CONTENT_DRILLS,
): {
  score: number;
  pct: number;
  weakTags: string[];
} {
  let correct = 0;
  const wrongTags: string[] = [];
  for (const drill of drills) {
    const ans = answers[drill.id];
    if (ans === drill.correctIndex) {
      correct += 1;
    } else if (ans !== undefined) {
      wrongTags.push(drill.tag);
    }
  }
  const total = drills.length || 1;
  const pct = Math.round((correct / total) * 100);
  const weakTags = [...new Set(wrongTags.length ? wrongTags : ["writing:content-selection"])];
  return { score: correct, pct, weakTags };
}
