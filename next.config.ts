import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

/**
 * Set HTTPS_ONLY=1 (at build time) once the site is served over TLS. Over plain
 * HTTP, `upgrade-insecure-requests` makes the browser rewrite every asset URL to
 * https and the page breaks, and HSTS is meaningless, so both are opt-in.
 */
const httpsOnly = process.env.HTTPS_ONLY === "1";

/**
 * Content-Security-Policy
 * ------------------------------------------------------------------
 * Every page is statically generated, so we cannot use per-request nonces
 * without forcing dynamic rendering. Next.js inlines its RSC bootstrap
 * payload as <script> tags, which therefore requires 'unsafe-inline' for
 * scripts. Everything else is locked to our own origin: no third-party
 * scripts, no frames, no form posts elsewhere, no plugins.
 * Fonts are self-hosted by next/font, so no Google font origins are needed.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  ...(!isDev && httpsOnly ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(httpsOnly
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Frames rarely change; cache for a week and revalidate in the background.
        source: "/frames/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
