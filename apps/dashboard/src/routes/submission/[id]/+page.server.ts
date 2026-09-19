import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { submissionsService } from "$lib/server/services/submissionsService";

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const data = await submissionsService.getSubmissionDetail(params.id, fetch);
    return { submission: data.data || data };
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message?.includes("404")) {
        throw error(404, "Submission not found");
      }
      throw error(500, err.message || "Internal Server Error");
    }
    throw error(500, "Internal Server Error");
  }
};

export const actions = {
  publish: async ({ request, fetch }) => {
    const data = await request.formData();
    const submissionId = data.get("submissionId")?.toString();

    if (!submissionId) {
      return { success: false, error: "Submission ID is required" };
    }

    try {
      const { catalogService } =
        await import("$lib/server/services/catalogService");
      await catalogService.publishCatalog(submissionId, fetch);
      return { success: true };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: errorMessage };
    }
  },
} satisfies import("./$types").Actions;
