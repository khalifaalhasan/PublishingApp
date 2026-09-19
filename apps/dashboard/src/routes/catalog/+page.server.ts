import type { PageServerLoad } from "./$types";
import { catalogService } from "$lib/server/services/catalogService";

export const load: PageServerLoad = async ({ url, fetch }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;
  const search = url.searchParams.get("search") || undefined;

  try {
    const data = await catalogService.fetchPublicCatalog(
      { page, limit, search },
      fetch,
    );
    return { data };
  } catch (error) {
    return { data: { data: [], total: 0 }, error: String(error) };
  }
};
