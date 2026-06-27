"use client";

import { useEffect } from "react";

/**
 * In development, Serwist is disabled but a stale SW from a production build can
 * still intercept RSC navigations and cause "Failed to fetch RSC payload".
 */
export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }, []);

  return null;
}
