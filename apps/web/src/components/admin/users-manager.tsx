"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminEmailComposer } from "@/components/admin/admin-email-composer";
import { useAuth } from "@/lib/auth/auth-provider";
import { addGroupMembers, fetchGroups, type UserGroupSummary } from "@/lib/admin/groups-api";
import {
  type AdminUserListItem,
  type AdminUserStats,
  createAdminUser,
  fetchAdminUserStats,
  fetchAdminUsers,
  formatDateTime,
  formatRelativeTime,
} from "@/lib/admin/users-api";

export function UsersManager() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | "learner" | "admin">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"learner" | "admin">("learner");
  const [sendInvite, setSendInvite] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showEmailCampaign, setShowEmailCampaign] = useState(false);
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [groups, setGroups] = useState<UserGroupSummary[]>([]);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const perPage = 25;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const selectedList = useMemo(() => [...selectedIds], [selectedIds]);
  const allOnPageSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, listData] = await Promise.all([
        fetchAdminUserStats(token),
        fetchAdminUsers(token, {
          page,
          perPage,
          search: search.trim() || undefined,
          role: roleFilter || undefined,
        }),
      ]);
      setStats(statsData);
      setUsers(listData.users);
      setTotal(listData.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, roleFilter]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        users.forEach((u) => next.delete(u.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        users.forEach((u) => next.add(u.id));
        return next;
      });
    }
  };

  const openAddToGroup = async () => {
    if (!token) return;
    try {
      const rows = await fetchGroups(token);
      setGroups(Array.isArray(rows) ? rows : []);
      setTargetGroupId(rows[0]?.id ?? "");
      setShowAddToGroup(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load groups");
    }
  };

  const handleAddToGroup = async () => {
    if (!token || !targetGroupId || selectedList.length === 0) return;
    setBusy(true);
    try {
      await addGroupMembers(token, targetGroupId, selectedList);
      setShowAddToGroup(false);
      setMessage(`Added ${selectedList.length} user(s) to group.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to group");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !newEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await createAdminUser(token, {
        email: newEmail.trim(),
        role: newRole,
        sendInvite,
      });
      setShowCreate(false);
      setNewEmail("");
      setPage(1);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Users</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Manage learner accounts, roles, access, and reminder emails.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add user
        </button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Total", value: stats.totalUsers },
            { label: "Active 7d", value: stats.active7d },
            { label: "Active 30d", value: stats.active30d },
            { label: "New 7d", value: stats.new7d },
            { label: "Onboarded", value: stats.onboardingComplete },
            { label: "Banned", value: stats.banned },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{card.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-ink">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by email or ID…"
          className="min-w-[220px] flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as "" | "learner" | "admin");
            setPage(1);
          }}
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
        >
          <option value="">All roles</option>
          <option value="learner">Learners</option>
          <option value="admin">Admins</option>
        </select>
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

      {selectedList.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-primary/30 bg-brand-primary/5 px-4 py-3">
          <span className="text-sm font-medium text-ink">{selectedList.length} selected</span>
          <button
            type="button"
            onClick={() => setShowEmailCampaign(true)}
            className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            Email selected
          </button>
          <button
            type="button"
            onClick={() => void openAddToGroup()}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium"
          >
            Add to group
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="text-xs text-ink-soft hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all on page"
                  />
                </th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Last login</th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        aria-label={`Select ${user.email ?? user.id}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{user.email ?? "—"}</p>
                      <p className="text-xs text-ink-soft">
                        {user.profession ?? "No profession"}
                        {user.providers.length > 0 && (
                          <> · {user.providers.map((p) => (p === "email" ? "magic link" : p)).join(", ")}</>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-soft">{user.role}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{formatRelativeTime(user.lastSignInAt)}</p>
                      <p className="text-xs text-ink-soft">{formatDateTime(user.lastSignInAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{user.attemptCount} attempts</p>
                      <p className="text-xs text-ink-soft">
                        Last: {formatRelativeTime(user.lastActivityAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.banned && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                            Banned
                          </span>
                        )}
                        {user.onboardingComplete ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                            Onboarded
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                            Onboarding
                          </span>
                        )}
                        {!user.emailConfirmed && user.magicLinkPending && (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-soft">
                            Magic link pending
                          </span>
                        )}
                        {user.onboardingComplete && user.emailConfirmed && user.attemptCount === 0 && (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-soft">
                            No practice yet
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-sm font-medium text-brand-primary hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-ink-soft">
          <p>
            {total} user{total === 1 ? "" : "s"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">Add user</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Creates the account and optionally sends a magic-link invite from noreply.
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "learner" | "admin")}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                <option value="learner">Learner</option>
                <option value="admin">Admin</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={sendInvite}
                  onChange={(e) => setSendInvite(e.target.checked)}
                />
                Send invite email with sign-in link
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !newEmail.trim()}
                onClick={() => void handleCreate()}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "Creating…" : "Create user"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailCampaign && token && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailCampaign(false)}
                className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <AdminEmailComposer
              accessToken={token}
              recipientLabel={`${selectedList.length} selected user(s)`}
              audience={{ type: "users", userIds: selectedList }}
              sampleUserId={users.find((u) => selectedIds.has(u.id))?.id}
              sampleEmail={users.find((u) => selectedIds.has(u.id))?.email ?? undefined}
            />
          </div>
        </div>
      )}

      {showAddToGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">Add to group</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Add {selectedList.length} user(s) to a manual group.
            </p>
            {groups.length === 0 ? (
              <p className="mt-4 text-sm text-ink-soft">
                No groups yet.{" "}
                <Link href="/admin/groups" className="text-brand-primary hover:underline">
                  Create one →
                </Link>
              </p>
            ) : (
              <select
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
                className="mt-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.memberCount})
                  </option>
                ))}
              </select>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddToGroup(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !targetGroupId || groups.length === 0}
                onClick={() => void handleAddToGroup()}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
