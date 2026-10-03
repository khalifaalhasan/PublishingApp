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
  const endpoint = `/submissions/${id}`;
  try {
    // Definisikan tipe wrapper respons dari backend yang membungkus di dalam properti 'data'
    const response = await apiFetch<{ data: SubmissionDetail }>(endpoint, {
      noCache: true,
    });

    console.log(
      `[DEBUG] Raw API Response from ${endpoint}:`,
      JSON.stringify(response, null, 2),
    );

    // Ambil langsung objek di dalam properti 'data'
    const detailData = response?.data
      ? response.data
      : (response as unknown as SubmissionDetail);

    return detailData;
  } catch (error) {
    console.error(
      `[DEBUG ERROR] Failed to fetch submission detail for ID: "${id}"`,
      error,
    );
    throw error;
  }
}

/**
 * POST /submissions/:id/resubmit
 * Mengirim ulang revisi naskah setelah mendapat feedback ACTION_REQUIRED.
 */
export async function resubmitSubmission(
  id: string,
  payload: {
    fileUrl: string;
    fileName: string;
    note?: string;
  },
): Promise<void> {
  const endpoint = `/submissions/${id}/resubmit`;
  console.log(`[DEBUG] POST ${endpoint} with payload:`, payload);

  return apiFetch<void>(endpoint, {
    method: "POST",
    body: payload,
    noCache: true,
  });
}
