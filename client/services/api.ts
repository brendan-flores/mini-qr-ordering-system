export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function adminHeaders(): Record<string, string> {
  const key = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
  return key ? { "x-admin-key": key } : {};
}

/** Admin dashboard / kitchen API calls (optional x-admin-key in production). */
export async function adminApiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    headers: {
      ...adminHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const message =
      (json as any)?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  return json as T;
}

