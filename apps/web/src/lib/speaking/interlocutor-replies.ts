import type { RolePlayCard } from "@/content/speaking";
import type { NikaVoiceMessage } from "@/lib/speaking/nika-voice";

/** First patient/carer line for live role-play. */
export function getOpeningLine(card: RolePlayCard): string {
  const interlocutor = card.modelDialogue.find(
    (l) => l.speaker === "patient" || l.speaker === "carer",
  );
  if (interlocutor) return interlocutor.line;

  const concern = card.hiddenFromCandidate.patientConcerns[0];
  if (concern) {
    return `Hello — I'm here about my appointment. ${concern.charAt(0).toUpperCase()}${concern.slice(1)}.`;
  }

  return `Hello. I'm here for the consultation about ${card.cardText.patientDetails.slice(0, 100).trim()}.`;
}

function lastUserText(messages: NikaVoiceMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]!.role === "user") return messages[i]!.text.toLowerCase();
  }
  return "";
}

function userTurnCount(messages: NikaVoiceMessage[]): number {
  return messages.filter((m) => m.role === "user").length;
}

function asksAboutConcerns(text: string): boolean {
  return /\b(concern|worri|afraid|scared|anxious|feel|upset|bother)/.test(text);
}

function asksAboutIdeas(text: string): boolean {
  return /\b(what do you know|understand|heard|explain|tell me about|what is|what are)\b/.test(
    text,
  );
}

function asksAboutExpectations(text: string): boolean {
  return /\b(expect|hope|plan|what will|what would|help you|need from)\b/.test(text);
}

function givesInformation(text: string): boolean {
  return /\b(recommend|advise|should|need to|important|make sure|prescribe|refer)\b/.test(
    text,
  );
}

function checksUnderstanding(text: string): boolean {
  return /\b(does that make sense|tell me back|repeat|any questions|clear)\b/.test(text);
}

/** Rule-based patient/carer reply — free, works offline. */
export function nextInterlocutorLine(
  card: RolePlayCard,
  messages: NikaVoiceMessage[],
): string {
  const userText = lastUserText(messages);
  const turn = userTurnCount(messages);
  const concerns = card.hiddenFromCandidate.patientConcerns;
  const knowledge = card.hiddenFromCandidate.patientKnowledge;

  if (!userText.trim()) {
    return "Sorry — could you say that again?";
  }

  if (turn === 1 && asksAboutConcerns(userText)) {
    return concerns[0] ?? "I'm mostly worried about what happens next.";
  }

  if (asksAboutIdeas(userText)) {
    return knowledge || "I don't know much yet — that's why I'm here.";
  }

  if (asksAboutConcerns(userText)) {
    const idx = Math.min(turn - 1, concerns.length - 1);
    return concerns[idx] ?? concerns[0] ?? "I'm not sure what to expect.";
  }

  if (asksAboutExpectations(userText)) {
    return "I'd like to know what I should do at home and when to come back if things get worse.";
  }

  if (givesInformation(userText) && !checksUnderstanding(userText)) {
    return "Okay… could you explain that in simpler terms? I want to make sure I understand.";
  }

  if (checksUnderstanding(userText)) {
    return "Yes — I'll do that. Thank you for explaining.";
  }

  const interlocutorLines = card.modelDialogue.filter((l) => l.speaker !== "candidate");
  if (interlocutorLines.length > 0) {
    const line = interlocutorLines[(turn - 1) % interlocutorLines.length]!;
    return line.line;
  }

  const fallbacks = [
    "I see. Can you tell me more about that?",
    "Is there anything I need to watch out for?",
    "What should I do if it doesn't improve?",
    "Thank you — that helps.",
  ];
  return fallbacks[(turn - 1) % fallbacks.length]!;
}

/** Candidate-only transcript for OET analysis. */
export function interlocutorLabel(card: RolePlayCard): string {
  return card.interlocutorRole.toLowerCase().includes("carer") ? "Carer" : "Patient";
}

export function buildCandidateTranscript(messages: NikaVoiceMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.text.trim())
    .filter(Boolean)
    .join(" ");
}

export function formatConversationTranscript(
  card: RolePlayCard,
  messages: NikaVoiceMessage[],
): string {
  const label = interlocutorLabel(card);
  return messages
    .map((m) => `${m.role === "user" ? "You" : label}: ${m.text}`)
    .join("\n\n");
}
