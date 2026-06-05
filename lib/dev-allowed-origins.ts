import os from "os";

/** Wildcard host patterns for common private LAN ranges (Next.js allowedDevOrigins). */
const PRIVATE_LAN_PATTERNS = [
  "192.168.*",
  "10.*",
  "172.16.*",
  "172.17.*",
  "172.18.*",
  "172.19.*",
  "172.20.*",
  "172.21.*",
  "172.22.*",
  "172.23.*",
  "172.24.*",
  "172.25.*",
  "172.26.*",
  "172.27.*",
  "172.28.*",
  "172.29.*",
  "172.30.*",
  "172.31.*",
];

function isIpv4Interface(family: string | number): boolean {
  return family === "IPv4" || family === 4;
}

/**
 * Origins allowed to load Next.js dev bundles when the app is opened via LAN IP
 * (e.g. http://192.168.1.25:3000) instead of localhost.
 */
export function getAllowedDevOrigins(): string[] {
  const origins = new Set<string>(PRIVATE_LAN_PATTERNS);

  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (isIpv4Interface(addr.family) && !addr.internal) {
        origins.add(addr.address);
      }
    }
  }

  const fromEnv = process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const origin of fromEnv ?? []) {
    origins.add(origin);
  }

  return [...origins];
}
