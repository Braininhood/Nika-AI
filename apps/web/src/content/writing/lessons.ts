import { lessonExamplesForProfession } from "@/content/writing/lesson-examples";

export interface LessonQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WritingLesson {
  id: string;
  criterion: string;
  title: string;
  intro: string;
  goodExample: string;
  weakExample: string;
  tip: string;
  questions: LessonQuestion[];
}

export const WRITING_LESSONS: WritingLesson[] = [
  {
    id: "w-lesson-purpose",
    criterion: "Purpose",
    title: "Purpose",
    intro:
      "OET assessors look for a clear purpose in the first two sentences. State who you are writing to, why you are writing, and what action you want.",
    goodExample:
      "I am writing to refer Mr James Holt for review of his blood pressure management following ankle swelling since starting amlodipine.",
    weakExample:
      "Mr Holt visited the pharmacy. He has some health issues I want to mention.",
    tip: "Use formula: I am writing to [refer/update/request] + reader + specific reason.",
    questions: [
      {
        id: "p1",
        prompt: "Best purpose sentence for a GP referral about BP?",
        options: [
          "I am writing to refer Mr Holt for blood pressure review.",
          "Mr Holt has high blood pressure.",
          "Please read the notes below.",
          "This letter is about a patient.",
        ],
        correctIndex: 0,
        explanation: "States purpose, reader role, and reason clearly.",
      },
      {
        id: "p2",
        prompt: "When should purpose appear?",
        options: ["End of letter", "First two sentences", "Subject line only", "Optional"],
        correctIndex: 1,
        explanation: "Assessors expect early clarity of purpose.",
      },
      {
        id: "p3",
        prompt: "A discharge letter to a community nurse should open with…",
        options: [
          "Purpose of discharge and handover",
          "Hospital cafeteria menu",
          "Doctor's personal opinion",
          "Unrelated patient trivia",
        ],
        correctIndex: 0,
        explanation: "Purpose must match the task and reader.",
      },
    ],
  },
  {
    id: "w-lesson-content",
    criterion: "Content",
    title: "Content",
    intro:
      "Include all task-relevant case notes; omit irrelevant history. Paraphrase — do not copy entire notes verbatim.",
    goodExample:
      "His BP today was 142/88 mmHg. He reports bilateral ankle swelling four days after commencing amlodipine 5 mg daily.",
    weakExample:
      "Copy-pasting every note including resolved childhood asthma unrelated to the referral.",
    tip: "Match each task bullet to a sentence in your letter.",
    questions: [
      {
        id: "c1",
        prompt: "Resolved childhood asthma in a BP referral letter — include?",
        options: ["Yes, full paragraph", "No, omit as irrelevant", "Only if space left", "In subject line"],
        correctIndex: 1,
        explanation: "Irrelevant content lowers Content score.",
      },
      {
        id: "c2",
        prompt: "Task asks to mention smoking status. Case note says 10/day. You should…",
        options: ["Omit", "Include accurately", "Invent pack-years", "Say 'non-smoker'"],
        correctIndex: 1,
        explanation: "Required facts from notes must appear.",
      },
      {
        id: "c3",
        prompt: "Best approach to case notes?",
        options: ["Copy all bullets", "Select and paraphrase relevant facts", "Summarise from memory", "Ignore notes"],
        correctIndex: 1,
        explanation: "Selection + accurate paraphrase = strong Content.",
      },
    ],
  },
  {
    id: "w-lesson-concise",
    criterion: "Conciseness & Clarity",
    title: "Conciseness & Clarity",
    intro: "Aim for 180–200 words. Remove redundancy; one idea per sentence.",
    goodExample: "He commenced amlodipine 5 mg on 05/06/26 and developed ankle swelling four days later.",
    weakExample:
      "He started a medication which is called amlodipine and it was started recently and then he got swelling in both ankles which is swelling.",
    tip: "Cut filler: 'It is important to note that…', 'As you know…'",
    questions: [
      {
        id: "x1",
        prompt: "Typical OET letter word count target?",
        options: ["80–100", "180–200", "350–400", "No limit"],
        correctIndex: 1,
        explanation: "180–200 words is the usual exam range.",
      },
      {
        id: "x2",
        prompt: "Which is most concise?",
        options: [
          "BP 142/88 mmHg today",
          "The blood pressure reading that was taken today was elevated",
          "There is a blood pressure issue",
          "Numbers were done",
        ],
        correctIndex: 0,
        explanation: "Clinical facts stated directly.",
      },
    ],
  },
  {
    id: "w-lesson-genre",
    criterion: "Genre & Style",
    title: "Genre & Style",
    intro: "Use formal clinical register. Avoid slang, opinion, and overly casual phrasing.",
    goodExample: "I would be grateful if you could review his medication within two weeks.",
    weakExample: "Can you sort his meds ASAP — the guy is worried.",
    tip: "Third person for patient; polite requests to colleagues.",
    questions: [
      {
        id: "g1",
        prompt: "Appropriate closing request to a GP?",
        options: [
          "I would appreciate an appointment within two weeks.",
          "Sort it when you can.",
          "He needs fixing.",
          "LOL thanks",
        ],
        correctIndex: 0,
        explanation: "Formal, professional tone.",
      },
      {
        id: "g2",
        prompt: "Patient reference in referral letters?",
        options: ["First name only", "Mr/Mrs + surname", "Nickname", "Hey patient"],
        correctIndex: 1,
        explanation: "Standard formal address.",
      },
    ],
  },
  {
    id: "w-lesson-org",
    criterion: "Organisation & Layout",
    title: "Organisation & Layout",
    intro: "Use standard letter layout: date, address, salutation, body paragraphs, closing.",
    goodExample: "Opening purpose → clinical details → request → professional close.",
    weakExample: "One long paragraph with no structure or signposting.",
    tip: "Separate paragraphs: presentation, history/meds, request.",
    questions: [
      {
        id: "o1",
        prompt: "Minimum paragraph structure for a referral?",
        options: ["One block", "At least 3 logical paragraphs", "Bullet list only", "No salutation"],
        correctIndex: 1,
        explanation: "Organisation expects clear sections.",
      },
      {
        id: "o2",
        prompt: "Where does the action request belong?",
        options: ["Hidden at end only", "Clear before closing", "Not needed", "In P.S. only"],
        correctIndex: 1,
        explanation: "Reader must see requested action clearly.",
      },
    ],
  },
  {
    id: "w-lesson-language",
    criterion: "Language",
    title: "Language",
    intro: "Accurate grammar, spelling, and professional vocabulary. Errors that impede meaning reduce this score.",
    goodExample:
      "bilateral ankle oedema; commenced; appropriate clinical verbs for review requests.",
    weakExample: "swollen foots; started medicine with spelling errors.",
    tip: "Proofread drug names and doses carefully.",
    questions: [
      {
        id: "l1",
        prompt: "Correct spelling?",
        options: ["Hypertension", "Hipertention", "Hypertenssion", "Hypertention"],
        correctIndex: 0,
        explanation: "Clinical terms must be spelled correctly.",
      },
      {
        id: "l2",
        prompt: "Grammar: 'He have been taking…'",
        options: ["Correct", "Incorrect — subject-verb agreement", "Optional in OET", "Formal style"],
        correctIndex: 1,
        explanation: "Basic grammar errors affect Language score.",
      },
    ],
  },
];

export function getLesson(id: string): WritingLesson | undefined {
  return WRITING_LESSONS.find((l) => l.id === id);
}

/** Merge base lesson with profession-specific examples when available. */
export function getLessonForProfession(
  id: string,
  profession?: string,
): WritingLesson | undefined {
  const base = getLesson(id);
  if (!base || !profession) return base;

  const overrides = lessonExamplesForProfession(profession)[
    id as keyof ReturnType<typeof lessonExamplesForProfession>
  ];
  if (!overrides) return base;

  return {
    ...base,
    goodExample: overrides.goodExample,
    weakExample: overrides.weakExample,
  };
}
