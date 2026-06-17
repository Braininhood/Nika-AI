import { BUNDLED_LISTENING_PACK_ID } from "./types";

const DEFAULT_BUCKET = "content-packs";

/** Public base URL for Layer B packs — Supabase Storage or local /public fallback. */
export function contentPacksBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_CONTENT_PACKS_URL?.replace(/\/$/, "");
  if (override) return override;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = process.env.NEXT_PUBLIC_CONTENT_PACKS_BUCKET ?? DEFAULT_BUCKET;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/${bucket}`;
  }

  return "";
}

export function bundledListeningManifestUrl(packId: string = BUNDLED_LISTENING_PACK_ID): string {
  const remote = contentPacksBaseUrl();
  if (remote) return `${remote}/${packId}/manifest.json`;
  return `/packs/${packId}/manifest.json`;
}

/** URLs to try in order: Supabase (if configured) then local Next.js /public. */
export function bundledListeningManifestCandidates(
  packId: string = BUNDLED_LISTENING_PACK_ID,
): string[] {
  const local = `/packs/${packId}/manifest.json`;
  const remote = contentPacksBaseUrl();
  if (remote) return [`${remote}/${packId}/manifest.json`, local];
  return [local];
}

export function bundledPackFileCandidates(
  packId: string,
  relativePath: string,
): string[] {
  const local = `/packs/${packId}/${relativePath}`;
  const remote = contentPacksBaseUrl();
  if (remote) return [`${remote}/${packId}/${relativePath}`, local];
  return [local];
}

export function contentStorageMode(): "supabase" | "local" {
  if (typeof window !== "undefined") {
    const mode = sessionStorage.getItem("oet-content-pack-source");
    if (mode === "supabase" || mode === "local") return mode;
  }
  return contentPacksBaseUrl().includes("supabase") ? "supabase" : "local";
}

export function setContentStorageMode(mode: "supabase" | "local"): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("oet-content-pack-source", mode);
  }
}
