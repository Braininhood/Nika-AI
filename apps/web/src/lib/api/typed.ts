import type { paths } from "./schema";
import { apiUrl } from "./base-url";

export type HealthResponse =
  paths["/health"]["get"]["responses"][200]["content"]["application/json"];

export type AuthMeResponse =
  paths["/api/v1/auth/me"]["get"]["responses"][200]["content"]["application/json"];

export async function apiGet<T>(path: string, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(apiUrl(path), { headers, cache: "no-store" });
  if (!response.ok) throw new Error("Could not reach the server. Please try again.");
  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/health");
}

export async function getAuthMe(accessToken: string): Promise<AuthMeResponse> {
  return apiGet<AuthMeResponse>("/api/v1/auth/me", accessToken);
}
