const BLOCKED_SCHEME = /^(javascript|data|vbscript|file):/i;

const TRAILING_PUNCT = /[.,;:!?)]+$/;

export function trimUrl(raw: string): string {
  return raw.replace(TRAILING_PUNCT, "");
}

/** Safe in-app path: single leading slash, not protocol-relative. */
export function isSafeInternalPath(href: string): boolean {
  const trimmed = href.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\");
}

/** Allow only http(s) URLs; bare domains become https://. */
export function sanitizeExternalHref(raw: string): string | null {
  const trimmed = trimUrl(raw.trim());
  if (!trimmed || BLOCKED_SCHEME.test(trimmed)) return null;

  const href =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(href);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export type SafeHref =
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string };

export function resolveSafeHref(raw: string): SafeHref | null {
  const trimmed = raw.trim();
  if (isSafeInternalPath(trimmed)) {
    return { kind: "internal", href: trimmed };
  }
  const external = sanitizeExternalHref(trimmed);
  if (external) return { kind: "external", href: external };
  return null;
}
