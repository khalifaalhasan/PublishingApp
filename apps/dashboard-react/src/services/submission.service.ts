import { apiFetch } from "@/lib/api-client";
import type {
  PaginatedResponse,
  Submission,
  SubmissionDetail,
  SubmissionStatus,
  SubmissionType,
} from "@/types/api";

// ─────────────────────────────────────────────────────────────
// Query Params
// ─────────────────────────────────────────────────────────────

export interface GetSubmissionsParams {
  status?: SubmissionStatus;
  type?: SubmissionType;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────

/**
 * GET /submissions
 * Mengambil daftar submission milik user yang sedang login.
 * Backend otomatis memfilter berdasarkan ownership (USER role).
 *
 * @throws {ApiRequestError} 401 jika tidak terautentikasi
 */
export async function getSubmissions(
  params: GetSubmissionsParams = {},
): Promise<PaginatedResponse<Submission>> {
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch<PaginatedResponse<Submission>>(
    `/submissions${qs ? `?${qs}` : ""}`,
    { noCache: true },
  );
}

/**
 * GET /submissions/:id
 * Mengambil detail submission berdasarkan ID.
 * Backend memvalidasi ownership — USER hanya bisa akses miliknya sendiri.
 *
 * @throws {ApiRequestError} 401 jika tidak terautentikasi
 * @throws {ApiRequestError} 403 jika bukan pemilik submission
 * @throws {ApiRequestError} 404 jika submission tidak ditemukan
 */
export async function getSubmissionDetail(
  id: string,
): Promise<SubmissionDetail> {
  return apiFetch<SubmissionDetail>(`/submissions/${id}`, {
    noCache: true,
  });
}

/**
 * POST /submissions/:id/resubmit
 * Mengirim ulang revisi naskah setelah mendapat feedback ACTION_REQUIRED.
 *
 * @throws {ApiRequestError} 400 jika status bukan ACTION_REQUIRED
 * @throws {ApiRequestError} 403 jika bukan pemilik submission
 */
export async function resubmitSubmission(
  id: string,
  payload: {
    fileUrl: string;
    fileName: string;
    note?: string;
  },
): Promise<void> {
  return apiFetch<void>(`/submissions/${id}/resubmit`, {
    method: "POST",
    body: payload,
    noCache: true,
  });
}
