import type { QuizQuestion } from "@/content/reading/types";

/** OET healthcare vocabulary — phrases and words with explanations. */
export const VOCAB_BANK: QuizQuestion[] = [
  {
    id: "vocab-001",
    skill: "vocab",
    profession: "all",
    type: "mcq",
    difficulty: 1,
    tags: ["vocab:abbreviations"],
    prompt: "What does PRN mean on a medication chart?",
    options: ["As needed", "Every morning", "Before meals", "Do not administer"],
    correctAnswer: "As needed",
    explanation: "Pro re nata — give when required.",
  },
  {
    id: "vocab-002",
    skill: "vocab",
    profession: "all",
    type: "gap_fill",
    difficulty: 1,
    tags: ["vocab:clinical"],
    prompt: "The patient felt general ___ (unwellness) after the infusion.",
    options: ["malaise", "euphoria", "apathy", "vitality"],
    correctAnswer: "malaise",
    explanation: "Malaise = vague feeling of illness or discomfort.",
  },
  {
    id: "vocab-003",
    skill: "vocab",
    profession: "all",
    type: "mcq",
    difficulty: 2,
    tags: ["vocab:medications"],
    prompt: "'Stat' in a clinical order means…",
    options: ["Immediately", "Weekly", "With food", "At bedtime"],
    correctAnswer: "Immediately",
    explanation: "From Latin statim — do now.",
  },
  {
    id: "vocab-004",
    skill: "vocab",
    profession: "all",
    type: "true_false",
    difficulty: 1,
    tags: ["vocab:communication"],
    prompt: "True or false: 'Nil by mouth' means the patient must not eat or drink.",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation: "NBM / NPO — nothing orally.",
  },
  {
    id: "vocab-005",
    skill: "vocab",
    profession: "all",
    type: "mcq",
    difficulty: 2,
    tags: ["vocab:clinical"],
    prompt: "A 'differential diagnosis' is…",
    options: [
      "List of possible conditions",
      "Final confirmed diagnosis",
      "Patient's own theory",
      "Insurance code",
    ],
    correctAnswer: "List of possible conditions",
    explanation: "Working list while ruling conditions in or out.",
  },
  {
    id: "vocab-006",
    skill: "vocab",
    profession: "all",
    type: "gap_fill",
    difficulty: 2,
    tags: ["vocab:writing"],
    prompt: "Complete: Please ___ the patient to cardiology within two weeks.",
    options: ["refer", "defer", "discharge", "ignore"],
    correctAnswer: "refer",
    explanation: "Refer = send to another specialist — common in OET letters.",
  },
  {
    id: "vocab-007",
    skill: "vocab",
    profession: "all",
    type: "mcq",
    difficulty: 1,
    tags: ["vocab:listening"],
    prompt: "'Bilateral' means affecting…",
    options: ["Both sides", "One side only", "The heart", "The brain"],
    correctAnswer: "Both sides",
    explanation: "Bi- = two; lateral = side.",
  },
  {
    id: "vocab-008",
    skill: "vocab",
    profession: "all",
    type: "ordering",
    difficulty: 2,
    tags: ["vocab:handover"],
    prompt: "Order a safe handover (first → last):",
    options: [
      "Confirm patient identity",
      "State current problem",
      "List pending actions",
      "Sign off with name",
    ],
    correctAnswer: [
      "Confirm patient identity",
      "State current problem",
      "List pending actions",
      "Sign off with name",
    ],
    explanation: "Identity → situation → plan → accountability.",
  },
];

/** Short phrase cards for vocabulary study (not quiz format). */
export interface VocabPhrase {
  id: string;
  phrase: string;
  meaning: string;
  example: string;
  tags: string[];
}

export const VOCAB_PHRASES: VocabPhrase[] = [
  {
    id: "phr-001",
    phrase: "Presenting complaint",
    meaning: "Main reason the patient came for care",
    example: "Her presenting complaint was chest pain on exertion.",
    tags: ["vocab:clinical"],
  },
  {
    id: "phr-002",
    phrase: "On admission",
    meaning: "When the patient entered hospital or care",
    example: "On admission, observations were within normal limits.",
    tags: ["vocab:writing"],
  },
  {
    id: "phr-003",
    phrase: "For your information",
    meaning: "FYI — sharing without requiring action",
    example: "For your information, the patient declined the flu vaccine.",
    tags: ["vocab:writing"],
  },
  {
    id: "phr-004",
    phrase: "As discussed",
    meaning: "Referring to a prior conversation",
    example: "As discussed, I am writing to confirm the referral.",
    tags: ["vocab:writing"],
  },
  {
    id: "phr-005",
    phrase: "Nil by mouth",
    meaning: "Patient must not eat or drink",
    example: "The patient is nil by mouth from midnight.",
    tags: ["vocab:clinical"],
  },
];
