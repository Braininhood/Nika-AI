import type { RolePlayCard } from "./types";

export const PHARMACY_ROLE_CARDS: RolePlayCard[] = [
  {
    id: "s-pharm-001",
    profession: "pharmacy",
    difficulty: 2,
    countryCode: "AU",
    setting: "Community pharmacy consultation room",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Pharmacist",
    interlocutorRole: "Patient",
    cardText: {
      overview:
        "A patient has been prescribed warfarin for the first time and has come to the pharmacy with questions.",
      patientDetails: "Mr Ahmed, 65, new prescription warfarin 5mg daily",
      yourTasks: [
        "Find out what the patient already understands about warfarin",
        "Address concerns about diet and alcohol",
        "Explain when to seek urgent medical help",
        "Check the patient understands",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Worried about bleeding", "Friend said avoid all green vegetables"],
      patientKnowledge: "Knows it is a blood thinner, unsure about monitoring",
    },
    coaching: {
      iceQuestions: [
        "What do you already know about warfarin?",
        "What concerns you most about this medication?",
        "What do you expect from today's conversation?",
      ],
      structure: [
        "Greeting and rapport",
        "Elicit ICE",
        "Address diet/alcohol concerns",
        "Safety signs — when to seek help",
        "Check understanding",
        "Close",
      ],
      phrasesToAvoid: ["You'll be fine", "Don't worry about it", "Just take it"],
      usefulPhrases: [
        "Some people worry about bleeding — that's a sensible concern.",
        "Let me explain when you should contact a doctor urgently.",
        "Can you tell me how you'll remember to take this each day?",
      ],
      weakTags: ["speaking:ice-expectations", "speaking:clinical-comm"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Good morning, Mr Ahmed. I'm Sarah, the pharmacist. How can I help you today?", annotation: "Relationship building" },
      { speaker: "patient", line: "I've just been given warfarin and I'm not sure what to expect." },
      { speaker: "candidate", line: "That's understandable. What do you already know about warfarin?", annotation: "ICE — Ideas" },
      { speaker: "patient", line: "I know it thins the blood. A friend said I can't eat any green vegetables." },
      { speaker: "candidate", line: "What concerns you most about starting this medicine?", annotation: "ICE — Concerns" },
      { speaker: "patient", line: "Bleeding, mainly. And whether I can have a glass of wine." },
      { speaker: "candidate", line: "Let me address those. First, you don't need to avoid all green vegetables — consistency matters more.", annotation: "Information giving — chunked" },
      { speaker: "candidate", line: "If you notice unusual bruising, blood in urine, or vomit that looks like coffee grounds, seek urgent help.", annotation: "Safety information" },
      { speaker: "candidate", line: "Can you tell me back when you would call a doctor urgently?", annotation: "Check understanding" },
      { speaker: "patient", line: "If I see bruising or blood, or dark vomit." },
      { speaker: "candidate", line: "Exactly. Do you have any other questions before you go?", annotation: "Close" },
    ],
  },
  {
    id: "s-pharm-002",
    profession: "pharmacy",
    difficulty: 2,
    countryCode: "UK",
    setting: "Community pharmacy counter",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Pharmacist",
    interlocutorRole: "Patient",
    cardText: {
      overview:
        "A patient requests OTC ibuprofen for knee pain. They mention stomach problems and are already taking aspirin.",
      patientDetails: "Mrs Patel, 58, knee pain after gardening",
      yourTasks: [
        "Elicit full medication history and symptoms",
        "Explain risks of NSAID with aspirin",
        "Recommend appropriate action including GP referral if needed",
        "Check understanding",
      ],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Does not want to bother GP", "Thinks pharmacy should just sell the tablets"],
      patientKnowledge: "Takes aspirin 75mg daily for heart protection",
      omittedFacts: ["Epigastric pain after meals for 2 weeks"],
    },
    coaching: {
      iceQuestions: [
        "Can you tell me about the pain and how long you've had it?",
        "What medications are you taking at the moment?",
        "What were you hoping we could do today?",
      ],
      structure: ["Greeting", "History", "Risk explanation", "Recommendation", "Check understanding"],
      phrasesToAvoid: ["Just take paracetamol", "It's only OTC so it's safe"],
      usefulPhrases: [
        "Because you're already on aspirin, adding ibuprofen increases stomach bleeding risk.",
        "I'd recommend speaking with your GP about safer pain relief.",
      ],
      weakTags: ["speaking:structure", "speaking:language"],
    },
    modelDialogue: [
      { speaker: "candidate", line: "Hello, Mrs Patel. You mentioned knee pain — can you tell me when it started?", annotation: "Open question" },
      { speaker: "patient", line: "Yesterday after gardening. I just need some ibuprofen." },
      { speaker: "candidate", line: "What other medicines do you take regularly?", annotation: "Information gathering" },
      { speaker: "patient", line: "Aspirin 75mg for my heart." },
      { speaker: "candidate", line: "Have you had any stomach discomfort recently?", annotation: "Elicit omitted info" },
      { speaker: "patient", line: "A bit of burning after meals, about two weeks." },
      { speaker: "candidate", line: "Given the aspirin and stomach symptoms, ibuprofen may not be the safest choice.", annotation: "Information giving" },
      { speaker: "candidate", line: "I'd suggest a GP review for pain management. Does that sound reasonable?", annotation: "Check understanding" },
    ],
  },
];
