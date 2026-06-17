import type { QuizQuestion } from "@/content/reading/types";

export type ListeningPart = "A" | "B" | "C";

export type ListeningAccent = "UK" | "AU" | "US" | "IE" | "NZ" | "CA" | "mixed";

/** Note-completion field in Part A consultation notes */
export interface NoteField {
  id: string;
  label: string;
  /** Blank position in the note template */
  placeholder?: string;
}

export interface ListeningBlock {
  id: string;
  part: ListeningPart;
  title: string;
  durationMinutes: number;
  accent: ListeningAccent;
  difficulty: 1 | 2 | 3;
  tags: string[];
  /** Shown after attempt in practice mode */
  transcript: string;
  /** Consultation note template for Part A — use {{fieldId}} for blanks */
  noteTemplate?: string;
  noteFields?: NoteField[];
  questions: QuizQuestion[];
  /** Bundled pack audio path (relative to pack root) */
  bundledAudioPath?: string;
  /** User import pack audio file id */
  importAudioId?: string;
  localeContext?: string;
  /** Primary speaker accent in recording (patient/clinician) */
  patientAccent?: ListeningAccent;
  clinicianAccent?: ListeningAccent;
  /** Accent training note shown in practice briefing */
  accentNote?: string;
}

export interface ListeningPackManifest {
  packId: string;
  version: string;
  sizeBytes: number;
  minAppVersion: string;
  files: { path: string; sha256: string }[];
}
