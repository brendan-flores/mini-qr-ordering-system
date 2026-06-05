import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Allow phones/other devices on the LAN to load dev JS when using the network URL.
  allowedDevOrigins: ["192.168.1.10"],
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
