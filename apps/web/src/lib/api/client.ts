import type { OutboxEntry } from "@/lib/db/types";

import { apiUrl } from "./base-url";

export async function sendOutboxEntry(
  entry: OutboxEntry,
  accessToken?: string,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Idempotency-Key": entry.id,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    throw new Error("Sign in required for sync");
  }

  let path = "/api/v1/progress/sync";
  if (entry.type === "AI_WRITING") path = "/api/v1/ai/writing-feedback";
  if (entry.type === "AI_SPEAKING") path = "/api/v1/ai/speaking-feedback";

  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers,
    body: JSON.stringify(entry.payload),
  });

  if (!response.ok) {
    throw new Error("Sync failed. Please try again when you are online.");
  }
}

export async function fetchApiMe(accessToken: string) {
  const response = await fetch(apiUrl("/api/v1/auth/me"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl("/health"), { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchApiJson<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  const response = await fetch(apiUrl(path), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not reach the server. Please try again.");
  }
  return response.json() as Promise<T>;
}

export { apiUrl, getApiBaseUrl } from "./base-url";
