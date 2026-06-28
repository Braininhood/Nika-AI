"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { PackDownloadProgress } from "@/lib/media/pack-downloader";
import {
  downloadListeningPack,
  getPackInstallStatus,
  type PackInstallStatus,
} from "@/lib/media/pack-downloader";
import { requestPersistentStorage } from "@/lib/media/opfs";

export type OfflinePackVariant = "featured" | "full" | "compact";

interface OfflinePacksPanelProps {
  variant?: OfflinePackVariant;
}

export function OfflinePacksPanel({ variant = "full" }: OfflinePacksPanelProps) {
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
  const pct =
    status && status.totalFiles
      ? Math.round((status.filesReady / status.totalFiles) * 100)
      : 0;

  const shellClass =
    variant === "featured"
      ? "rounded-2xl border-2 border-brand-primary/30 bg-gradient-to-br from-brand-accent-soft/50 to-surface p-5 shadow-sm"
      : "rounded-2xl border border-border bg-surface p-5";

  return (
    <section className={shellClass} aria-labelledby="offline-pack-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl" aria-hidden>
              📥
            </span>
            <h2 id="offline-pack-heading" className="font-semibold text-ink">
              Offline listening pack
            </h2>
            {ready ? (
              <span className="rounded-full bg-forest/15 px-2.5 py-0.5 text-xs font-medium text-forest">
                Ready
              </span>
            ) : status?.recordExists ? (
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Incomplete
              </span>
            ) : (
              <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                Not downloaded
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Save all practice consultation audio on this device — works offline on phone, tablet, and
            desktop. Built-in blocks use <strong>Play consultation</strong> narration.
          </p>

          {variant === "featured" ? (
            <p className="mt-2 text-xs text-ink-soft">
              Official OET sample audio →{" "}
              <Link href="/listening/import" className="font-medium text-brand-primary underline">
                Listening → Import
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-xs text-ink-soft">
              For official sample-test MP3s, use{" "}
              <Link href="/listening/import" className="text-brand-primary hover:underline">
                Listening → Import
              </Link>
              .{" "}
              <Link href="/listening/packs" className="text-brand-primary hover:underline">
                Manage packs →
              </Link>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={busy}
          className="min-h-12 shrink-0 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:opacity-90 disabled:opacity-40 sm:min-w-[10rem]"
        >
          {busy ? "Downloading…" : ready ? "Re-sync pack" : "Download pack"}
        </button>
      </div>

      {status && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span>
              {status.filesReady}/{status.totalFiles} files saved
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full transition-all ${ready ? "bg-forest" : "bg-brand-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {progress?.status === "downloading" && (
        <div className="mt-3">
          <p className="text-xs text-ink-soft">
            Downloading {progress.completedFiles} / {progress.totalFiles}
            {progress.currentFile ? ` · ${progress.currentFile}` : ""}
          </p>
        </div>
      )}

      {progress?.status === "complete" && (
        <p className="mt-3 text-sm text-forest">Pack synced — {progress.completedFiles} files saved.</p>
      )}

      {persisted === false && (
        <p className="mt-3 text-xs text-amber-800">
          Tip: allow persistent storage in your browser settings so offline audio is kept after closing
          the app.
        </p>
      )}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </section>
  );
}
