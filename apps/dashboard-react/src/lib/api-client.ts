import { cookies, headers } from "next/headers";
import type { ApiError } from "@/types/api";

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────────
// Custom Error
// ─────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }

  toApiError(): ApiError {
    return { status: this.status, message: this.message };
  }
}

// ─────────────────────────────────────────────────────────────
// Cookie forwarding (RSC / Server Action safe)
// Forward session cookie dari browser ke backend secara otomatis
// ─────────────────────────────────────────────────────────────

async function getServerHeaders(): Promise<HeadersInit> {
  try {
    // next/headers hanya tersedia di Server Components & Server Actions
    const cookieStore = await cookies();
    const headerStore = await headers();

    const cookieHeader = cookieStore.toString();
    const forwardedFor = headerStore.get("x-forwarded-for");

    const result: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookieHeader) result["Cookie"] = cookieHeader;
    if (forwardedFor) result["x-forwarded-for"] = forwardedFor;

    return result;
  } catch {
    // Dipanggil dari Client Component — tidak forward cookie server-side
    return { "Content-Type": "application/json" };
  }
}

// ─────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Gunakan cache: 'no-store' untuk data sensitif/real-time */
  noCache?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, noCache, ...rest } = options;

  const serverHeaders = await getServerHeaders();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...serverHeaders,
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: noCache ? "no-store" : rest.cache,
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const errBody = await res.json();
      message = errBody?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiRequestError(res.status, message);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
