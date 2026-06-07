import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { getAllowedDevOrigins } from "./lib/shared/config/dev-allowed-origins";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // LAN IPs on this machine + private-range wildcards (any laptop / phone on Wi‑Fi).
  allowedDevOrigins: getAllowedDevOrigins(),
  serverExternalPackages: ["mysql2"],
  // Stable project root (path has spaces on some machines)
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const ignored = [
        "**/node_modules/**",
        "**/.git/**",
        "**/.next/**",
        path.join(projectRoot, ".next"),
      ];
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...(Array.isArray(config.watchOptions?.ignored)
            ? config.watchOptions.ignored
            : []),
          ...ignored,
        ],
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
