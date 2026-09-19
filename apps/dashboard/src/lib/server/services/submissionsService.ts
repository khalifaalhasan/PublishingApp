import { apiClient } from "./apiClient";

export const submissionsService = {
  getSubmissions: async (
    query?: { page?: number; limit?: number; status?: string; type?: string },
    fetch?: typeof globalThis.fetch,
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.status) params.append("status", query.status);
    if (query?.type) params.append("type", query.type);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/api/submissions?${queryString}`
      : "/api/submissions";

    return apiClient<any>(endpoint, { fetch });
  },

  getSubmissionDetail: async (id: string, fetch?: typeof globalThis.fetch) => {
    return apiClient<any>(`/api/submissions/${id}`, { fetch });
  },
};
