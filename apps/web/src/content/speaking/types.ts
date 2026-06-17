import type { OetProfession } from "@/lib/domain/types";

import type { ScenarioCountryCode } from "@/content/writing/scenarios/types";

/** OET listening accent — also used for speaking patient/interlocutor voice context */
export type OetAccent = "UK" | "AU" | "US" | "IE" | "NZ" | "CA" | "mixed";

export interface ModelDialogueLine {
  speaker: "candidate" | "patient" | "carer";
  line: string;
  /** Clinical communication marker shown in learn mode */
  annotation?: string;
}

export interface RolePlayCard {
  id: string;
  profession: OetProfession;
  difficulty: 1 | 2 | 3;
  countryCode: ScenarioCountryCode;
  setting: string;
  durationMinutes: number;
  prepMinutes: number;
  candidateRole: string;
  interlocutorRole: string;
  cardText: {
    overview: string;
    patientDetails: string;
    yourTasks: string[];
  };
  /** Information the interlocutor holds — candidate must elicit */
  hiddenFromCandidate: {
    patientConcerns: string[];
    patientKnowledge: string;
    omittedFacts?: string[];
  };
  coaching: {
    iceQuestions: string[];
    structure: string[];
    phrasesToAvoid: string[];
    usefulPhrases: string[];
    weakTags: string[];
  };
  modelDialogue: ModelDialogueLine[];
  /** Patient/carer accent for interlocutor practice — OET uses varied English accents */
  patientAccent?: OetAccent;
  /** e.g. "Filipino-background patient in Sydney; clear English with AU rhythm" */
  accentContext?: string;
}
