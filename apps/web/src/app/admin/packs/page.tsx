"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import { fetchApiJson } from "@/lib/api/client";

interface PackStatus {
  packId: string;
  reachable: boolean;
  version?: string;
  sizeBytes?: number;
  fileCount?: number;
  error?: string;
}

export default function AdminPacksPage() {
  const { session } = useAuth();
  const [status, setStatus] = useState<PackStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [localReady, setLocalReady] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (session?.access_token) {
        const remote = await fetchApiJson<PackStatus>(
          "/api/v1/admin/packs/status",
          session.access_token,
        );
        setStatus(remote);
      }
    } catch {
      setStatus({
        packId: "listening-foundation-v1",
        reachable: false,
        error: "Could not check remote pack status.",
      });
    } finally {
      setLoading(false);
    }

    try {
      const res = await fetch("/packs/listening-foundation-v1/manifest.json");
      setLocalReady(res.ok);
    } catch {
      setLocalReady(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Listening content</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Check whether learners can download offline listening practice from the cloud.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft">Cloud pack</dt>
            <dd className="font-medium text-ink">
              {status?.reachable ? "Available" : status ? "Unavailable" : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Built-in preview</dt>
            <dd className="font-medium text-ink">
              {localReady === null ? "—" : localReady ? "Ready" : "Missing"}
            </dd>
          </div>
          {status?.reachable && (
            <>
              <div>
                <dt className="text-ink-soft">Version</dt>
                <dd className="font-medium text-ink">{status.version ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Files</dt>
                <dd className="font-medium text-ink">
                  {status.fileCount ?? "—"}
                  {status.sizeBytes
                    ? ` · ${Math.round(status.sizeBytes / 1024)} KB`
                    : ""}
                </dd>
              </div>
            </>
          )}
        </dl>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="mt-4 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {loading ? "Checking…" : "Refresh status"}
        </button>
        {status?.error && (
          <p className="mt-3 text-sm text-red-600">{status.error}</p>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-surface-muted/50 p-4 text-sm text-ink-soft">
        <h3 className="font-semibold text-ink">Publishing updates</h3>
        <p className="mt-2">
          New listening audio is published from the development environment. If the cloud pack
          shows unavailable, contact your platform administrator.
        </p>
      </section>
    </div>
  );
}
