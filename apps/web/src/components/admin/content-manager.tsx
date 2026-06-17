"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  type AdminContentItem,
  type ContentSkill,
  createAdminContent,
  deleteAdminContent,
  fetchAdminContent,
  generateAdminContent,
  retrainMlModel,
  toggleStaticContent,
  updateAdminContent,
} from "@/lib/admin/content-api";
import { bundledStaticItems } from "@/lib/content/static-bundled";

const SKILLS: { id: ContentSkill; label: string }[] = [
  { id: "writing", label: "Writing" },
  { id: "reading", label: "Reading" },
  { id: "listening", label: "Listening" },
  { id: "speaking", label: "Speaking" },
];

export function ContentManager() {
  const { session } = useAuth();
  const searchParams = useSearchParams();
  const token = session?.access_token;
  const initialSkill = (searchParams.get("skill") as ContentSkill | null) ?? "writing";
  const [skill, setSkill] = useState<ContentSkill>(
    SKILLS.some((s) => s.id === initialSkill) ? initialSkill : "writing",
  );
  const [bundled, setBundled] = useState<AdminContentItem[]>([]);
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draftJson, setDraftJson] = useState("{}");
  const [draftTitle, setDraftTitle] = useState("");

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminContent(token, skill);
      setBundled(data.bundled);
      setItems(data.items.filter((i) => i.skill === skill));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, skill]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const startEdit = (item: AdminContentItem) => {
    if (!item.id) return;
    setEditId(item.id);
    setDraftTitle(item.title ?? item.externalId);
    setDraftJson(JSON.stringify(item.payload ?? {}, null, 2));
  };

  const saveEdit = async () => {
    if (!token || !editId) return;
    setBusy(true);
    try {
      let payload: Record<string, unknown>;
      payload = JSON.parse(draftJson) as Record<string, unknown>;
      await updateAdminContent(token, editId, { title: draftTitle, payload });
      setEditId(null);
      await reload();
    } catch {
      setError("Invalid JSON or save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      await generateAdminContent(token, {
        skill,
        itemType: skill === "writing" ? "scenario" : skill === "speaking" ? "role_card" : "quiz_question",
        count: skill === "writing" || skill === "speaking" ? 1 : 5,
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAddBlank = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await createAdminContent(token, {
        skill,
        itemType: skill === "writing" ? "scenario" : "quiz_question",
        title: "New item",
        payload: { id: `${skill}-custom-${Date.now()}`, title: "New item" },
      });
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const handleRetrain = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const r = await retrainMlModel(token);
      setError(null);
      alert(`Model retrained: ${r.modelVersion} (${r.realSamples} real samples)`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Retrain failed");
    } finally {
      setBusy(false);
    }
  };

  const staticBundled = bundledStaticItems(skill);

  if (!token) {
    return <p className="text-sm text-ink-soft">Sign in as admin to manage content.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Content manager</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Add, edit, generate, enable or disable content for all four skills.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleAddBlank()}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium"
          >
            Add blank
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
            className="rounded-xl bg-brand-accent px-3 py-2 text-sm font-semibold text-ink"
          >
            Generate (AI)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleRetrain()}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium"
          >
            Retrain ML
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SKILLS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSkill(s.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              skill === s.id ? "bg-brand-primary text-white" : "bg-surface-muted text-ink-soft"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <>
          {staticBundled.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-ink">Bundled {skill} content</h3>
              <ul className="mt-3 max-h-80 divide-y divide-border overflow-y-auto rounded-2xl border border-border bg-surface">
                {staticBundled.map((b) => {
                  const override = items.find(
                    (i) => i.externalId === b.externalId && i.source === "static_override",
                  );
                  const active = override ? override.isActive : true;
                  return (
                    <li key={b.externalId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="min-w-0 truncate text-ink">{b.title}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void toggleStaticContent(token, skill, b.externalId, !active).then(reload)
                        }
                        className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${
                          active ? "bg-forest/10 text-forest" : "bg-surface-muted text-ink-soft"
                        }`}
                      >
                        {active ? "In use" : "Not in use"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {skill === "writing" && bundled.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-ink">API writing scenarios (JSON)</h3>
              <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
                {bundled.map((b) => {
                  const override = items.find(
                    (i) => i.externalId === b.externalId && i.source === "static_override",
                  );
                  const active = override ? override.isActive : true;
                  return (
                    <li key={b.externalId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="text-ink">{b.title ?? b.externalId}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void toggleStaticContent(token, skill, b.externalId, !active).then(reload)
                        }
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                          active ? "bg-forest/10 text-forest" : "bg-surface-muted text-ink-soft"
                        }`}
                      >
                        {active ? "In use" : "Not in use"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-ink">Database items</h3>
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {items.filter((i) => i.source !== "static_override").length === 0 && (
                <li className="px-4 py-6 text-sm text-ink-soft">No custom items yet — add or generate.</li>
              )}
              {items
                .filter((i) => i.source !== "static_override")
                .map((item) => (
                  <li key={item.id} className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-ink">{item.title ?? item.externalId}</p>
                        <p className="text-xs text-ink-soft">
                          {item.externalId} · {item.itemType} · {item.source}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!item.id}
                          onClick={() => {
                            if (!item.id) return;
                            void updateAdminContent(token, item.id, {
                              isActive: !item.isActive,
                            }).then(reload);
                          }}
                          className="rounded-lg border border-border px-2 py-1 text-xs"
                        >
                          {item.isActive ? "In use" : "Not in use"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-border px-2 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={!item.id}
                          onClick={() => {
                            if (!item.id) return;
                            void deleteAdminContent(token, item.id).then(reload);
                          }}
                          className="rounded-lg border border-danger/30 px-2 py-1 text-xs text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}

      {editId && (
        <section className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="font-semibold text-ink">Edit item</h3>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
          <textarea
            value={draftJson}
            onChange={(e) => setDraftJson(e.target.value)}
            rows={12}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2 font-mono text-xs"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveEdit()}
              className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
