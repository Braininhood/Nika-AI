"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { PackDownloadProgress } from "@/lib/media/pack-downloader";
import {
  downloadListeningPack,
  getPackInstallStatus,
  type PackInstallStatus,
} from "@/lib/media/pack-downloader";
import { BUNDLED_LISTENING_PACK_ID } from "@/lib/media/types";
import { requestPersistentStorage } from "@/lib/media/opfs";

export function OfflinePacksPanel() {
  const [status, setStatus] = useState<PackInstallStatus | null>(null);
  const [progress, setProgress] = useState<PackDownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshStatus = () => {
    void getPackInstallStatus()
      .then((s) => {
        setStatus(s);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not check pack status"));
  };

  useEffect(() => {
    void getPackInstallStatus()
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not check pack status"));
    void requestPersistentStorage().then(setPersisted);
  }, []);

  const handleDownload = async () => {
    setError(null);
    setBusy(true);
    setProgress(null);
    try {
      await downloadListeningPack(setProgress);
      refreshStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
      refreshStatus();
    } finally {
      setBusy(false);
    }
  };

  const ready = status?.ready ?? false;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-semibold text-ink">Offline listening pack</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Download practice audio to your device for offline listening. Built-in blocks use{" "}
        <strong>Play consultation</strong> narration. For official sample-test audio, use{" "}
        <Link href="/listening/import" className="text-brand-primary hover:underline">
          Listening → Import
        </Link>
        .
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        {status && (
          <>
            {status.filesReady}/{status.totalFiles} files saved for offline use
            {ready ? " · Ready" : status.recordExists ? " · Incomplete" : ""}
          </>
        )}
        {persisted === false && " · Enable persistent storage for best offline retention"}
      </p>

      {progress?.status === "downloading" && (
        <div className="mt-4">
          <p className="text-xs text-ink-soft">
            Downloading {progress.completedFiles} / {progress.totalFiles}
            {progress.currentFile ? ` · ${progress.currentFile}` : ""}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-brand-primary transition-all"
              style={{
                width: `${progress.totalFiles ? (progress.completedFiles / progress.totalFiles) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {progress?.status === "complete" && (
        <p className="mt-3 text-sm text-forest">Pack synced — {progress.completedFiles} files saved.</p>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
        className="mt-4 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
      >
        {busy ? "Downloading…" : ready ? "Re-sync pack" : "Download pack"}
      </button>
    </section>
  );
}
