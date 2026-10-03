import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tronweb"],
  async rewrites() {
    return [
      // SPA fallback for the trading bot UI (static files in public/bot)
      { source: "/bot", destination: "/bot/index.html" },
      { source: "/bot/", destination: "/bot/index.html" },
    ];
  },
};

export default nextConfig;
