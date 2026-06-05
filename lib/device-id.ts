/** UUID or dev fallback from client localStorage. */
const DEVICE_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export function normalizeDeviceId(
  value: string | null | undefined
): string | null {
  const id = value?.trim();
  if (!id || !DEVICE_ID_RE.test(id)) return null;
  return id;
}
