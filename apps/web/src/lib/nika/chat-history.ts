import { db } from "@/lib/db";
import type { NikaChatMessageRecord } from "@/lib/db/types";
import type { NikaSource } from "@/lib/nika/chat";

export const NIKA_CHAT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export const NIKA_WELCOME_TEXT =
  "Hi — I'm Nika, your OET study coach. I help with all four OET skills, regulator requirements, vocabulary, and your study plan. Try **explain nil by mouth**, **create a reading quiz**, or **mixed tasks**. What would you like to work on?";

export interface NikaChatMessage {
  id: string;
  role: "user" | "nika";
  text: string;
  refused?: boolean;
  sources?: NikaSource[];
  tasks?: { skill: string; title: string; route: string; durationMinutes: number }[];
  provider?: string;
  createdAt?: number;
}

function toRecord(userId: string, msg: NikaChatMessage): NikaChatMessageRecord {
  return {
    id: msg.id,
    userId,
    role: msg.role,
    text: msg.text,
    refused: msg.refused,
    sources: msg.sources,
    tasks: msg.tasks,
    provider: msg.provider,
    createdAt: msg.createdAt ?? Date.now(),
  };
}

function fromRecord(record: NikaChatMessageRecord): NikaChatMessage {
  return {
    id: record.id,
    role: record.role,
    text: record.text,
    refused: record.refused,
    sources: record.sources,
    tasks: record.tasks,
    provider: record.provider,
    createdAt: record.createdAt,
  };
}

export async function pruneNikaChatHistory(userId: string): Promise<void> {
  const cutoff = Date.now() - NIKA_CHAT_RETENTION_MS;
  await db.nikaChatMessages.where("userId").equals(userId).filter((m) => m.createdAt < cutoff).delete();
}

export async function loadNikaChatHistory(userId: string): Promise<NikaChatMessage[]> {
  await pruneNikaChatHistory(userId);
  const cutoff = Date.now() - NIKA_CHAT_RETENTION_MS;
  const rows = await db.nikaChatMessages
    .where("userId")
    .equals(userId)
    .filter((m) => m.createdAt >= cutoff)
    .sortBy("createdAt");
  return rows.map(fromRecord);
}

export async function saveNikaChatMessages(userId: string, messages: NikaChatMessage[]): Promise<void> {
  const toSave = messages.filter((m) => m.id !== "welcome").map((m) => toRecord(userId, m));
  if (!toSave.length) return;
  await db.nikaChatMessages.bulkPut(toSave);
  await pruneNikaChatHistory(userId);
}

export function welcomeMessage(): NikaChatMessage {
  return {
    id: "welcome",
    role: "nika",
    text: NIKA_WELCOME_TEXT,
  };
}
