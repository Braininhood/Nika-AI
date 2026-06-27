"use client";

import { useId, useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  variant?: "default" | "accent" | "samples";
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-ink-soft transition-transform ${open ? "rotate-90" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const VARIANT_CLASS: Record<NonNullable<CollapsibleSectionProps["variant"]>, string> = {
  default: "border-border bg-surface",
  accent: "border-brand-primary/30 bg-brand-accent-soft/15",
  samples: "border-brand-primary/25 bg-surface",
};

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
  badge,
  variant = "default",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={`rounded-2xl border ${VARIANT_CLASS[variant]}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-surface-muted/40 active:bg-surface-muted/60"
      >
        <Chevron open={open} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-ink">{title}</span>
            {badge ? (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                {badge}
              </span>
            ) : null}
          </span>
          {subtitle && !open ? (
            <span className="mt-1 block line-clamp-2 text-xs text-ink-soft">{subtitle}</span>
          ) : null}
        </span>
        <span className="shrink-0 text-xs font-medium text-brand-primary">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="border-t border-border/60 px-4 pb-4 pt-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}
