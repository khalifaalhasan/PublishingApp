import { apiClient } from "./apiClient";

export const catalogService = {
  fetchPublicCatalog: async (
    query?: { page?: number; limit?: number; search?: string },
    fetch?: typeof globalThis.fetch,
  ) => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search) params.append("search", query.search);

    const queryString = params.toString();
    const endpoint = queryString ? `/catalog?${queryString}` : "/catalog";

    return apiClient<any>(endpoint, { fetch });
  },

  fetchCatalogDetail: async (slug: string, fetch?: typeof globalThis.fetch) => {
    return apiClient<any>(`/catalog/${slug}`, { fetch });
  },

  publishCatalog: async (
    submissionId: string,
    fetch?: typeof globalThis.fetch,
  ) => {
    return apiClient<any>("/catalog/publish", {
      method: "POST",
      body: JSON.stringify({ submissionId }),
      fetch,
    });
  },
};
