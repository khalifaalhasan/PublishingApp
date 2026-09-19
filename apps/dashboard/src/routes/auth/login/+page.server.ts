import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { authService } from "$lib/server/services/authService";

export const actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!email || !password) {
      return fail(400, { email, missing: true });
    }

    try {
      await authService.signInEmail(email, password, fetch);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return fail(401, { email, error: errorMessage });
    }

    throw redirect(303, "/");
  },
} satisfies Actions;
