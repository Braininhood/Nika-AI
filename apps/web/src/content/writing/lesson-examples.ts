import type { OetProfession } from "@/lib/domain/types";
import { getProfessionLabel } from "@/lib/domain/professions";

/** Per-profession lesson example overrides (all 6 criterion lessons × 12 professions). */
export interface LessonExampleOverride {
  goodExample: string;
  weakExample: string;
}

const LESSON_IDS = [
  "w-lesson-purpose",
  "w-lesson-content",
  "w-lesson-concise",
  "w-lesson-genre",
  "w-lesson-org",
  "w-lesson-language",
] as const;

type LessonId = (typeof LESSON_IDS)[number];

function pack(
  entries: [LessonId, LessonExampleOverride][],
): Partial<Record<LessonId, LessonExampleOverride>> {
  return Object.fromEntries(entries) as Partial<Record<LessonId, LessonExampleOverride>>;
}

export const PROFESSION_LESSON_EXAMPLES: Record<
  OetProfession,
  Partial<Record<LessonId, LessonExampleOverride>>
> = {
  pharmacy: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Mr James Holt for review of his blood pressure management following ankle swelling since starting amlodipine.",
      weakExample: "Mr Holt came to the pharmacy. He has some health problems I want to tell you about.",
    }],
    ["w-lesson-content", {
      goodExample:
        "BP 142/88 mmHg today; amlodipine 5 mg started 05/06/26; bilateral ankle swelling ×4 days; smokes 10/day.",
      weakExample: "Lists childhood asthma, BP number, and 'swollen ankles' with no dates or doses.",
    }],
  ]),
  nursing: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to hand over Mrs Geeta Patel's wound care following hip replacement on day 5 post-operatively.",
      weakExample: "Mrs Patel had hip surgery. She is going home.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Wound healing well; dressing change demonstrated; daughter trained to assist at home.",
      weakExample: "Includes patient shower preference but omits dressing education and wound status.",
    }],
  ]),
  medicine: pack([
    ["w-lesson-purpose", {
      goodExample:
        "Thank you for referring Mrs Elena Lopez for investigation of persistent fatigue over three months.",
      weakExample: "I saw Mrs Lopez about tiredness.",
    }],
    ["w-lesson-content", {
      goodExample:
        "FBC normal; TSH 6.2 mIU/L; night-shift work noted; repeat TFTs in six weeks planned.",
      weakExample: "Mentions holiday plans and 'tests done' without results or management.",
    }],
  ]),
  dentistry: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Mr Chidi Okafor for assessment of symptomatic lower third molars.",
      weakExample: "Mr Okafor has tooth pain.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Pericoronal pain LL8 ×3 weeks; OPG mesioangular partial LL8; mild asthma on salbutamol PRN.",
      weakExample: "Includes graphic design job but not radiograph findings or medical history for surgery.",
    }],
  ]),
  physiotherapy: pack([
    ["w-lesson-purpose", {
      goodExample:
        "Thank you for referring Ms Laura Turner with subacute low back pain of six weeks without red flags.",
      weakExample: "Laura came for physio.",
    }],
    ["w-lesson-content", {
      goodExample:
        "SLR negative; six sessions completed; pain NPRS 7→3; discharged with home exercise programme.",
      weakExample: "Notes marathon running but not treatment provided or functional outcome.",
    }],
  ]),
  occupational_therapy: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to summarise occupational therapy input following Mr Minh Nguyen's mild stroke and discharge home.",
      weakExample: "Mr Nguyen went home after stroke.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Grab rails, shower chair, raised toilet seat installed; wife trained; Meals on Wheels arranged.",
      weakExample: "Says 'got rails' without equipment list or carer training documented.",
    }],
  ]),
  podiatry: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Mr Alan Peters for urgent vascular assessment of a non-healing plantar ulcer.",
      weakExample: "Patient has foot ulcer.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Ulcer 1.2 cm plantar left; HbA1c 68 mmol/mol; weak DP pulses; offloading boot supplied.",
      weakExample: "Mentions football hobby but not ulcer size, diabetes control, or pulses.",
    }],
  ]),
  optometry: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Mrs Diane Collins for assessment of suspected primary open-angle glaucoma.",
      weakExample: "Mrs Collins eye test.",
    }],
    ["w-lesson-content", {
      goodExample:
        "IOP 24/26 mmHg; cup-to-disc 0.6; RNFL thinning OCT; family history glaucoma; latanoprost started.",
      weakExample: "Says 'pressures high' without values, disc findings, or interim treatment.",
    }],
  ]),
  dietetics: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to outline the dietary management plan agreed with Mr Yusuf Hassan for new type 2 diabetes.",
      weakExample: "I met Mr Hassan about food.",
    }],
    ["w-lesson-content", {
      goodExample:
        "BMI 31; irregular meals; plan: portion control, reduce sugar, increase fibre; review in 4 weeks.",
      weakExample: "Says 'eats badly' without agreed recommendations or follow-up.",
    }],
  ]),
  radiography: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing regarding a chest X-ray performed on 8 June 2026 for persistent cough.",
      weakExample: "CXR done for cough.",
    }],
    ["w-lesson-content", {
      goodExample:
        "6 mm RUL nodule; lungs otherwise clear; 20 pack-year smoking history; GP to arrange CT per guideline.",
      weakExample: "Says 'small spot' without size, location, or follow-up recommendation.",
    }],
  ]),
  speech_pathology: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Mr Geoff Edwards for urgent ENT assessment of progressive dysphagia to solids over eight weeks.",
      weakExample: "Mr Edwards swallowing problems.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Weight loss 3 kg; VFSS residue valleculae; IDDSI Level 5 diet; ex-smoker with hoarse voice.",
      weakExample: "Notes retired teacher but omits VFSS findings and weight loss.",
    }],
  ]),
  veterinary_science: pack([
    ["w-lesson-purpose", {
      goodExample:
        "I am writing to refer Bella for surgical assessment of a comminuted mid-tibial fracture of the right hind limb.",
      weakExample: "Dog with broken leg.",
    }],
    ["w-lesson-content", {
      goodExample:
        "Hit by car; comminuted mid-tibial fracture RH; morphine CRI + buprenorphine; chest clear; PCV 38%.",
      weakExample: "Mentions pet insurance but not analgesia, imaging findings, or stability.",
    }],
  ]),
};

