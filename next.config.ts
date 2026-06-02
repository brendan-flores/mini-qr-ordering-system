import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js"],
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
