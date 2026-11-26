import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Cloudflare トンネル経由 dev。HMR がエッジでキャッシュされると full reload ループになりやすい */
const DEV_NO_STORE_HEADERS = [
  { key: "Cache-Control", value: "private, no-cache, no-store, max-age=0, must-revalidate" },
  { key: "CDN-Cache-Control", value: "no-store" },
  { key: "Cloudflare-CDN-Cache-Control", value: "no-store" },
  { key: "Pragma", value: "no-cache" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  ...(isDev
    ? {
        allowedDevOrigins: [
          "godabo-1-dev.creathree.com",
          "godabo-1.creathree.com",
          "*.creathree.com",
          "127.0.0.1:3011",
        ],
      }
    : {}),
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    if (!isDev) return [];
    return [{ source: "/_next/:path*", headers: DEV_NO_STORE_HEADERS }];
  },
};

export default nextConfig;