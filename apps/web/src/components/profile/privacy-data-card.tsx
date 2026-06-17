"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  buildLocalDataExport,
  deleteServerAccount,
  downloadServerDataExport,
  setAiConsent,
  triggerJsonDownload,
  wipeLocalUserData,
} from "@/lib/gdpr/account";
import { createClient } from "@/lib/supabase/client";

interface PrivacyDataCardProps {
  aiConsent: boolean;
  onAiConsentChange?: (value: boolean) => void;
}

export function PrivacyDataCard({ aiConsent, onAiConsentChange }: PrivacyDataCardProps) {
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState<"export" | "delete" | "consent" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const userId = session?.user?.id;
  const token = session?.access_token;

  const handleExport = async () => {
    if (!userId || !token) return;
    setBusy("export");
    setMessage(null);
    try {
      const [localPart, serverBlob] = await Promise.all([
        buildLocalDataExport(userId),
        downloadServerDataExport(token).catch(() => null),
      ]);

      let merged: Record<string, unknown> = { local: localPart };
      if (serverBlob) {
        const serverJson = JSON.parse(await serverBlob.text()) as Record<string, unknown>;
        merged = { ...serverJson, local: localPart };
      }

      const blob = new Blob([JSON.stringify(merged, null, 2)], {
        type: "application/json",
      });
      triggerJsonDownload(blob, `oet-coach-export-${userId.slice(0, 8)}.json`);
      setMessage("Download started.");
    } catch {
      setMessage("Export failed. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (!userId || !token) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      setMessage("Tap delete again to confirm — this cannot be undone.");
      return;
    }
    setBusy("delete");
    setMessage(null);
    try {
      await deleteServerAccount(token);
      await wipeLocalUserData(userId);
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
      await signOut();
      window.location.href = "/";
    } catch {
      setMessage("Could not delete account. Email support if this persists.");
      setConfirmDelete(false);
    } finally {
      setBusy(null);
    }
  };

  const handleAiConsent = async (checked: boolean) => {
    if (!token) return;
    setBusy("consent");
    setMessage(null);
    try {
      await setAiConsent(token, checked);
      onAiConsentChange?.(checked);
      setMessage(checked ? "AI processing enabled." : "AI processing disabled.");
    } catch {
      setMessage("Could not update AI preference.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
      <h2 className="font-semibold text-ink">Privacy & your data</h2>
      <p className="mt-1 text-ink-soft">
        Manage AI processing, export, or delete your account per our{" "}
        <Link href="/privacy" className="font-medium text-brand-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-muted/40 p-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border"
          checked={aiConsent}
          disabled={busy === "consent"}
          onChange={(e) => void handleAiConsent(e.target.checked)}
        />
        <span>
          <span className="font-medium text-ink">AI processing consent</span>
          <span className="mt-0.5 block text-xs text-ink-soft">
            Allow Nika and AI feedback on writing/speaking. Text may be sent to our AI
            providers to generate feedback — not for public model training where we can opt out.
          </span>
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleExport()}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted disabled:opacity-50"
        >
          {busy === "export" ? "Preparing…" : "Export my data"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void handleDelete()}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          {busy === "delete" ? "Deleting…" : confirmDelete ? "Confirm delete account" : "Delete account"}
        </button>
        {confirmDelete && busy !== "delete" ? (
          <button
            type="button"
            className="rounded-xl px-3 py-2 text-xs text-ink-soft hover:underline"
            onClick={() => {
              setConfirmDelete(false);
              setMessage(null);
            }}
          >
            Cancel
          </button>
        ) : null}
      </div>

      {message ? <p className="mt-3 text-xs text-ink-soft">{message}</p> : null}
    </section>
  );
}
