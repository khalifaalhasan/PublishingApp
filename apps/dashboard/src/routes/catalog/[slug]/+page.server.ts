import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { catalogService } from "$lib/server/services/catalogService";

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const response = await catalogService.fetchCatalogDetail(
      params.slug,
      fetch,
    );

    // Check if the response contains success: false or similar pattern from API
    if (response.success === false) {
      throw error(404, response.error || "Catalog not found");
    }

    return { catalog: response.data || response };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if ("status" in err && (err as any).status === 404) {
        throw error(404, "Catalog not found");
      }
      throw error(500, err.message || "Internal Server Error");
    }
    throw error(500, "Internal Server Error");
  }
};
