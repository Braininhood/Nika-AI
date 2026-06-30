"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import { isAdminUser } from "@/lib/auth/roles";

const NAV = [
  { href: "/admin", label: "Overview", icon: "◉" },
  { href: "/admin/content", label: "Content", icon: "▦" },
  { href: "/admin/scenarios", label: "Writing", icon: "✎" },
  { href: "/admin/packs", label: "Packs", icon: "▣" },
] as const;

const PLATFORM_NAV = [
  { href: "/admin/users", label: "Users", icon: "◎" },
  { href: "/admin/groups", label: "Audiences", icon: "◈" },
] as const;

const FUTURE_NAV = [
  { label: "Subscriptions", note: "Coming soon" },
  { label: "Payments", note: "Coming soon" },
  { label: "Coupons", note: "Coming soon" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const { session, signOut } = useAuth();
  const email = session?.user?.email ?? "Admin";

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <aside className="border-b border-border bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-5 lg:flex-col lg:items-stretch">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              OET Coach
            </p>
            <h1 className="font-display text-lg font-bold text-ink">Admin</h1>
            <p className="mt-1 truncate text-xs text-ink-soft">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-muted"
          >
            Sign out
          </button>
        </div>

        <nav aria-label="Admin" className="px-2 pb-4 lg:px-3">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Content
          </p>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-ink-soft hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    <span aria-hidden className="text-xs opacity-70">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Platform
          </p>
          <ul className="space-y-1">
            {PLATFORM_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-ink-soft hover:bg-surface-muted hover:text-ink"
                    }`}
                  >
                    <span aria-hidden className="text-xs opacity-70">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Planned
          </p>
          <ul className="space-y-1">
            {FUTURE_NAV.map((item) => (
              <li key={item.label}>
                <span className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-soft/60">
                  {item.label}
                  <span className="text-[10px]">{item.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-border bg-surface/80 px-4 py-4 backdrop-blur sm:px-8">
          <p className="text-sm text-ink-soft">
            English-only content operations · learners use the study app separately
          </p>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

/** Hide Nika and marketing chrome for admin-only sessions on admin routes. */
export function AdminSessionMarker() {
  const { session } = useAuth();
  if (!isAdminUser(session?.user)) return null;
  return null;
}
