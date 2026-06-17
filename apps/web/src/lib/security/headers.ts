function supabaseConnectOrigins(): string[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const parsed = new URL(url);
    return [parsed.origin, `wss://${parsed.host}`];
  } catch {
    return [];
  }
}

/** Content-Security-Policy tuned for Next.js App Router + Supabase auth + PWA. */
export function buildContentSecurityPolicy(isDev: boolean): string {
  const connectSrc = ["'self'", ...supabaseConnectOrigins()];
  if (isDev) {
    connectSrc.push("ws://localhost:*", "ws://127.0.0.1:*", "http://localhost:*", "http://127.0.0.1:*");
  }

  const scriptSrc = isDev
    ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    : ["'self'", "'unsafe-inline'"];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function buildSecurityHeaders(isDev: boolean): { key: string; value: string }[] {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(self), geolocation=()",
    },
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(isDev) },
  ];
}

export function applySecurityHeaders<T extends { headers: Headers }>(response: T, isDev: boolean): T {
  for (const { key, value } of buildSecurityHeaders(isDev)) {
    response.headers.set(key, value);
  }
  return response;
}
