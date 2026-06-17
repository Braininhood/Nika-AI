"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth/auth-provider";
import {
  createAdminContent,
  deleteAdminContent,
  generateAdminContent,
  listAdminContent,
  toggleStaticContent,
  updateAdminContent,
  type AdminContentItem,
  type ContentSkill,
} from "@/lib/admin/content-api";

export interface StaticCatalogItem {
  externalId: string;
  title: string;
  payload?: Record<string, unknown>;
}

interface SkillContentManagerProps {
  skill: ContentSkill;
  title: string;
  subtitle: string;
  staticCatalog: StaticCatalogItem[];
  defaultItemType: string;
  generateItemType?: string;
}

export function SkillContentManager({
  skill,
  title,
  subtitle,
  staticCatalog,
  defaultItemType,
  generateItemType,
}: SkillContentManagerProps) {
  const { session } = useAuth();
  const token = session?.access_token;

  const [bundled, setBundled] = useState<AdminContentItem[]>([]);
  const [dbItems, setDbItems] = useState<AdminContentItem[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string>("");
  const [draftJson, setDraftJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminContent(token, skill);
      setBundled(data.bundled);
      setDbItems(data.items.filter((i) => i.source !== "static_override"));
      const off = new Set(
        data.items
          .filter((i) => i.source === "static_override" && !i.isActive)
          .map((i) => i.externalId),
      );
      setDisabledIds(off);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load content");
    } finally {
      setLoading(false);
    }
  }, [token, skill]);

  useEffect(() => {
    void load();
  }, [load]);

  const staticRows = useMemo(() => {
    const fromApi = new Map(bundled.map((b) => [b.externalId, b]));
    const merged = staticCatalog.map((s) => {
      const api = fromApi.get(s.externalId);
      return {
        externalId: s.externalId,
        title: api?.title ?? s.title,
        isActive: !disabledIds.has(s.externalId),
        bundled: true as const,
        payload: api?.payload ?? s.payload ?? {},
      };
    });
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (r) => r.externalId.toLowerCase().includes(q) || r.title.toLowerCase().includes(q),
    );
  }, [staticCatalog, bundled, disabledIds, query]);

  const customRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dbItems;
    return dbItems.filter(
      (r) =>
        r.externalId.toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q),
    );
  }, [dbItems, query]);

  const selected = useMemo(() => {
    const custom = dbItems.find((i) => i.id === selectedId || i.externalId === selectedId);
    if (custom) return { kind: "custom" as const, item: custom };
    const stat = staticRows.find((s) => s.externalId === selectedId);
    if (stat) return { kind: "static" as const, item: stat };
    return null;
  }, [dbItems, staticRows, selectedId]);

  const loadDraft = () => {
    if (!selected) return;
    const payload =
      selected.kind === "custom"
        ? selected.item.payload
        : selected.item.payload;
    setDraftJson(JSON.stringify(payload, null, 2));
  };

  const handleToggleStatic = async (externalId: string, isActive: boolean) => {
    if (!token) return;
    setBusy(true);
    try {
      await toggleStaticContent(token, skill, externalId, isActive);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
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
        itemType: generateItemType ?? defaultItemType,
        count: skill === "writing" || skill === "speaking" ? 1 : 5,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveNew = async () => {
    if (!token || !draftJson.trim()) return;
    setBusy(true);
    try {
      const payload = JSON.parse(draftJson) as Record<string, unknown>;
      const item = await createAdminContent(token, {
        skill,
        itemType: defaultItemType,
        title: String(payload.title ?? payload.id ?? "New item").slice(0, 120),
        payload,
        externalId: typeof payload.id === "string" ? payload.id : undefined,
      });
      setSelectedId(item.id ?? item.externalId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async () => {
    if (!token || !selected || selected.kind !== "custom" || !selected.item.id) return;
    setBusy(true);
    try {
      const payload = JSON.parse(draftJson) as Record<string, unknown>;
      await updateAdminContent(token, selected.item.id, {
        title: String(payload.title ?? selected.item.title ?? "").slice(0, 120),
        payload,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selected || selected.kind !== "custom" || !selected.item.id) return;
    if (!window.confirm("Delete this item permanently?")) return;
    setBusy(true);
    try {
      await deleteAdminContent(token, selected.item.id);
      setSelectedId("");
      setDraftJson("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (item: AdminContentItem, isActive: boolean) => {
    if (!token || !item.id) return;
    setBusy(true);
    try {
      await updateAdminContent(token, item.id, { isActive });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return <p className="text-sm text-ink-soft">Sign in as admin to manage content.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleGenerate()}
            className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Generate with AI
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setSelectedId("");
              setDraftJson("{}");
            }}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink"
          >
            New draft
          </button>
        </div>
      </div>

      <input
        type="search"
        placeholder="Search id or title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
      />

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-ink-soft">Loading…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-ink">Bundled content</h3>
              <ul className="mt-2 max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
                {staticRows.map((row) => (
                  <li key={row.externalId} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left hover:text-brand-primary"
                      onClick={() => setSelectedId(row.externalId)}
                    >
                      <span className="font-medium text-ink">{row.title}</span>
                      <span className="block text-xs text-ink-soft">{row.externalId}</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleToggleStatic(row.externalId, !row.isActive)}
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
                        row.isActive
                          ? "bg-forest/10 text-forest"
                          : "bg-surface-muted text-ink-soft"
                      }`}
                    >
                      {row.isActive ? "In use" : "Off"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-ink">Custom / generated</h3>
              <ul className="mt-2 max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border bg-surface">
                {customRows.length === 0 && (
                  <li className="px-3 py-4 text-xs text-ink-soft">No custom items yet.</li>
                )}
                {customRows.map((row) => (
                  <li key={row.id ?? row.externalId} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left hover:text-brand-primary"
                      onClick={() => setSelectedId(row.id ?? row.externalId)}
                    >
                      <span className="font-medium text-ink">{row.title ?? row.externalId}</span>
                      <span className="block text-xs text-ink-soft">
                        {row.source} · {row.externalId}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={busy || !row.id}
                      onClick={() => void handleToggleActive(row, !row.isActive)}
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
                        row.isActive
                          ? "bg-forest/10 text-forest"
                          : "bg-surface-muted text-ink-soft"
                      }`}
                    >
                      {row.isActive ? "In use" : "Off"}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="font-semibold text-ink">Editor</h3>
            {selected ? (
              <p className="mt-1 text-xs text-ink-soft">
                {selected.kind === "static" ? "Bundled (toggle use above)" : "Database item"} ·{" "}
                {selected.kind === "custom" ? selected.item.externalId : selected.item.externalId}
              </p>
            ) : (
              <p className="mt-1 text-xs text-ink-soft">Select an item or start a new draft.</p>
            )}
            <textarea
              value={draftJson}
              onChange={(e) => setDraftJson(e.target.value)}
              rows={14}
              className="mt-3 w-full rounded-xl border border-border bg-canvas p-3 font-mono text-xs"
              placeholder="JSON payload…"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {selected && (
                <button
                  type="button"
                  onClick={loadDraft}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                >
                  Load selected
                </button>
              )}
              <button
                type="button"
                disabled={busy || !draftJson.trim()}
                onClick={() => void handleSaveNew()}
                className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-ink"
              >
                Save as new
              </button>
              {selected?.kind === "custom" && selected.item.id && (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleUpdate()}
                    className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete()}
                    className="rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
