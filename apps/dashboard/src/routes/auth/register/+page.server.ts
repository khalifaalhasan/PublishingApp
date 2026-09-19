import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { authService } from "$lib/server/services/authService";

export const actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();
    const name = data.get("name")?.toString();
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();

    if (!name || !email || !password) {
      return fail(400, { name, email, missing: true });
    }

    try {
      await authService.signUpEmail(name, email, password, fetch);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return fail(400, { name, email, error: errorMessage });
    }

    throw redirect(303, "/auth/login");
  },
} satisfies Actions;
