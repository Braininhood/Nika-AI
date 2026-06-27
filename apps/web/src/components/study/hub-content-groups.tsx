"use client";

import Link from "next/link";

export interface HubContentRow {
  href: string;
  title: string;
  meta?: string;
}

export interface HubContentGroup {
  label: string;
  items: HubContentRow[];
  emptyMessage?: string;
}

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface HubContentGroupsProps {
  title: string;
  subtitle?: string;
  groups: HubContentGroup[];
}

export function HubContentGroups({ title, subtitle, groups }: HubContentGroupsProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-ink-soft">{subtitle}</p> : null}
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
              {group.label}
            </p>
            {group.items.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {group.items.map((item, index) => (
                  <li key={`${item.href}-${index}`}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm transition hover:bg-surface-muted active:bg-surface-muted"
                    >
                      <span className="min-w-0">
                        <span className="font-medium text-ink">{item.title}</span>
                        {item.meta ? (
                          <span className="mt-0.5 block truncate text-xs text-ink-soft">{item.meta}</span>
                        ) : null}
                      </span>
                      <Chevron />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                {group.emptyMessage ?? "No items yet."}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
