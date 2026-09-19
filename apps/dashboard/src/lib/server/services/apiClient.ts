import { env } from "$env/dynamic/private";

const API_BASE_URL = env.API_BASE_URL || "http://localhost:3000";

type FetchOptions = RequestInit & {
  fetch?: typeof fetch;
  token?: string;
};

export const apiClient = async <T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> => {
  const { fetch: customFetch, token, ...restOptions } = options;
  const fetchFn = customFetch || fetch;

  const headers = new Headers(restOptions.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetchFn(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
  });

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorMsg = response.statusText;
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (e) {
        // Fallback
      }
    }
    throw new Error(errorMsg);
  }

  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text() as any;
};
