import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

import { buildSecurityHeaders } from "./src/lib/security/headers";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

/** OWASP baseline + CSP — HSTS is set by Caddy on EC2. */
const securityHeaders = buildSecurityHeaders(process.env.NODE_ENV === "development");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {},
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.56.1",
    ...extraDevOrigins,
  ],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async rewrites() {
    const apiOrigin =
      process.env.API_PROXY_URL ??
      process.env.API_URL ??
      "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${apiOrigin}/health`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
