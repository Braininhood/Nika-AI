"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  type SmartSegment,
  type UserGroupSummary,
  createGroup,
  deleteGroup,
  fetchGroups,
  fetchSegments,
} from "@/lib/admin/groups-api";

const AdminEmailComposer = dynamic(
  () => import("@/components/admin/admin-email-composer").then((m) => m.AdminEmailComposer),
  { ssr: false },
);

export function GroupsManager() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [groups, setGroups] = useState<UserGroupSummary[]>([]);
  const [segments, setSegments] = useState<SmartSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newKind, setNewKind] = useState<"manual" | "profession" | "country">("manual");
  const [newFilterValue, setNewFilterValue] = useState("");
  const [campaignSegment, setCampaignSegment] = useState<SmartSegment | null>(null);

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

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [groupRows, segmentRows] = await Promise.all([
        fetchGroups(token),
        fetchSegments(token),
      ]);
      setGroups(Array.isArray(groupRows) ? groupRows : []);
      setSegments(Array.isArray(segmentRows) ? segmentRows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audiences");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleCreate = async () => {
    if (!token || !newName.trim()) return;
    setBusy(true);
    try {
      await createGroup(token, {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        kind: newKind,
        filterValue: newKind === "manual" ? undefined : newFilterValue.trim() || undefined,
      });
      setShowCreate(false);
      setNewName("");
      setNewDescription("");
      setNewKind("manual");
      setNewFilterValue("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create group");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (groupId: string, name: string) => {
    if (!token || !window.confirm(`Delete group "${name}"?`)) return;
    setBusy(true);
    try {
      await deleteGroup(token, groupId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete group");
    } finally {
      setBusy(false);
    }
  };

  if (!token) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Audiences</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Manual groups for cohorts you curate, plus smart segments computed from live user data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          New group
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-ink">Smart segments</h3>
        <p className="mt-1 text-sm text-ink-soft">Auto-updated filters — ideal for re-engagement campaigns.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {loading ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.id}
                className="rounded-xl border border-border bg-surface-muted/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{segment.name}</p>
                    <p className="mt-1 text-xs text-ink-soft">{segment.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                    {segment.memberCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCampaignSegment(segment)}
                  className="mt-3 text-sm font-medium text-brand-primary hover:underline"
                >
                  Email segment →
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-ink">Groups</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Manual lists, or dynamic groups by profession / country (members update automatically).
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                    No groups yet — create one to start building a cohort.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-ink-soft">{group.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-soft">
                      {group.kind}
                      {group.filterValue && (
                        <span className="block text-xs normal-case text-ink-soft/80">
                          {group.filterValue.replace(/_/g, " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink">{group.memberCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/groups/${group.id}`}
                        className="mr-3 text-sm font-medium text-brand-primary hover:underline"
                      >
                        Manage
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete(group.id, group.name)}
                        className="text-sm text-red-700 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {campaignSegment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCampaignSegment(null)}
                className="rounded-lg bg-surface px-3 py-1.5 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <AdminEmailComposer
              accessToken={token}
              recipientLabel={`${campaignSegment.name} (${campaignSegment.memberCount})`}
              audience={{ type: "segment", segmentId: campaignSegment.id }}
            />
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">New group</h3>
            <div className="mt-4 space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Group name"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
              <select
                value={newKind}
                onChange={(e) => setNewKind(e.target.value as "manual" | "profession" | "country")}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                <option value="manual">Manual — pick users yourself</option>
                <option value="profession">By profession — auto-includes matching learners</option>
                <option value="country">By country — auto-includes target country</option>
              </select>
              {newKind === "profession" && (
                <select
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
                >
                  <option value="">Select profession…</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              )}
              {newKind === "country" && (
                <input
                  value={newFilterValue}
                  onChange={(e) => setNewFilterValue(e.target.value)}
                  placeholder="Country name (e.g. UK, Australia)"
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
                />
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !newName.trim() ||
                  (newKind !== "manual" && !newFilterValue.trim())
                }
                onClick={() => void handleCreate()}
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
