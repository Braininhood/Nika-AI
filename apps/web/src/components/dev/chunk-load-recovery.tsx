"use client";

import { useEffect } from "react";

/**
 * After Fast Refresh or a dev-server restart, stale chunk URLs can 404.
 * One hard reload recovers without a manual refresh.
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const reloadOnce = () => {
      const key = "oet.chunk-reload";
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      const msg = event.message ?? "";
      if (msg.includes("Loading chunk") || msg.includes("ChunkLoadError")) {
        reloadOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const name = reason && typeof reason === "object" && "name" in reason ? String(reason.name) : "";
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (
        name === "ChunkLoadError" ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch RSC payload")
      ) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
