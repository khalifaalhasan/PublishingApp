import { apiFetch } from "@/lib/api-client";
import type { Notification } from "@/types/api";

// ─────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────

/**
 * GET /notifications
 * Mengambil seluruh notifikasi milik user yang sedang login.
 * Backend memfilter otomatis berdasarkan userId.
 *
 * @throws {ApiRequestError} 401 jika tidak terautentikasi
 */
export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>("/notifications", {
    noCache: true,
  });
}

/**
 * PATCH /notifications/:id/read
 * Menandai notifikasi sebagai sudah dibaca.
 * User hanya dapat mengubah notifikasi miliknya sendiri (enforced di backend).
 *
 * @throws {ApiRequestError} 403 jika bukan notifikasi milik user
 * @throws {ApiRequestError} 404 jika notifikasi tidak ditemukan
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, {
    method: "PATCH",
    body: { isRead: true },
    noCache: true,
  });
}

/**
 * Helper — hitung jumlah notifikasi yang belum dibaca
 */
export function countUnread(notifications: Notification[]): number {
  return notifications.filter((n) => !n.isRead).length;
}
