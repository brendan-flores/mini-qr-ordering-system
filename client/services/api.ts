import { parseJsonText } from "@/lib/json";

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
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (cause: unknown) {
    const hint =
      API_BASE_URL && typeof window !== "undefined"
        ? " Check NEXT_PUBLIC_API_BASE_URL is empty on Vercel (same-origin)."
        : "";
    const message =
      cause instanceof Error ? cause.message : "Network request failed";
    throw new ApiError(`${message}${hint}`, 0, cause);
  }

  const text = await res.text();
  let json: unknown | null = null;

  if (text.trim()) {
    try {
      json = parseJsonText(text);
    } catch {
      throw new ApiError(
        "Server returned an invalid response",
        res.status,
        text.slice(0, 200)
      );
    }
  }

  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } } | null)?.error?.message ??
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  if (json === null) {
    throw new ApiError("Empty response from server", res.status);
  }

  return json as T;
}
