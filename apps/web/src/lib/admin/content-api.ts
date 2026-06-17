import { apiUrl } from "@/lib/api/base-url";

export type ContentSkill = "writing" | "reading" | "listening" | "speaking";

export interface AdminContentItem {
  id?: string;
  externalId: string;
  skill: ContentSkill;
  itemType: string;
  title?: string | null;
  payload: Record<string, unknown>;
  isActive: boolean;
  source: string;
  bundled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

async function adminFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text.slice(0, 200) || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAdminContent(
  accessToken: string,
  skill?: ContentSkill,
): Promise<{ bundled: AdminContentItem[]; items: AdminContentItem[] }> {
  const q = skill ? `?skill=${skill}` : "";
  return adminFetch(accessToken, `/api/v1/admin/content${q}`);
}

export const listAdminContent = fetchAdminContent;

export async function fetchLearnerCatalog(
  accessToken: string,
  skill: ContentSkill,
): Promise<{
  skill: ContentSkill;
  bundled: AdminContentItem[];
  custom: AdminContentItem[];
  disabledIds: string[];
}> {
  return adminFetch(accessToken, `/api/v1/content/catalog/${skill}`);
}

export async function createAdminContent(
  accessToken: string,
  body: {
    skill: ContentSkill;
    itemType: string;
    title?: string;
    payload: Record<string, unknown>;
    externalId?: string;
    isActive?: boolean;
  },
): Promise<AdminContentItem> {
  const data = await adminFetch<{ item: AdminContentItem }>(accessToken, "/api/v1/admin/content", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.item;
}

export async function updateAdminContent(
  accessToken: string,
  itemId: string,
  patch: Partial<{
    title: string;
    payload: Record<string, unknown>;
    isActive: boolean;
    itemType: string;
  }>,
): Promise<AdminContentItem> {
  const data = await adminFetch<{ item: AdminContentItem }>(
    accessToken,
    `/api/v1/admin/content/${itemId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
  return data.item;
}

export async function deleteAdminContent(accessToken: string, itemId: string): Promise<void> {
  await adminFetch(accessToken, `/api/v1/admin/content/${itemId}`, { method: "DELETE" });
}

export async function toggleStaticContent(
  accessToken: string,
  skill: ContentSkill,
  externalId: string,
  isActive: boolean,
): Promise<AdminContentItem> {
  const data = await adminFetch<{ item: AdminContentItem }>(
    accessToken,
    "/api/v1/admin/content/toggle-static",
    {
      method: "POST",
      body: JSON.stringify({ skill, externalId, isActive }),
    },
  );
  return data.item;
}

export async function generateAdminContent(
  accessToken: string,
  body: {
    skill: ContentSkill;
    itemType?: string;
    profession?: string;
    country?: string;
    count?: number;
    difficulty?: number;
    weakTags?: string[];
  },
): Promise<AdminContentItem[]> {
  const data = await adminFetch<{ items: AdminContentItem[] }>(
    accessToken,
    "/api/v1/admin/content/generate",
    { method: "POST", body: JSON.stringify(body) },
  );
  return data.items;
}

export async function retrainMlModel(accessToken: string): Promise<{
  ok: boolean;
  modelVersion: string;
  realSamples: number;
}> {
  return adminFetch(accessToken, "/api/v1/admin/ml/retrain", { method: "POST" });
}
