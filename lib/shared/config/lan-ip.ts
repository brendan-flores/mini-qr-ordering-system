import os from "os";

function isIpv4(family: string | number): boolean {
  return family === "IPv4" || family === 4;
}

/** Non-loopback IPv4 addresses on this machine (e.g. 192.168.1.25). */
export function getLocalLanIpv4s(): string[] {
  const ips: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (isIpv4(addr.family) && !addr.internal) {
        ips.push(addr.address);
      }
    }
  }
  return ips;
}

/** Prefer home Wi‑Fi style 192.168.x.x, then 10.x, then other private IPs. */
export function getPrimaryLanIpv4(): string | null {
  const ips = getLocalLanIpv4s();
  return (
    ips.find((ip) => ip.startsWith("192.168.")) ??
    ips.find((ip) => ip.startsWith("10.")) ??
    ips.find((ip) => /^172\.(1[6-9]|2\d|3[01])\./.test(ip)) ??
    ips[0] ??
    null
  );
}

export function getDevLanOrigin(port = "3000"): string | null {
  const ip = getPrimaryLanIpv4();
  if (!ip) return null;
  return `http://${ip}:${port}`;
}
