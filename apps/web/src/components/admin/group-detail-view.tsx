"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminEmailComposer } from "@/components/admin/admin-email-composer";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  type UserGroupDetail,
  fetchGroup,
  removeGroupMember,
  updateGroup,
} from "@/lib/admin/groups-api";
import { formatDateTime } from "@/lib/admin/users-api";

export function GroupDetailView({ groupId }: { groupId: string }) {
  const { session } = useAuth();
  const token = session?.access_token;

  const [group, setGroup] = useState<UserGroupDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroup(token, groupId);
      setGroup(data);
      setName(data.name);
      setDescription(data.description ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, [token, groupId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSave = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await updateGroup(token, groupId, { name: name.trim(), description: description.trim() || undefined });
      setMessage("Group updated.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string, email: string | null) => {
    if (!token || !window.confirm(`Remove ${email ?? userId} from this group?`)) return;
    setBusy(true);
    try {
      await removeGroupMember(token, groupId, userId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove member");
    } finally {
      setBusy(false);
    }
  };

  if (!token) return null;
  if (loading) return <p className="text-sm text-ink-soft">Loading group…</p>;
  if (!group) {
    return (
      <div>
        <p className="text-sm text-red-700">{error ?? "Group not found."}</p>
        <Link href="/admin/groups" className="text-sm text-brand-primary hover:underline">
          ← Audiences
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/groups" className="text-sm text-brand-primary hover:underline">
          ← Audiences
        </Link>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">{group.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {group.memberCount} members · {group.kind}
          {group.filterValue ? ` · ${group.filterValue.replace(/_/g, " ")}` : ""}
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      )}
      {message && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-ink">Group settings</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-ink-soft">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-ink-soft">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleSave()}
          className="mt-4 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
        <p className="mt-3 text-xs text-ink-soft">
          {group.kind === "manual" ? (
            <>
              Add members from the{" "}
              <Link href="/admin/users" className="text-brand-primary hover:underline">
                Users
              </Link>{" "}
              table — select users and choose &quot;Add to group&quot;.
            </>
          ) : (
            <>Members are resolved automatically from learner profiles matching this filter.</>
          )}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-ink">Members</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {group.members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                    No members yet.
                  </td>
                </tr>
              ) : (
                group.members.map((member) => (
                  <tr key={member.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${member.id}`}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        {member.email ?? member.id}
                      </Link>
                      {member.profession && (
                        <p className="text-xs text-ink-soft">{member.profession}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{formatDateTime(member.addedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleRemove(member.id, member.email)}
                        className="text-sm text-red-700 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminEmailComposer
        accessToken={token}
        recipientLabel={`${group.name} (${group.memberCount})`}
        audience={{ type: "group", groupId: group.id }}
        sampleUserId={group.members[0]?.id}
        sampleEmail={group.members[0]?.email ?? undefined}
      />
    </div>
  );
}
