import type { WritingScenario } from "@/content/writing/scenarios";

export interface ChecklistItem {
  id: string;
  criterion: string;
  label: string;
  passed: boolean;
  hint?: string;
}

export interface QuickChecklistResult {
  items: ChecklistItem[];
  wordCount: number;
  passedCount: number;
}

const PURPOSE_PHRASES = [
  "i am writing to",
  "i am referring",
  "please find",
  "i would like to refer",
  "this letter is to",
];

export function runQuickChecklist(
  letterText: string,
  scenario: WritingScenario,
): QuickChecklistResult {
  const text = letterText.trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const hasPurpose = PURPOSE_PHRASES.some((p) => lower.includes(p));
  const hasSalutation = /dear\s+(dr|mr|mrs|ms|prof)/i.test(text);
  const hasClose = /yours\s+(sincerely|faithfully)/i.test(text);
  const wordCountOk = wordCount >= 150 && wordCount <= 230;

  const includedNotes = scenario.assessorGuide.mustInclude.filter((id) => {
    const note = scenario.caseNotes.find((n) => n.id === id);
    if (!note) return false;
    const keywords = note.text.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    return keywords.some((kw) => lower.includes(kw));
  });

  const omittedIrrelevant = !scenario.assessorGuide.shouldOmit.some((id) => {
    const note = scenario.caseNotes.find((n) => n.id === id);
    if (!note) return false;
    return lower.includes("childhood asthma") || lower.includes("resolved asthma");
  });

  const informal = /\b(gonna|kids|guy|sort it|asap|lol)\b/i.test(text);

  const items: ChecklistItem[] = [
    {
      id: "purpose",
      criterion: "Purpose",
      label: "Opening states purpose clearly",
      passed: hasPurpose,
      hint: "Start with 'I am writing to refer…'",
    },
    {
      id: "content",
      criterion: "Content",
      label: `Key case facts included (${includedNotes.length}/${scenario.assessorGuide.mustInclude.length})`,
      passed: includedNotes.length >= scenario.assessorGuide.mustInclude.length - 1,
    },
    {
      id: "omit",
      criterion: "Content",
      label: "Irrelevant notes omitted",
      passed: omittedIrrelevant,
    },
    {
      id: "concise",
      criterion: "Conciseness",
      label: `Word count in range (${wordCount} words, aim 150–220)`,
      passed: wordCountOk,
    },
    {
      id: "genre",
      criterion: "Genre & Style",
      label: "Formal tone (no slang)",
      passed: !informal,
    },
    {
      id: "org",
      criterion: "Organisation",
      label: "Letter format + paragraphs",
      passed: hasSalutation && hasClose && paragraphs.length >= 2,
    },
  ];

  return {
    items,
    wordCount,
    passedCount: items.filter((i) => i.passed).length,
  };
}

export function checklistToCriterionScores(items: ChecklistItem[]): Record<string, number> {
  const criteria = ["purpose", "content", "conciseness", "genre", "organisation", "language"];
  const scores: Record<string, number> = {};
  for (const c of criteria) {
    const matching = items.filter((i) => i.criterion.toLowerCase().startsWith(c.slice(0, 4)) || i.id === c);
    if (matching.length === 0) {
      scores[c] = 0.5;
      continue;
    }
    scores[c] = matching.filter((m) => m.passed).length / matching.length;
  }
  if (!scores.language) scores.language = 0.6;
  return scores;
}
