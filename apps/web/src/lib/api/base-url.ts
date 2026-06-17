/**
 * API base URL. In dev, leave NEXT_PUBLIC_API_URL unset to use the Next.js
 * same-origin proxy (/api/v1 → localhost:8000) and avoid CORS errors.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
