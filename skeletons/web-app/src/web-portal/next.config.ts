import type { NextConfig } from 'next';

const config: NextConfig = {
  // Required for the Dockerfile in this skeleton — produces a minimal,
  // self-contained `.next/standalone/` output that runs without
  // `node_modules` at runtime.
  output: 'standalone',

  // Strict mode in dev catches a wide class of React anti-patterns.
  reactStrictMode: true,

  // Disable the X-Powered-By header; nothing useful, slight info leak.
  poweredByHeader: false,

  // Forward API requests to the backend. Set NEXT_PUBLIC_API_URL in env.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    return [
      { source: '/api/bff/:path*', destination: `${apiUrl}/:path*` },
    ];
  },

  // Optional: image domains for next/image. Add hosts your app loads from.
  images: {
    remotePatterns: [],
  },
};

export default config;
