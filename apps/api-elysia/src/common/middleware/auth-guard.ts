import { auth } from "@common/config/auth";
import type { Elysia } from "elysia";

type Role = "ADMIN" | "USER";

type AuthOptions = {
  required?: boolean;
  roles?: Role[];
};

type AuthConfig = boolean | Role | Role[] | AuthOptions;

/**
 * Derives user and session from Better Auth
 * Call this in your module before defining routes
 */
export function withAuth<T extends Elysia<any, any, any, any, any, any, any>>(
  app: T,
) {
  return app
    .derive(async ({ request }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      return {
        user: session?.user ?? null,
        session: session?.session ?? null,
      };
    })
    .macro({
      auth(config: AuthConfig) {
        let isRequired = true;
        let requiredRoles: Role[] | undefined = undefined;

        // Normalisasi semua input config menjadi uppercase agar aman
        if (typeof config === "boolean") {
          isRequired = config;
        } else if (typeof config === "string") {
          requiredRoles = [config.toUpperCase() as Role];
        } else if (Array.isArray(config)) {
          requiredRoles = config.map((r) => r.toUpperCase() as Role);
        } else if (typeof config === "object" && config !== null) {
          isRequired = config.required !== false;
          // Gunakan optional chaining dan map untuk array roles
          requiredRoles = config.roles?.map((r) => r.toUpperCase() as Role);
        }

        if (!isRequired && !requiredRoles) return;

        return {
          beforeHandle: async ({ user, set }: any) => {
            if (!user) {
              set.status = 401;
              return {
                error: "Unauthorized",
                message: "Please login first",
              };
            }

            if (requiredRoles && requiredRoles.length > 0) {
              const currentUserRole = String(user.role)
                .trim()
                .toUpperCase() as Role;
              if (!requiredRoles.includes(currentUserRole)) {
                set.status = 403;
                return {
                  error: "Forbidden",
                  message: "You do not have permission to access this resource",
                };
              }
            }
          },
        };
      },
    });
}
