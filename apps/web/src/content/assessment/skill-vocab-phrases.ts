import type { VocabPhrase } from "@/content/assessment/vocab-bank";

/** Must-know phrases by OET skill — shown in vocabulary panel and study hubs. */
export const READING_PHRASES: VocabPhrase[] = [
  { id: "r-phr-001", phrase: "Expeditious reading", meaning: "Fast, targeted reading to locate answers quickly (Part A skill)", example: "Part A rewards expeditious reading — scan for keywords, not full comprehension.", tags: ["vocab:reading", "reading:part-a"] },
  { id: "r-phr-002", phrase: "Gist", meaning: "Main idea or general meaning of a text", example: "Part B often asks for the gist of an email or notice.", tags: ["vocab:reading", "reading:part-b"] },
  { id: "r-phr-003", phrase: "Writer's attitude", meaning: "The author's stance — cautious, optimistic, sceptical, etc.", example: "Part C may ask whether the writer is 'encouraging but cautious'.", tags: ["vocab:reading", "reading:part-c"] },
  { id: "r-phr-004", phrase: "Paraphrase", meaning: "Same meaning in different words — OET distractors use paraphrases", example: "The option 'fluid restriction' paraphrases 'limit oral intake'.", tags: ["vocab:reading", "reading:part-c"] },
  { id: "r-phr-005", phrase: "Workplace extract", meaning: "Short professional text — email, memo, policy snippet (Part B)", example: "Each Part B extract has one MCQ about purpose or next action.", tags: ["vocab:reading", "reading:part-b"] },
  { id: "r-phr-006", phrase: "Matching (Text A–D)", meaning: "Part A format — four labelled texts, match statements to A, B, C, or D", example: "Question 3 matches Text C because it mentions the pharmacy rota.", tags: ["vocab:reading", "reading:part-a"] },
  { id: "r-phr-007", phrase: "Skim vs scan", meaning: "Skim = general overview; scan = hunt for specific words/numbers", example: "Skim Part C headings first, then scan for the question keyword.", tags: ["vocab:reading"] },
  { id: "r-phr-008", phrase: "True but irrelevant", meaning: "A distractor stated in the text but not answering the question", example: "Reject options that are true in the passage but off-topic for the stem.", tags: ["vocab:reading", "reading:part-b"] },
];

export const LISTENING_PHRASES: VocabPhrase[] = [
  { id: "l-phr-001", phrase: "Note completion", meaning: "Part A task — fill gaps in consultation notes while listening", example: "Complete the medication dose in the consultation notes.", tags: ["vocab:listening", "listening:part-a"] },
  { id: "l-phr-002", phrase: "Consultation extract", meaning: "Patient–clinician dialogue used in Part A", example: "The consultation extract mentions a three-week history of back pain.", tags: ["vocab:listening", "listening:part-a"] },
  { id: "l-phr-003", phrase: "Handover", meaning: "Transfer of care between professionals — common Part B context", example: "The nurse's handover notes fluid restriction for heart failure.", tags: ["vocab:listening", "listening:part-b"] },
  { id: "l-phr-004", phrase: "Spelling counts", meaning: "Drug names and conditions must be spelled correctly for credit", example: "Listen for letter-by-letter spelling of 'amlodipine'.", tags: ["vocab:listening", "listening:spelling"] },
  { id: "l-phr-005", phrase: "Signpost phrase", meaning: "Discourse marker showing shift — however, in contrast, the main concern", example: "Part C questions follow signpost phrases in the recording.", tags: ["vocab:listening", "listening:part-c"] },
  { id: "l-phr-006", phrase: "One play only", meaning: "Exam mode — audio plays once without pause or rewind", example: "In exam mode the consultation audio plays once.", tags: ["vocab:listening"] },
  { id: "l-phr-007", phrase: "Bilateral", meaning: "Both sides of the body", example: "Bilateral ankle swelling was noted on examination.", tags: ["vocab:listening", "vocab:clinical"] },
  { id: "l-phr-008", phrase: "PRN / stat / bd / tds", meaning: "Common chart abbreviations — as needed, immediately, twice daily, three times daily", example: "Paracetamol 1 g qds PRN; metoclopramide 10 mg stat.", tags: ["vocab:listening", "vocab:abbreviations"] },
];

