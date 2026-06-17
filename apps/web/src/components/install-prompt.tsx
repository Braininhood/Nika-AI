"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-brand-accent-soft px-4 py-2 text-center text-sm">
      <span className="text-ink-soft">Install OET Coach for offline study — </span>
      <button
        type="button"
        onClick={() => void handleInstall()}
        className="font-semibold text-brand-primary-strong underline"
      >
        Add to Home Screen
      </button>
      <span className="text-ink-soft"> · </span>
      <a href="/install" className="font-semibold text-brand-primary-strong underline">
        iOS guide
      </a>
    </div>
  );
}
