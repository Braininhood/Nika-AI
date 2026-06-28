import { db } from "@/lib/db";
import type { VocabularyEntry } from "@/lib/vocabulary/types";

export async function listVocabulary(): Promise<VocabularyEntry[]> {
  return db.vocabularyEntries.orderBy("addedAt").reverse().toArray();
}

export async function getVocabularyEntry(id: string): Promise<VocabularyEntry | undefined> {
  return db.vocabularyEntries.get(id);
}

export async function saveVocabularyEntry(
  entry: Omit<VocabularyEntry, "id" | "addedAt"> & { id?: string },
): Promise<VocabularyEntry> {
  const record: VocabularyEntry = {
    id: entry.id ?? crypto.randomUUID(),
    word: entry.word.trim(),
    phrase: entry.phrase?.trim(),
    context: entry.context?.trim(),
    englishExplanation: entry.englishExplanation.trim(),
    nativeTranslation: entry.nativeTranslation?.trim(),
    nativeLanguage: entry.nativeLanguage.toUpperCase(),
    phoneticHint: entry.phoneticHint,
    tags: entry.tags,
    source: entry.source,
    addedAt: Date.now(),
  };
  await db.vocabularyEntries.put(record);
  const { notifyStudyDataChanged } = await import("@/lib/sync/notify-study-sync");
  notifyStudyDataChanged();
  return record;
}

export async function deleteVocabularyEntry(id: string): Promise<void> {
  await db.vocabularyEntries.delete(id);
  const { notifyStudyDataChanged } = await import("@/lib/sync/notify-study-sync");
  notifyStudyDataChanged();
}

export async function vocabularyCount(): Promise<number> {
  return db.vocabularyEntries.count();
}

export async function findVocabularyByWord(word: string): Promise<VocabularyEntry | undefined> {
  const normalized = word.trim().toLowerCase();
  return db.vocabularyEntries.filter((e) => e.word.toLowerCase() === normalized).first();
}
