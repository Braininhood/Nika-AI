"use client";

import Link from "next/link";

import { contentStatsBySkill } from "@/lib/content/stats";

export default function AdminHomePage() {
  const stats = contentStatsBySkill();
  const totalItems = stats.reduce((sum, s) => sum + s.items, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Content operations for the English-only study platform. Learners never see this area.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/content"
          className="rounded-2xl border border-border bg-surface p-5 transition hover:border-brand-primary/30"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">All skills</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{totalItems}</p>
          <p className="mt-1 text-sm text-ink-soft">Scenarios & blocks</p>
        </Link>
        {stats.map((row) => (
          <Link
            key={row.skill}
            href={row.adminPath}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-brand-primary/30"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{row.skill}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{row.items}</p>
            <p className="mt-1 text-sm text-ink-soft">{row.label}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-ink">Quick actions</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href="/admin/content"
              className="block rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-ink hover:bg-brand-primary/5"
            >
              Browse all four skills →
            </Link>
          </li>
          <li>
            <Link
              href="/admin/scenarios"
              className="block rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-ink hover:bg-brand-primary/5"
            >
              Writing scenarios →
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className="block rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-ink hover:bg-brand-primary/5"
            >
              User management →
            </Link>
          </li>
          <li>
            <Link
              href="/admin/packs"
              className="block rounded-xl bg-surface-muted px-4 py-3 text-sm font-medium text-ink hover:bg-brand-primary/5"
            >
              Listening pack status →
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-border p-6 text-sm text-ink-soft">
        <h3 className="font-semibold text-ink">Adaptive study engine</h3>
        <p className="mt-2">
          Learners get a post-registration diagnostic, a daily plan mixed by skill, and Nika chat
          tasks — all rotated from attempt history so questions rarely repeat. ML readiness runs on
          the API (sklearn) and appears on the dashboard.
        </p>
      </section>
    </div>
  );
}
