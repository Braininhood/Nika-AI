import { formatReadingTagLabel } from "@/content/reading";
import type { DiagnosticItem } from "@/lib/diagnostic/types";

const TAG_TIPS: Record<string, string> = {
  "listening:part-a-detail": "Part A tests exact details — numbers, times, and spellings. Write what you hear, then match carefully.",
  "listening:part-b-gist": "Part B asks for gist or purpose. Ask: what is this speaker mainly doing — informing, requesting, or warning?",
  "listening:part-c-inference": "Part C needs inference from context. Link cause and effect: a dose change → closer monitoring.",
  "listening:spelling": "Spell drug names letter by letter in practice. One wrong letter changes the whole answer.",
  "reading:part-a-speed": "Scan for keywords from the question across all texts — do not read every word first.",
  "reading:part-b-gist": "Each Part B text has one main purpose. Ask what the writer wants the reader to do.",
  "reading:part-c-inference": "Part C uses cautious language — modest, however, despite. Read tone, not just facts.",
  "writing:purpose": "Open with a clear purpose sentence: who you are writing about and why.",
  "writing:content-selection": "Include only facts relevant to the referral purpose — leave out resolved childhood history.",
  "writing:genre": "Use formal clinical register. Avoid chatty phrases in GP or specialist letters.",
  "writing:organisation": "State purpose early, group related facts, and place the request for action clearly.",
  "speaking:ice-expectations": "Start with Ideas, Concerns, and Expectations before explaining treatment.",
  "speaking:structure": "Signpost: reason → explanation → check understanding.",
  "speaking:clinical-comm": "Acknowledge the patient's concern before correcting or adding information.",
  "speaking:language": "Use open questions to check understanding — not yes/no 'Do you understand?'",
};

export function diagnosticExplanation(
  item: DiagnosticItem,
  selectedIndex: number,
): { correct: boolean; userAnswer: string; correctAnswer: string; explanation: string; nikaTip: string } {
  const correct = selectedIndex === item.correctIndex;
  const userAnswer = item.options[selectedIndex] ?? "—";
  const correctAnswer = item.options[item.correctIndex] ?? "—";
  const tagTip = TAG_TIPS[item.tag] ?? `Focus on ${formatReadingTagLabel(item.tag)} in your next practice block.`;

  const explanation = correct
    ? `Correct — "${correctAnswer}". ${tagTip}`
    : `You chose "${userAnswer}". The best answer is "${correctAnswer}". ${tagTip}`;

  const nikaTip = correct
    ? `Nice work on ${formatReadingTagLabel(item.tag)}. Keep that approach in timed practice.`
    : `Not quite — ${tagTip} Try a quick quiz on this skill after you finish the diagnostic.`;

  return { correct, userAnswer, correctAnswer, explanation, nikaTip };
}
