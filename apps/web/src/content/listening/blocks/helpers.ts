import type { QuestionType } from "@/content/reading/types";
import { bundledAudioPathForAccentPart } from "@/lib/listening/bundled-audio";

import type { ListeningAccent, ListeningBlock, ListeningPart, NoteField } from "../types";

interface BlockBase {
  id: string;
  part: ListeningPart;
  title: string;
  durationMinutes: number;
  accent?: ListeningAccent;
  difficulty?: 1 | 2 | 3;
  tags?: string[];
  transcript: string;
  noteTemplate?: string;
  noteFields?: NoteField[];
  bundledAudioPath?: string;
  localeContext?: string;
  patientAccent?: ListeningAccent;
  clinicianAccent?: ListeningAccent;
  accentNote?: string;
}

interface QuestionBase {
  id: string;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  type?: QuestionType;
  difficulty?: 1 | 2 | 3;
  tags?: string[];
}

export function listeningBlock(base: BlockBase, questions: QuestionBase[]): ListeningBlock {
  const part = base.part;
  const partTag = `listening:part-${part.toLowerCase()}`;

  return {
    id: base.id,
    part,
    title: base.title,
    durationMinutes: base.durationMinutes,
    accent: base.accent ?? "UK",
    difficulty: base.difficulty ?? 2,
    tags: base.tags ?? [partTag],
    transcript: base.transcript,
    noteTemplate: base.noteTemplate,
    noteFields: base.noteFields,
    bundledAudioPath:
      base.bundledAudioPath ??
      bundledAudioPathForAccentPart(base.accent ?? "UK", part),
    localeContext: base.localeContext,
    patientAccent: base.patientAccent,
    clinicianAccent: base.clinicianAccent,
    accentNote: base.accentNote,
    questions: questions.map((q) => ({
      id: q.id,
      skill: "listening" as const,
      part,
      profession: "all" as const,
      type: q.type ?? (base.part === "A" ? "gap_fill" : "mcq"),
      difficulty: q.difficulty ?? 2,
      tags: q.tags ?? base.tags ?? [partTag],
      passageId: base.id,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    })),
  };
}
