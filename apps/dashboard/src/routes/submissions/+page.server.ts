import type { PageServerLoad } from "./$types";
import getSubmissions from "$lib/server/services/submissions";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const status = url.searchParams.get("status") || undefined;
  const type = url.searchParams.get("type") || undefined;

  const result = await getSubmissions(fetch, {
    status,
    type,
    offset: 0,
    limit: 10,
  });

  return {
    submissions: result.items,
    meta: result.meta,
  };
};
