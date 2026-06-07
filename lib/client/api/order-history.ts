/**
 * Order ids for "Your Orders" on this device (localStorage).
 * Combined with client_device_id on the server, another phone scanning the
 * same table QR cannot see these orders.
 */
const ORDER_IDS_KEY = "brencravings-order-ids";
const LEGACY_SESSION_KEY = "brencravings-order-ids";
const MAX_IDS = 50;
/** Guest history window — ids older than this are dropped locally. */
const MAX_AGE_MS = 72 * 60 * 60 * 1000;

type StoredEntry = { id: string; at: number };

function readEntries(): StoredEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDER_IDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === "string") {
          const now = Date.now();
          return (parsed as string[])
            .filter(Boolean)
            .map((id) => ({ id: String(id), at: now }));
        }
        if (typeof parsed[0] === "object" && parsed[0] !== null) {
          return (parsed as StoredEntry[])
            .filter((e) => e?.id)
            .map((e) => ({ id: String(e.id), at: Number(e.at) || Date.now() }));
        }
      }
    }

    const legacy = window.sessionStorage.getItem(LEGACY_SESSION_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      if (Array.isArray(parsed)) {
        const now = Date.now();
        const migrated = parsed
          .map(String)
          .filter(Boolean)
          .map((id) => ({ id, at: now }));
        if (migrated.length > 0) {
          writeEntries(migrated);
          window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
        }
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function writeEntries(entries: StoredEntry[]) {
  if (typeof window === "undefined") return;
  const cutoff = Date.now() - MAX_AGE_MS;
  const pruned = entries
    .filter((e) => e.at >= cutoff)
    .slice(0, MAX_IDS);
  const unique: StoredEntry[] = [];
  const seen = new Set<string>();
  for (const e of pruned) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    unique.push(e);
  }
  window.localStorage.setItem(ORDER_IDS_KEY, JSON.stringify(unique));
}

export function getStoredOrderIds(): string[] {
  return readEntries()
    .sort((a, b) => b.at - a.at)
    .map((e) => e.id);
}

export function rememberOrderId(id: string | number) {
  if (typeof window === "undefined") return;
  const key = String(id);
  const now = Date.now();
  const entries = readEntries().filter((e) => e.id !== key);
  entries.unshift({ id: key, at: now });
  writeEntries(entries);
}

export function forgetOrderId(id: string | number) {
  const key = String(id);
  writeEntries(readEntries().filter((e) => e.id !== key));
}
