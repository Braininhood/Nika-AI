import type { RolePlayCard } from "./types";

export const MEDICINE_ROLE_CARDS: RolePlayCard[] = [
  {
    id: "s-med-001",
    profession: "medicine",
    difficulty: 2,
    countryCode: "UK",
    setting: "GP consultation room",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "General Practitioner",
    interlocutorRole: "Patient",
    cardText: {
      overview: "Patient with newly diagnosed Type 2 diabetes requesting lifestyle advice.",
      patientDetails: "Mr Thompson, 52, HbA1c 58 mmol/mol — diagnosed this week",
      yourTasks: [
        "Elicit ideas, concerns and expectations",
        "Give brief lifestyle advice on diet and exercise",
        "Agree a follow-up plan",
        "Check understanding",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Fears insulin injections", "Family history of amputation"],
      patientKnowledge: "Knows diagnosis is 'sugar diabetes', drinks 2L cola daily",
    },
    coaching: {
      iceQuestions: [
        "What do you understand about your recent test results?",
        "What concerns you most about this diagnosis?",
        "What would you like to achieve from today's visit?",
      ],
      structure: ["ICE", "Lifestyle advice", "Follow-up plan", "Check understanding"],
      phrasesToAvoid: ["You must stop everything", "It's your fault"],
      usefulPhrases: [
        "Many people worry about injections — we usually start with tablets and lifestyle changes.",
        "Small changes to drinks can make a big difference.",
      ],
      weakTags: ["speaking:ice-expectations", "speaking:structure"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Mr Thompson, thanks for coming in. What do you understand about your recent blood test?", annotation: "ICE — Ideas" },
      { speaker: "patient", line: "The nurse said I have diabetes. I'm scared I'll need injections like my uncle." },
      { speaker: "candidate", line: "What concerns you most about managing this?", annotation: "ICE — Concerns" },
      { speaker: "patient", line: "Losing my foot, like my uncle. And giving up everything I enjoy." },
      { speaker: "candidate", line: "Let's talk about practical steps. Reducing sugary drinks is a good first target.", annotation: "Information giving" },
      { speaker: "candidate", line: "We'll review your progress in six weeks. What will you change this week?", annotation: "Agree plan + check" },
    ],
  },
  {
    id: "s-med-002",
    profession: "medicine",
    difficulty: 3,
    countryCode: "US",
    setting: "Outpatient clinic",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Physician",
    interlocutorRole: "Patient",
    cardText: {
      overview: "Explain why specialist referral is needed for persistent reflux symptoms.",
      patientDetails: "Ms Chen, 45, 8 weeks of heartburn despite PPI",
      yourTasks: [
        "Acknowledge frustration with ongoing symptoms",
        "Explain reason for gastroenterology referral",
        "Describe what the specialist may do",
        "Address concerns and check understanding",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Worried about cancer", "Cannot afford specialist copay"],
      patientKnowledge: "Taking omeprazole 20mg daily, some relief but not complete",
    },
    coaching: {
      iceQuestions: [
        "How have the symptoms been affecting your daily life?",
        "What concerns you about seeing a specialist?",
      ],
      structure: ["Empathy", "Explain referral rationale", "Set expectations", "Check understanding"],
      phrasesToAvoid: ["You need a scope immediately", "It's probably cancer"],
      usefulPhrases: [
        "Persistent symptoms despite treatment are exactly why we refer.",
        "The specialist will decide if further tests are needed.",
      ],
      weakTags: ["speaking:clinical-comm", "speaking:language"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Ms Chen, I know eight weeks of symptoms is frustrating. Tell me how it's affecting you.", annotation: "Patient perspective" },
      { speaker: "patient", line: "I still get burning at night. I'm scared it could be something serious." },
      { speaker: "candidate", line: "Because symptoms persist on omeprazole, I'd like a gastroenterologist to assess you.", annotation: "Information giving" },
      { speaker: "candidate", line: "They may suggest an endoscopy — we'll discuss costs and options. What questions do you have?", annotation: "Check understanding" },
    ],
  },
];