function defaultExamplesForProfession(
  profession: OetProfession,
): Partial<Record<LessonId, LessonExampleOverride>> {
  const role = getProfessionLabel(profession).toLowerCase();
  return {
    "w-lesson-concise": {
      goodExample: `Each sentence adds one new clinical fact — typical ${role} letters stay within 180–200 words.`,
      weakExample: `Repeating the same finding in three sentences without new information.`,
    },
    "w-lesson-genre": {
      goodExample: `I would be grateful if you could arrange review within two weeks — polite, formal colleague request.`,
      weakExample: `Sort this out when you can — register too informal for ${role} correspondence.`,
    },
    "w-lesson-org": {
      goodExample: `Purpose in opening → selected clinical detail → explicit request → professional sign-off.`,
      weakExample: `Single unstructured paragraph mixing unrelated facts with no clear reader action.`,
    },
    "w-lesson-language": {
      goodExample: `Correct spelling of medications, doses, and anatomy; professional clinical vocabulary throughout.`,
      weakExample: `Spelling errors in drug names or grammar mistakes that impede meaning.`,
    },
  };
}

export function lessonExamplesForProfession(
  profession?: string,
): Partial<Record<LessonId, LessonExampleOverride>> {
  if (!profession) return {};
  const key = profession as OetProfession;
  const specific = PROFESSION_LESSON_EXAMPLES[key] ?? {};
  return { ...defaultExamplesForProfession(key), ...specific };
}
