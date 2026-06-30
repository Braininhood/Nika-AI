import { apiUrl } from "@/lib/api/base-url";

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function mapKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => mapKeys(item)) as T;
  }
  if (!obj || typeof obj !== "object") return obj as T;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = snakeToCamel(k);
    if (v && typeof v === "object") {
      out[key] = mapKeys(v);
    } else {
      out[key] = v;
    }
  }
  return out as T;
}

function parseJsonBody<T>(text: string): T {
  if (!text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

export async function adminFetch<T>(
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

  const text = await res.text();

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = parseJsonBody<{ detail?: string }>(text);
      if (body?.detail) detail = body.detail;
    } catch {
      if (text) detail = text.slice(0, 200);
    }
    throw new Error(detail);
  }

  if (res.status === 204 || !text.trim()) return undefined as T;
  return mapKeys<T>(parseJsonBody(text));
}
