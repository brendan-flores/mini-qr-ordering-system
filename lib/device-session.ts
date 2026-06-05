const DEVICE_ID_KEY = "brencravings-device-id";

function newDeviceId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readStoredDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(DEVICE_ID_KEY) ??
      window.sessionStorage.getItem(DEVICE_ID_KEY)
    );
  } catch {
    return null;
  }
}

function persistDeviceId(id: string) {
  try {
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.setItem(DEVICE_ID_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Stable id for this browser / phone (localStorage with sessionStorage fallback). */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  const existing = readStoredDeviceId();
  if (existing) return existing;

  const id = newDeviceId();
  persistDeviceId(id);
  return id;
}