export const WRITING_PHRASES: VocabPhrase[] = [
  { id: "w-phr-001", phrase: "I am writing to refer…", meaning: "Standard Purpose opening for a referral letter", example: "I am writing to refer Mr Ahmed for cardiology review.", tags: ["vocab:writing", "writing:purpose"] },
  { id: "w-phr-002", phrase: "I would be grateful if you could…", meaning: "Polite request for action — Organisation & Language", example: "I would be grateful if you could arrange an appointment within two weeks.", tags: ["vocab:writing", "writing:language"] },
  { id: "w-phr-003", phrase: "For your information", meaning: "FYI — sharing without requiring action from reader", example: "For your information, the patient declined the influenza vaccine.", tags: ["vocab:writing"] },
  { id: "w-phr-004", phrase: "As discussed", meaning: "Links letter to a prior conversation", example: "As discussed, I am writing to confirm the discharge plan.", tags: ["vocab:writing"] },
  { id: "w-phr-005", phrase: "Conciseness", meaning: "Include only relevant case details — do not copy all notes", example: "Conciseness marks drop if you paste the entire case note.", tags: ["vocab:writing", "writing:conciseness"] },
  { id: "w-phr-006", phrase: "Genre & Style", meaning: "Formal clinical register appropriate to letter type", example: "Use formal register — avoid chatty language in a discharge letter.", tags: ["vocab:writing", "writing:genre"] },
  { id: "w-phr-007", phrase: "On admission / on discharge", meaning: "Time anchors common in referral and discharge letters", example: "On admission, observations were within normal limits.", tags: ["vocab:writing"] },
  { id: "w-phr-008", phrase: "Please do not hesitate to contact me", meaning: "Standard professional closing phrase", example: "Please do not hesitate to contact me if you require further information.", tags: ["vocab:writing", "writing:language"] },
];

export const SPEAKING_PHRASES: VocabPhrase[] = [
  { id: "s-phr-001", phrase: "ICE", meaning: "Ideas, Concerns, Expectations — patient-centred framework", example: "What concerns you most about starting insulin?", tags: ["vocab:speaking", "speaking:ice-expectations"] },
  { id: "s-phr-002", phrase: "Teach-back", meaning: "Ask patient to explain back — checks understanding", example: "Can you tell me how you will take this medicine at home?", tags: ["vocab:speaking"] },
  { id: "s-phr-003", phrase: "Open question", meaning: "Cannot be answered yes/no — gathers information", example: "Tell me what you understand about your diagnosis.", tags: ["vocab:speaking", "speaking:structure"] },
  { id: "s-phr-004", phrase: "Empathy phrase", meaning: "Acknowledge feelings before giving information", example: "I can see this has been worrying for you.", tags: ["vocab:speaking", "speaking:clinical-communication"] },
  { id: "s-phr-005", phrase: "Signposting", meaning: "Preview what you will cover in the consultation", example: "First I'll ask a few questions, then we'll discuss the plan.", tags: ["vocab:speaking", "speaking:structure"] },
  { id: "s-phr-006", phrase: "Role-play card", meaning: "Scenario brief — patient details and tasks for the candidate", example: "The role-play card lists tasks you must address in five minutes.", tags: ["vocab:speaking"] },
  { id: "s-phr-007", phrase: "Prep time (3 min)", meaning: "Exam preparation before each role-play — notes allowed, not assessed", example: "Use prep time to plan ICE questions and key explanations.", tags: ["vocab:speaking"] },
  { id: "s-phr-008", phrase: "Interlocutor", meaning: "Examiner playing patient/carer in the role-play", example: "The interlocutor may withhold information until you ask.", tags: ["vocab:speaking"] },
];

export const ALL_SKILL_PHRASES: VocabPhrase[] = [
  ...READING_PHRASES,
  ...LISTENING_PHRASES,
  ...WRITING_PHRASES,
  ...SPEAKING_PHRASES,
];

export function phrasesForSkill(skill: "reading" | "listening" | "writing" | "speaking"): VocabPhrase[] {
  switch (skill) {
    case "reading":
      return READING_PHRASES;
    case "listening":
      return LISTENING_PHRASES;
    case "writing":
      return WRITING_PHRASES;
    case "speaking":
      return SPEAKING_PHRASES;
  }
}
