import { apiFetch } from "@/lib/api-client";
import type { User } from "@/types/api";

/**
 * GET /auth/me
 * Mengambil user yang sedang login berdasarkan session cookie.
 * Hanya untuk Server Components — cookie diforward otomatis.
 *
 * @throws {ApiRequestError} 401 jika tidak terautentikasi
 */
export async function getMe(): Promise<User> {
  return apiFetch<User>("/auth/get-session", {
    noCache: true,
  });
}

/**
 * POST /auth/login
 * Endpoint login konvensional (asumsi ditambahkan di backend karena request tanpa magic link)
 */
export async function loginWithPassword(payload: {
  email: string;
  password?: string;
}) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: payload,
    noCache: true,
  });
}

/**
 * POST /auth/register
 * Endpoint register konvensional
 */
export async function registerWithPassword(payload: {
  name: string;
  email: string;
  password?: string;
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: payload,
    noCache: true,
  });
}
