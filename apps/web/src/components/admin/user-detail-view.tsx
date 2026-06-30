"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminEmailComposer } from "@/components/admin/admin-email-composer";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type AdminUserDetail,
  deleteAdminUser,
  fetchAdminUser,
  formatDateTime,
  formatRelativeTime,
  updateAdminUser,
} from "@/lib/admin/users-api";

const PROFESSIONS = [
  "medicine",
  "nursing",
  "pharmacy",
  "dentistry",
  "physiotherapy",
  "radiography",
  "occupational_therapy",
  "optometry",
  "podiatry",
  "veterinary_science",
  "speech_pathology",
  "dietetics",
] as const;

export function UserDetailView({ userId }: { userId: string }) {
  const { session } = useAuth();
  const token = session?.access_token;
  const currentUserId = session?.user?.id;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"learner" | "admin">("learner");
  const [banned, setBanned] = useState(false);
  const [profession, setProfession] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchAdminUser(token, userId);
      setUser(detail);
      setEmail(detail.email ?? "");
      setRole(detail.role as "learner" | "admin");
      setBanned(detail.banned);
      setProfession(detail.profile?.profession ?? "");
      setTargetCountry(detail.profile?.targetCountry ?? "");
      setOnboardingComplete(detail.profile?.onboardingComplete ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSave = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await updateAdminUser(token, userId, {
        email: email.trim() || undefined,
        role,
        banned,
        profile: {
          profession: profession || undefined,
          targetCountry: targetCountry || undefined,
          onboardingComplete,
        },
      });
      setUser(updated);
      setMessage("User updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !window.confirm("Permanently delete this user and all their data?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAdminUser(token, userId);
      window.location.href = "/admin/users";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete user");
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-ink-soft">Loading user…</p>;
  }

  if (!user || !token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-700">{error ?? "User not found."}</p>
        <Link href="/admin/users" className="text-sm text-brand-primary hover:underline">
          ← Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/users" className="text-sm text-brand-primary hover:underline">
          ← Users
        </Link>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">{user.email ?? user.id}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Joined {formatDateTime(user.createdAt)} · Sign-in:{" "}
          {user.providers.length
            ? user.providers.map((p) => (p === "email" ? "magic link" : p)).join(", ")
            : "email"}
          {user.emailConfirmed ? " · verified" : user.magicLinkPending ? " · magic link not used" : ""}
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-semibold text-ink">Activity</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Last login</dt>
              <dd className="text-right text-ink">
                {formatRelativeTime(user.lastSignInAt)}
                <span className="block text-xs text-ink-soft">
                  {formatDateTime(user.lastSignInAt)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Last practice</dt>
              <dd className="text-ink">{formatDateTime(user.activity.lastActivityAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Attempts</dt>
              <dd className="text-ink">{user.activity.attemptCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Diagnostics</dt>
              <dd className="text-ink">{user.activity.diagnosticCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Vocabulary saved</dt>
              <dd className="text-ink">{user.activity.vocabularyCount}</dd>
            </div>
          </dl>
          {Object.keys(user.activity.bySkill).length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">By skill</p>
              <ul className="mt-2 space-y-1 text-sm">
                {Object.entries(user.activity.bySkill).map(([skill, count]) => (
                  <li key={skill} className="flex justify-between capitalize">
                    <span>{skill}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-semibold text-ink">Account</h3>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="text-ink-soft">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="text-ink-soft">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "learner" | "admin")}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              >
                <option value="learner">Learner</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={banned} onChange={(e) => setBanned(e.target.checked)} />
              Banned (blocks sign-in)
            </label>
            <label className="block text-sm">
              <span className="text-ink-soft">Profession</span>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              >
                <option value="">—</option>
                {PROFESSIONS.map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-ink-soft">Target country</span>
              <input
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={onboardingComplete}
                onChange={(e) => setOnboardingComplete(e.target.checked)}
              />
              Onboarding complete
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save changes
            </button>
            {currentUserId !== userId && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleDelete()}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
              >
                Delete user
              </button>
            )}
          </div>
        </section>
      </div>

      <AdminEmailComposer
        accessToken={token}
        recipientLabel={user.email ?? user.id}
        audience={{ type: "users", userIds: [userId] }}
        sampleUserId={userId}
        sampleEmail={user.email ?? undefined}
      />
    </div>
  );
}
