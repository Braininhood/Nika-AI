import type { RolePlayCard } from "./types";

export const NURSING_ROLE_CARDS: RolePlayCard[] = [
  {
    id: "s-nurs-001",
    profession: "nursing",
    difficulty: 2,
    countryCode: "AU",
    setting: "Surgical ward — bedside",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Registered Nurse",
    interlocutorRole: "Patient",
    cardText: {
      overview: "A patient is anxious about upcoming laparoscopic cholecystectomy tomorrow.",
      patientDetails: "Ms Rivera, 42, admitted for elective cholecystectomy",
      yourTasks: [
        "Acknowledge anxiety and elicit concerns",
        "Explain pre-op fasting and what to expect on the day",
        "Answer questions about pain management after surgery",
        "Check understanding",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Afraid of general anaesthetic", "Worried about being in pain"],
      patientKnowledge: "Knows gallbladder is being removed, unclear about recovery",
    },
    coaching: {
      iceQuestions: [
        "How are you feeling about tomorrow's surgery?",
        "What concerns you most?",
        "What do you already know about the procedure?",
      ],
      structure: ["Rapport", "ICE", "Pre-op instructions", "Post-op expectations", "Check understanding"],
      phrasesToAvoid: ["Don't be silly", "Everyone feels that way"],
      usefulPhrases: [
        "It's normal to feel nervous before surgery.",
        "Let me walk you through what will happen tomorrow morning.",
      ],
      weakTags: ["speaking:ice-expectations", "speaking:clinical-comm"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Good afternoon, Ms Rivera. I'm James, your nurse. How are you feeling?", annotation: "Relationship building" },
      { speaker: "patient", line: "Quite nervous, to be honest." },
      { speaker: "candidate", line: "That's completely understandable. What worries you most?", annotation: "ICE — Concerns" },
      { speaker: "patient", line: "The anaesthetic. And pain afterwards." },
      { speaker: "candidate", line: "First, you'll need to fast from midnight — no food or drink.", annotation: "Structured information giving" },
      { speaker: "candidate", line: "After surgery, we'll manage pain with regular medication. Can you tell me what you'll do about eating tonight?", annotation: "Check understanding" },
    ],
  },
  {
    id: "s-nurs-002",
    profession: "nursing",
    difficulty: 2,
    countryCode: "IE",
    setting: "Community clinic — wound review",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Registered Nurse",
    interlocutorRole: "Patient",
    cardText: {
      overview: "Teach a patient how to change a surgical wound dressing at home.",
      patientDetails: "Mr O'Brien, 70, post-op abdominal wound — day 5",
      yourTasks: [
        "Assess what the patient already knows about wound care",
        "Demonstrate and explain dressing change steps",
        "Explain signs of infection to watch for",
        "Check understanding and confidence",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Worried about doing it wrong", "Lives alone"],
      patientKnowledge: "Has been shown once in hospital but forgot details",
    },
    coaching: {
      iceQuestions: [
        "What do you remember from the hospital about dressing changes?",
        "What concerns you about managing this at home?",
      ],
      structure: ["Assess prior knowledge", "Step-by-step teaching", "Red flags", "Check understanding"],
      phrasesToAvoid: ["It's easy", "You should know this"],
      usefulPhrases: [
        "Let's go through each step slowly.",
        "If you see increasing redness, warmth, or discharge, contact the clinic.",
      ],
      weakTags: ["speaking:structure", "speaking:language"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Mr O'Brien, before we start — what do you remember about changing the dressing?", annotation: "Check prior knowledge" },
      { speaker: "patient", line: "Wash hands, I think. But I'm worried I'll do it wrong." },
      { speaker: "candidate", line: "That's a valid concern. First, wash your hands with soap for 20 seconds.", annotation: "Chunked instruction" },
      { speaker: "candidate", line: "Can you show me how you'd check for signs of infection?", annotation: "Check understanding" },
    ],
  },
];
