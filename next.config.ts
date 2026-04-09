import type { NextConfig } from 'next';

// Supabase project URL is needed in CSP connect-src so the browser can reach it.
// We read it at build time; if unset we fall back to a wildcard supabase.co pattern.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : '*.supabase.co';

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js dev mode injects inline scripts; unsafe-eval is needed for Fast Refresh.
  // In production these could be tightened further with nonces.
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // Supabase REST + Auth + Realtime
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Disallow embedding in iframes
  { key: 'X-Frame-Options', value: 'DENY' },
  // Referrer policy — sends origin only, no path
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // HSTS — 2 years, include subdomains, preload-eligible
  // Only sent over HTTPS; browsers ignore it on HTTP, so safe to set unconditionally.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Restrict browser feature APIs the app doesn't use
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP
  { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
