"use client";

import { useCallback, useEffect, useState } from "react";

import { sendOutboxEntry } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import {
  getPendingOutboxCount,
  processOutbox,
} from "@/lib/sync/outbox";

export function SyncBadge() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setPending(await getPendingOutboxCount());
  }, []);

  useEffect(() => {
    let active = true;
    void getPendingOutboxCount().then((count) => {
      if (active) setPending(count);
    });
    const onUpdate = () => {
      void getPendingOutboxCount().then((count) => {
        if (active) setPending(count);
      });
    };
    window.addEventListener("oet-outbox-updated", onUpdate);
    return () => {
      active = false;
      window.removeEventListener("oet-outbox-updated", onUpdate);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    try {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session?.access_token) return;
      await processOutbox((entry) =>
        sendOutboxEntry(entry, data.session.access_token),
      );
      await refresh();
      window.dispatchEvent(new CustomEvent("oet-outbox-updated"));
    } finally {
      setSyncing(false);
    }
  };

  if (pending === 0) return null;

  return (
    <button
      type="button"
      onClick={() => void handleSync()}
      disabled={syncing || !navigator.onLine}
      className="rounded-full bg-brand-accent-soft px-3 py-1 text-xs font-medium text-brand-primary-strong transition hover:bg-brand-accent disabled:opacity-50"
      aria-label={`${pending} items waiting to sync. Tap to sync now.`}
    >
      {syncing ? "Syncing…" : `${pending} to sync`}
    </button>
  );
}
