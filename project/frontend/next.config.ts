import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence the workspace root lockfile warning
  outputFileTracingRoot: process.env.VERCEL ? undefined : path.join(__dirname, "../../"),

  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache instead of filesystem cache.
      // Filesystem cache causes Windows EPERM rename errors on .pack.gz files;
      // disabling it entirely causes 404 race conditions on dev server restart.
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;

