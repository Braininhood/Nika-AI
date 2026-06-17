import { db } from "@/lib/db";
import type { OutboxEntry, OutboxType } from "@/lib/db/types";

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;

export async function enqueueOutbox(
  type: OutboxType,
  payload: unknown,
): Promise<string> {
  const entry: OutboxEntry = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  };
  await db.syncOutbox.put(entry);
  return entry.id;
}

export async function getPendingOutboxCount(): Promise<number> {
  return db.syncOutbox.count();
}

export async function processOutbox(
  send: (entry: OutboxEntry) => Promise<void>,
): Promise<{ processed: number; failed: number }> {
  const entries = await db.syncOutbox.orderBy("createdAt").toArray();
  let processed = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      await send(entry);
      await db.syncOutbox.delete(entry.id);
      processed += 1;
    } catch (error) {
      const retries = entry.retries + 1;
      const lastError = error instanceof Error ? error.message : "Unknown error";

      if (retries >= MAX_RETRIES) {
        await db.syncOutbox.update(entry.id, { retries, lastError });
        failed += 1;
        continue;
      }

      const delay = BASE_BACKOFF_MS * 2 ** (retries - 1);
      await db.syncOutbox.update(entry.id, { retries, lastError });
      await new Promise((resolve) => setTimeout(resolve, delay));
      failed += 1;
    }
  }

  return { processed, failed };
}

export async function registerBackgroundSync(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) {
      await (registration as ServiceWorkerRegistration & {
        sync: { register: (tag: string) => Promise<void> };
      }).sync.register("oet-coach-sync");
    }
  } catch {
    // Background Sync not supported (Safari) — online listener handles it
  }
}
