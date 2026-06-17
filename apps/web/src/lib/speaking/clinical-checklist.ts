export interface ClinicalChecklistItem {
  id: string;
  group: ClinicalChecklistGroup;
  label: string;
  tag: string;
  /** Keywords/phrases that suggest this criterion in a transcript */
  transcriptHints: string[];
}

export type ClinicalChecklistGroup =
  | "relationship"
  | "perspective"
  | "structure"
  | "gathering"
  | "giving";

export const CLINICAL_CHECKLIST_GROUPS: Record<
  ClinicalChecklistGroup,
  { title: string; description: string }
> = {
  relationship: {
    title: "Relationship building",
    description: "Greeting, rapport, respectful and attentive manner",
  },
  perspective: {
    title: "Understanding patient perspective",
    description: "ICE — Ideas, Concerns, Expectations; respond to cues",
  },
  structure: {
    title: "Providing structure",
    description: "Logical sequence, signpost topic changes",
  },
  gathering: {
    title: "Information gathering",
    description: "Open then closed questions; clarify; summarise",
  },
  giving: {
    title: "Information giving",
    description: "Check prior knowledge; chunk explanations; check understanding",
  },
};

export const CLINICAL_CHECKLIST: ClinicalChecklistItem[] = [
  {
    id: "rel-greeting",
    group: "relationship",
    label: "Appropriate greeting and introduction",
    tag: "speaking:clinical-comm",
    transcriptHints: ["hello", "good morning", "good afternoon", "my name is", "i'm"],
  },
  {
    id: "rel-attentive",
    group: "relationship",
    label: "Attentive, respectful manner",
    tag: "speaking:clinical-comm",
    transcriptHints: ["understand", "i hear", "thank you for", "take your time"],
  },
  {
    id: "pers-ice",
    group: "perspective",
    label: "Elicited ideas, concerns, or expectations",
    tag: "speaking:ice-expectations",
    transcriptHints: [
      "what concerns",
      "what worries",
      "what do you know",
      "what do you understand",
      "what do you expect",
      "how do you feel",
      "tell me about",
    ],
  },
  {
    id: "pers-cues",
    group: "perspective",
    label: "Responded to patient cues",
    tag: "speaking:clinical-comm",
    transcriptHints: ["you mentioned", "i can see", "that sounds", "i understand that"],
  },
  {
    id: "struct-sequence",
    group: "structure",
    label: "Logical sequence of topics",
    tag: "speaking:structure",
    transcriptHints: ["first", "next", "then", "finally", "let's start", "before we"],
  },
  {
    id: "struct-signpost",
    group: "structure",
    label: "Signposted topic changes",
    tag: "speaking:structure",
    transcriptHints: ["now let's", "moving on", "another thing", "i'd also like to"],
  },
  {
    id: "gather-open",
    group: "gathering",
    label: "Used open questions early",
    tag: "speaking:structure",
    transcriptHints: ["can you tell me", "how", "what", "describe", "walk me through"],
  },
  {
    id: "gather-clarify",
    group: "gathering",
    label: "Clarified vague statements",
    tag: "speaking:language",
    transcriptHints: ["could you explain", "what do you mean", "when you say", "can you give an example"],
  },
  {
    id: "gather-summarise",
    group: "gathering",
    label: "Summarised information gathered",
    tag: "speaking:structure",
    transcriptHints: ["so far", "to summarise", "what i understand", "let me recap"],
  },
  {
    id: "give-prior",
    group: "giving",
    label: "Checked prior knowledge before explaining",
    tag: "speaking:ice-expectations",
    transcriptHints: ["what do you already know", "have you heard", "are you familiar"],
  },
  {
    id: "give-chunk",
    group: "giving",
    label: "Chunked explanations clearly",
    tag: "speaking:language",
    transcriptHints: ["first", "the reason", "this means", "in simple terms", "step"],
  },
  {
    id: "give-check",
    group: "giving",
    label: "Checked understanding",
    tag: "speaking:language",
    transcriptHints: [
      "can you tell me back",
      "does that make sense",
      "what will you do",
      "do you have any questions",
      "is that clear",
    ],
  },
];

export function checklistByGroup(): Record<ClinicalChecklistGroup, ClinicalChecklistItem[]> {
  const groups = {} as Record<ClinicalChecklistGroup, ClinicalChecklistItem[]>;
  for (const item of CLINICAL_CHECKLIST) {
    groups[item.group] ??= [];
    groups[item.group].push(item);
  }
  return groups;
}
