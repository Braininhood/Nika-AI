"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth/auth-provider";

function ProfileIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" strokeLinecap="round" />
    </svg>
  );
}

export function AuthStatus() {
  const { session, loading } = useAuth();

  if (loading) {
    return <span className="text-xs text-ink-soft">…</span>;
  }

  if (session?.user) {
    return (
      <Link
        href="/profile"
        title={session.user.email ?? "Profile settings"}
        aria-label={`Profile — ${session.user.email ?? "account settings"}`}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent"
      >
        <ProfileIcon />
        <span>Profile</span>
      </Link>
    );
  }

  return null;
}
