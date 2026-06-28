"use client";

import { useEffect } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import { syncSessionToLocalUser } from "@/lib/auth/sync-session-user";
import { sendOutboxEntry } from "@/lib/api/client";
import {
  processOutbox,
  registerBackgroundSync,
} from "@/lib/sync/outbox";

/** Sync offline queue only after auth session is ready (avoids 401 spam). */
export function OutboxSync() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const runSync = async () => {
      const token = session?.access_token;
      if (!token || !session) return;

      await syncSessionToLocalUser(session);
      await processOutbox((entry) => sendOutboxEntry(entry, token));
      window.dispatchEvent(new CustomEvent("oet-outbox-updated"));
    };

    const handleOnline = () => {
      void runSync();
      void registerBackgroundSync();
    };

    window.addEventListener("online", handleOnline);

    const handleScheduleStudySync = () => {
      const token = session?.access_token;
      const userId = session?.user?.id;
      if (token && userId) {
        void import("@/lib/sync/study-data-sync").then(({ scheduleStudyDataSync }) =>
          scheduleStudyDataSync(userId, token),
        );
      }
    };
    window.addEventListener("oet-schedule-study-sync", handleScheduleStudySync);

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === "PROCESS_OUTBOX") void runSync();
    };
    navigator.serviceWorker?.addEventListener("message", handleSwMessage);

    if (navigator.onLine) void handleOnline();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("oet-schedule-study-sync", handleScheduleStudySync);
      navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
    };
  }, [loading, session?.access_token, session?.user?.id]);

  return null;
}
