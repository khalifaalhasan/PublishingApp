import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { authService } from "$lib/server/services/authService";

export const POST: RequestHandler = async ({ fetch }) => {
  try {
    await authService.signOut(fetch);
  } catch (err) {
    // Ignore error on signout
  }

  throw redirect(303, "/auth/login");
};
