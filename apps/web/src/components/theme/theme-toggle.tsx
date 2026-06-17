"use client";

import { useTheme } from "@/lib/theme/theme-provider";

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact }: ThemeToggleProps) {
  const { resolved, setMode } = useTheme();

  const toggle = () => setMode(resolved === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface text-ink transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${
        compact ? "h-9 w-9 min-h-9" : "min-h-11 gap-2 px-4 py-2.5 text-sm font-medium"
      }`}
      aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={resolved === "dark" ? "Light mode" : "Dark mode"}
    >
      <span aria-hidden className="text-base leading-none">
        {resolved === "dark" ? "☀" : "☾"}
      </span>
      {!compact && <span>{resolved === "dark" ? "Light" : "Dark"}</span>}
    </button>
  );
}
