import type { RolePlayCard } from "@/content/speaking";
import { apiUrl } from "@/lib/api/base-url";
import {
  getOpeningLine,
  nextInterlocutorLine,
} from "@/lib/speaking/interlocutor-replies";
import type { NikaVoiceMessage } from "@/lib/speaking/nika-voice";

export async function fetchInterlocutorLine(
  card: RolePlayCard,
  messages: NikaVoiceMessage[],
  accessToken?: string,
): Promise<{ line: string; source: "llm" | "rule" }> {
  const fallback = nextInterlocutorLine(card, messages);

  if (!accessToken || !navigator.onLine) {
    return { line: fallback, source: "rule" };
  }

  try {
    const res = await fetch(apiUrl("/api/v1/ai/speaking-interlocutor"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role_card_id: card.id,
        interlocutor_role: card.interlocutorRole,
        patient_details: card.cardText.patientDetails,
        patient_concerns: card.hiddenFromCandidate.patientConcerns,
        patient_knowledge: card.hiddenFromCandidate.patientKnowledge,
        messages: messages.map((m) => ({ role: m.role, text: m.text })),
      }),
    });
    if (!res.ok) return { line: fallback, source: "rule" };
    const data = (await res.json()) as { line?: string; source?: string };
    const line = data.line?.trim();
    if (!line) return { line: fallback, source: "rule" };
    return { line, source: data.source === "llm" ? "llm" : "rule" };
  } catch {
    return { line: fallback, source: "rule" };
  }
}

export function localOpeningLine(card: RolePlayCard): string {
  return getOpeningLine(card);
}
