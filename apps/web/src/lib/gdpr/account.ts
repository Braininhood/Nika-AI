import { db } from "@/lib/db";
import { apiUrl } from "@/lib/api/base-url";

/** Wipe all local IndexedDB data (GDPR local erasure). */
export async function wipeLocalUserData(_userId: string): Promise<void> {
  db.close();
  await db.delete();
}

export async function downloadServerDataExport(accessToken: string): Promise<Blob> {
  const response = await fetch(apiUrl("/api/v1/profile/me/export"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error("Export failed. Try again when you are online.");
  }
  const json = await response.json();
  return new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
}

export async function deleteServerAccount(accessToken: string): Promise<void> {
  const response = await fetch(apiUrl("/api/v1/profile/me"), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error("Could not delete account. Please try again or email support.");
  }
}

export async function setAiConsent(accessToken: string, consent: boolean): Promise<void> {
  const response = await fetch(apiUrl("/api/v1/profile/me"), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ai_consent: consent }),
  });
  if (!response.ok) {
    throw new Error("Could not save AI preference.");
  }
}

/** Merge local Dexie export with optional server payload for full portability. */
export async function buildLocalDataExport(userId: string): Promise<Record<string, unknown>> {
  const [
    user,
    skillMap,
    diagnostic,
    attempts,
    drafts,
    recordings,
    nikaMessages,
    vocabulary,
  ] = await Promise.all([
    db.users.get(userId),
    db.skillMaps.get(userId),
    db.diagnosticSessions.get(userId),
    db.attempts.toArray(),
    db.writingDrafts.toArray(),
    db.speakingRecordings.toArray(),
    db.nikaChatMessages.where("userId").equals(userId).toArray(),
    db.vocabularyEntries.toArray(),
  ]);

  return {
    exported_at: new Date().toISOString(),
    source: "local_device",
    user_id: userId,
    profile: user ?? null,
    skill_map: skillMap ?? null,
    diagnostic_session: diagnostic ?? null,
    attempts,
    writing_drafts: drafts,
    speaking_recordings: recordings.map((r) => ({
      ...r,
      blobRef: r.blobKey ? "[binary on device]" : undefined,
    })),
    nika_chat: nikaMessages,
    vocabulary,
  };
}

export function triggerJsonDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
