import { writeOpfsFile, readOpfsFile, deleteOpfsFile, createBlobUrl } from "@/lib/media/opfs";
import { db } from "@/lib/db";

const RECORDING_PREFIX = "speaking/recordings";

export async function saveSpeakingRecording(
  roleCardId: string,
  blob: Blob,
  durationSeconds: number,
): Promise<{ id: string; blobKey: string }> {
  const id = crypto.randomUUID();
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const blobKey = `${RECORDING_PREFIX}/${id}.${ext}`;

  await writeOpfsFile(blobKey, blob);
  await db.speakingRecordings.put({
    id,
    roleCardId,
    blobKey,
    durationSeconds,
    createdAt: Date.now(),
  });

  return { id, blobKey };
}

export async function loadSpeakingRecordingBlob(blobKey: string): Promise<Blob | null> {
  return readOpfsFile(blobKey);
}

export async function speakingRecordingUrl(blobKey: string): Promise<string | null> {
  const blob = await loadSpeakingRecordingBlob(blobKey);
  if (!blob) return null;
  return createBlobUrl(blob);
}

export async function deleteSpeakingRecording(id: string): Promise<void> {
  const record = await db.speakingRecordings.get(id);
  if (record?.blobKey) {
    await deleteOpfsFile(record.blobKey);
  }
  await db.speakingRecordings.delete(id);
}

export async function pruneOldRecordings(maxAgeDays = 30): Promise<number> {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const stale = await db.speakingRecordings.where("createdAt").below(cutoff).toArray();
  for (const record of stale) {
    await deleteSpeakingRecording(record.id);
  }
  return stale.length;
}
