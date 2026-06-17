import type { ListeningPackManifest } from "@/content/listening/types";
import { db } from "@/lib/db";

import {
  bundledListeningManifestCandidates,
  bundledPackFileCandidates,
  setContentStorageMode,
} from "./content-storage";
import { createDemoWavBlob, sha256Hex } from "./demo-audio";
import { deleteOpfsFile, opfsFileExists, readOpfsFile, writeOpfsFile } from "./opfs";
import type { OfflinePack } from "@/lib/db/types";
import { BUNDLED_LISTENING_PACK_ID } from "./types";

export interface PackDownloadProgress {
  packId: string;
  totalFiles: number;
  completedFiles: number;
  currentFile?: string;
  bytesDownloaded: number;
  totalBytes: number;
  status: "idle" | "downloading" | "complete" | "error";
  error?: string;
}

export async function fetchPackManifest(packId: string = BUNDLED_LISTENING_PACK_ID): Promise<ListeningPackManifest> {
  const candidates = bundledListeningManifestCandidates(packId);
  let lastError = "No manifest URL configured";

  for (let i = 0; i < candidates.length; i += 1) {
    const url = candidates[i]!;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastError = `Failed to load manifest from ${url}: ${res.status}`;
        continue;
      }
      const manifest = (await res.json()) as ListeningPackManifest;
      setContentStorageMode(url.includes("supabase") ? "supabase" : "local");
      return manifest;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  throw new Error(
    "Listening pack is not available right now. Try again when you are online, or use Listening → Import for your own audio.",
  );
}

async function fetchPackFile(
  packId: string,
  relativePath: string,
): Promise<Response | null> {
  for (const url of bundledPackFileCandidates(packId, relativePath)) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
    } catch {
      // try next
    }
  }
  return null;
}

export interface PackInstallStatus {
  packId: string;
  recordExists: boolean;
  filesReady: number;
  totalFiles: number;
  ready: boolean;
}

export async function getPackInstallStatus(
  packId: string = BUNDLED_LISTENING_PACK_ID,
): Promise<PackInstallStatus> {
  const manifest = await fetchPackManifest(packId);
  let filesReady = 0;

  for (const file of manifest.files) {
    const opfsPath = `packs/${packId}/${file.path}`;
    const blob = await readOpfsFile(opfsPath);
    if (!blob) continue;
    const hash = await sha256Hex(blob);
    if (hash === file.sha256) filesReady += 1;
  }

  const record = await db.offlinePacks.get(packId);
  return {
    packId,
    recordExists: Boolean(record?.complete),
    filesReady,
    totalFiles: manifest.files.length,
    ready: filesReady === manifest.files.length,
  };
}

/** Download bundled listening pack to OPFS with checksum verification. */
export async function downloadListeningPack(
  onProgress?: (progress: PackDownloadProgress) => void,
): Promise<OfflinePack> {
  const packId = BUNDLED_LISTENING_PACK_ID;
  const manifest = await fetchPackManifest(packId);
  const progress: PackDownloadProgress = {
    packId: manifest.packId,
    totalFiles: manifest.files.length,
    completedFiles: 0,
    bytesDownloaded: 0,
    totalBytes: manifest.sizeBytes,
    status: "downloading",
  };
  onProgress?.(progress);

  for (const file of manifest.files) {
    progress.currentFile = file.path;
    onProgress?.(progress);

    const opfsPath = `packs/${manifest.packId}/${file.path}`;
    const existing = await readOpfsFile(opfsPath);

    if (existing) {
      const hash = await sha256Hex(existing);
      if (hash === file.sha256) {
        progress.completedFiles += 1;
        progress.bytesDownloaded += existing.size;
        onProgress?.(progress);
        continue;
      }
      await deleteOpfsFile(opfsPath);
    }

    const res = await fetchPackFile(manifest.packId, file.path);
    if (!res) {
      throw new Error(
        "Could not download listening audio. Check your connection and try again.",
      );
    }
    const blob = await res.blob();
    const hash = await sha256Hex(blob);
    if (hash !== file.sha256) {
      throw new Error("Downloaded audio did not pass verification. Please try again.");
    }

    await writeOpfsFile(opfsPath, blob);
    progress.completedFiles += 1;
    progress.bytesDownloaded += blob.size;
    onProgress?.(progress);
  }

  const record: OfflinePack = {
    id: manifest.packId,
    version: manifest.version,
    sizeBytes: manifest.sizeBytes,
    downloadedAt: Date.now(),
    manifestPath: bundledListeningManifestCandidates(manifest.packId)[0] ?? `/packs/${manifest.packId}/manifest.json`,
    complete: true,
  };
  await db.offlinePacks.put(record);

  progress.status = "complete";
  onProgress?.(progress);
  return record;
}

export async function isPackDownloaded(packId: string = BUNDLED_LISTENING_PACK_ID): Promise<boolean> {
  const status = await getPackInstallStatus(packId);
  return status.ready;
}

export async function resolveBundledAudioUrl(
  bundledAudioPath: string,
  options?: {
    packId?: string;
    allowPlaceholder?: boolean;
    placeholderFrequencyHz?: number;
  },
): Promise<string | null> {
  const packId = options?.packId ?? BUNDLED_LISTENING_PACK_ID;
  const allowPlaceholder = options?.allowPlaceholder ?? false;
  const opfsPath = `packs/${packId}/${bundledAudioPath}`;

  let blob = await readOpfsFile(opfsPath);

  if (!blob) {
    const res = await fetchPackFile(packId, bundledAudioPath);
    if (res) {
      blob = await res.blob();
      await writeOpfsFile(opfsPath, blob);
    }
  }

  if (!blob && allowPlaceholder) {
    const freq =
      options?.placeholderFrequencyHz ??
      (bundledAudioPath.includes("part-a") ? 330 : bundledAudioPath.includes("part-c") ? 520 : 440);
    blob = createDemoWavBlob(3, freq);
    await writeOpfsFile(opfsPath, blob);
  }

  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function resolveImportAudioUrl(audioId: string): Promise<string | null> {
  const record = await db.mediaBlobs.get(audioId);
  if (!record) return null;
  const blob = await readOpfsFile(record.opfsPath);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function ensureDemoAudioCached(
  bundledAudioPath: string,
  packId: string = BUNDLED_LISTENING_PACK_ID,
): Promise<boolean> {
  const opfsPath = `packs/${packId}/${bundledAudioPath}`;
  if (await opfsFileExists(opfsPath)) return true;
  const demo = createDemoWavBlob(3);
  await writeOpfsFile(opfsPath, demo);
  return true;
}
