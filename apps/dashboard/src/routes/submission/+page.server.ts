import type { PageServerLoad } from "./$types";
import type { SubmissionStatus, SubmissionType } from "$lib/types/submissions";
import { submissionsService } from "$lib/server/services/submissionsService";

export const load: PageServerLoad = async ({ fetch, url }) => {
  const status =
    (url.searchParams.get("status") as SubmissionStatus) || undefined;
  const type = (url.searchParams.get("type") as SubmissionType) || undefined;

  try {
    const result = await submissionsService.getSubmissions(
      { status, type },
      fetch,
    );

    return {
      submissions: result.data ?? [],
      meta: result.meta ?? null,
    };
  } catch (error) {
    return {
      submissions: [],
      meta: null,
      error: String(error),
    };
  }
};
