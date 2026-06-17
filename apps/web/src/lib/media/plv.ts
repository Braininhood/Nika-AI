import { db } from "@/lib/db";
import type { UserImportPack } from "@/lib/db/types";

import { sha256Hex } from "./demo-audio";
import { writeOpfsFile, deleteOpfsFile } from "./opfs";
import {
  chunkPassagesFromText,
  extractTextFromPdf,
  parseAnswerKeyFromText,
} from "./pdf-parse";
import {
  PLV_DEFAULT_TTL_DAYS,
  PLV_MAX_PACK_BYTES,
  type MediaBlobRecord,
} from "./types";

export interface ImportFileInput {
  file: File;
  kind: "pdf" | "mp3" | "m4a" | "key_pdf";
}

export interface ImportPackInput {
  name: string;
  profession: string;
  files: ImportFileInput[];
  consent: boolean;
  partMapping?: Partial<Record<"A" | "B" | "C", string>>;
}

export interface ImportPackResult {
  pack: UserImportPack;
  warnings: string[];
}

function mimeForFile(file: File): string {
  if (file.type) return file.type;
  if (file.name.endsWith(".mp3")) return "audio/mpeg";
  if (file.name.endsWith(".m4a")) return "audio/mp4";
  if (file.name.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

async function persistFile(file: File, packId: string): Promise<MediaBlobRecord> {
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const opfsPath = `imports/${packId}/${id}-${safeName}`;
  await writeOpfsFile(opfsPath, file);
  const record: MediaBlobRecord = {
    id,
    mimeType: mimeForFile(file),
    sizeBytes: file.size,
    opfsPath,
    createdAt: Date.now(),
  };
  await db.mediaBlobs.put(record);
  return record;
}

export function computeExpiry(createdAt: number, ttlDays = PLV_DEFAULT_TTL_DAYS): number {
  return createdAt + ttlDays * 24 * 60 * 60 * 1000;
}

export function isPackExpired(pack: UserImportPack): boolean {
  return Date.now() > pack.expiresAt;
}

export function daysUntilExpiry(pack: UserImportPack): number {
  return Math.max(0, Math.ceil((pack.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

export async function importUserPack(input: ImportPackInput): Promise<ImportPackResult> {
  const warnings: string[] = [];
  const totalBytes = input.files.reduce((sum, f) => sum + f.file.size, 0);
  if (totalBytes > PLV_MAX_PACK_BYTES) {
    throw new Error(`Pack exceeds ${PLV_MAX_PACK_BYTES / (1024 * 1024)} MB limit`);
  }
  if (!input.consent) {
    throw new Error("Consent required — files stay on this device only");
  }

  const packId = crypto.randomUUID();
  const createdAt = Date.now();
  const audioIds: string[] = [];
  let pdfId: string | undefined;
  let keyPdfId: string | undefined;
  let parsedText = "";
  let answerKey: Record<string, string> = {};

  for (const item of input.files) {
    const record = await persistFile(item.file, packId);
    if (item.kind === "mp3" || item.kind === "m4a") {
      audioIds.push(record.id);
    } else if (item.kind === "key_pdf") {
      keyPdfId = record.id;
      try {
        const parsed = await extractTextFromPdf(item.file);
        answerKey = parseAnswerKeyFromText(parsed.text);
        if (Object.keys(answerKey).length === 0) {
          warnings.push("Answer key PDF parsed but no Q1/1. patterns found — manual review needed.");
        }
      } catch {
        warnings.push("Could not parse answer key PDF — auto-marking unavailable.");
      }
    } else if (item.kind === "pdf") {
      pdfId = record.id;
      try {
        const parsed = await extractTextFromPdf(item.file);
        parsedText = parsed.text;
      } catch {
        warnings.push("Could not extract text from PDF — stored for offline viewing only.");
      }
    }
  }

  const passages = parsedText ? chunkPassagesFromText(parsedText) : undefined;
  const listeningParts = audioIds.map((audioId, i) => {
    const part = (["A", "B", "C"] as const)[i] ?? "B";
    const mapped = input.partMapping?.[part];
    return {
      part,
      title: mapped ?? `Imported audio ${i + 1}`,
      audioId,
      transcript: passages?.[i]?.text?.slice(0, 500),
    };
  });

  const pack: UserImportPack = {
    id: packId,
    name: input.name,
    profession: input.profession,
    createdAt,
    expiresAt: computeExpiry(createdAt),
    consent: true,
    files: { pdfId, audioIds, keyPdfId },
    parsed: { passages, listeningParts, answerKey: Object.keys(answerKey).length ? answerKey : undefined },
  };

  await db.userImportPacks.put(pack);
  return { pack, warnings };
}

export async function listUserImportPacks(): Promise<UserImportPack[]> {
  const packs = await db.userImportPacks.toArray();
  return packs.filter((p) => !isPackExpired(p)).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteUserImportPack(packId: string): Promise<void> {
  const pack = await db.userImportPacks.get(packId);
  if (!pack) return;

  const blobIds = [
    pack.files.pdfId,
    pack.files.keyPdfId,
    ...pack.files.audioIds,
  ].filter(Boolean) as string[];

  for (const id of blobIds) {
    const blob = await db.mediaBlobs.get(id);
    if (blob) {
      await deleteOpfsFile(blob.opfsPath);
      await db.mediaBlobs.delete(id);
    }
  }

  await db.userImportPacks.delete(packId);
}

export async function purgeExpiredPacks(): Promise<number> {
  const all = await db.userImportPacks.toArray();
  let removed = 0;
  for (const pack of all) {
    if (isPackExpired(pack)) {
      await deleteUserImportPack(pack.id);
      removed += 1;
    }
  }
  return removed;
}

export async function extendPackExpiry(packId: string, extraDays = 30): Promise<void> {
  const pack = await db.userImportPacks.get(packId);
  if (!pack) return;
  pack.expiresAt += extraDays * 24 * 60 * 60 * 1000;
  await db.userImportPacks.put(pack);
}

/** Score using imported answer key when question ids match */
export function scoreWithImportedKey(
  responses: Record<string, string | string[]>,
  answerKey: Record<string, string>,
): { questionId: string; correct: boolean; expected?: string }[] {
  return Object.entries(responses).map(([questionId, answer]) => {
    const qNum = questionId.match(/q(\d+)$/i)?.[1] ?? questionId.match(/(\d+)$/)?.[1];
    const expected =
      answerKey[questionId] ??
      (qNum ? answerKey[`q${qNum}`] ?? answerKey[qNum] : undefined);
    if (!expected) return { questionId, correct: false };
    const userStr = Array.isArray(answer) ? answer.join(" ") : String(answer);
    const correct =
      userStr.trim().toLowerCase() === expected.trim().toLowerCase();
    return { questionId, correct, expected };
  });
}

export async function fileChecksum(file: File): Promise<string> {
  return sha256Hex(file);
}
