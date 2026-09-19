import type { PageServerLoad } from "./$types";
import { getSubmissions } from "$lib/server/services/submissions";
import type { SubmissionStatus, SubmissionType } from "$lib/types/submissions";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const status =
    (url.searchParams.get("status") as SubmissionStatus) || undefined;
  const type = (url.searchParams.get("type") as SubmissionType) || undefined;

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
