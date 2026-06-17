import { describe, expect, it } from "vitest";

import type { RolePlayCard } from "@/content/speaking";
import {
  buildCandidateTranscript,
  getOpeningLine,
  nextInterlocutorLine,
} from "@/lib/speaking/interlocutor-replies";
import type { NikaVoiceMessage } from "@/lib/speaking/nika-voice";

function mockCard(): RolePlayCard {
  return {
    id: "sp-test",
    profession: "nursing",
    difficulty: 2,
    countryCode: "UK",
    setting: "Ward",
    durationMinutes: 5,
    prepMinutes: 3,
    candidateRole: "Nurse",
    interlocutorRole: "Patient",
    cardText: {
      overview: "Post-op pain",
      patientDetails: "Mr Jones, day 1 post knee replacement",
      yourTasks: ["Assess pain", "Explain analgesia"],
    },
    hiddenFromCandidate: {
      patientConcerns: ["Worried about addiction to painkillers"],
      patientKnowledge: "Knows he had surgery yesterday",
    },
    coaching: {
      iceQuestions: [],
      structure: [],
      phrasesToAvoid: [],
      usefulPhrases: [],
      weakTags: [],
    },
    modelDialogue: [
      { speaker: "patient", line: "Hello nurse, my knee really hurts." },
      { speaker: "candidate", line: "Good morning, I'll help with your pain." },
    ],
  };
}

describe("getOpeningLine", () => {
  it("uses first patient model line", () => {
    expect(getOpeningLine(mockCard())).toBe("Hello nurse, my knee really hurts.");
  });
});

describe("nextInterlocutorLine", () => {
  it("responds to concern questions", () => {
    const messages: NikaVoiceMessage[] = [
      { role: "nika", text: "Hello", timestamp: 1 },
      { role: "user", text: "What concerns do you have?", timestamp: 2 },
    ];
    expect(nextInterlocutorLine(mockCard(), messages)).toMatch(/worried|painkiller/i);
  });
});

describe("buildCandidateTranscript", () => {
  it("joins user lines only", () => {
    const messages: NikaVoiceMessage[] = [
      { role: "nika", text: "Hi", timestamp: 1 },
      { role: "user", text: "Good morning.", timestamp: 2 },
      { role: "user", text: "Tell me about your pain.", timestamp: 3 },
    ];
    expect(buildCandidateTranscript(messages)).toBe(
      "Good morning. Tell me about your pain.",
    );
  });
});
