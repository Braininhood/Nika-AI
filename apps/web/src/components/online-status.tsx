"use client";

import { useEffect, useState } from "react";

type OnlineStatusProps = {
  /** Icon-only on narrow screens to save header space */
  compact?: boolean;
};

export function OnlineStatus({ compact = false }: OnlineStatusProps) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    queueMicrotask(sync);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const label = online ? "Online" : "Offline";

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-medium"
      role="status"
      aria-live="polite"
      title={label}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${online ? "bg-success" : "bg-warning"}`}
        aria-hidden
      />
      {compact ? (
        <span className="hidden text-ink-soft sm:inline">{label}</span>
      ) : (
        <span className="text-ink-soft">{label}</span>
      )}
    </div>
  );
}
