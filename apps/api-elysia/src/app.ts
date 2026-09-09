import { env } from "@common/config/env";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authModule } from "@modules/auth";
import { healthModule } from "@modules/health";
import { postsModule } from "@modules/posts";
import { submissionsModule } from "@modules/submissions";
import { Elysia } from "elysia";
import { appLogger } from "./common/logger";
import {
  authRateLimit,
  globalRateLimit,
} from "./common/middleware/rate-limiter";
import { requestLogger } from "./common/middleware/request-logger";

function isPostgresMissingRelationError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const dbError = error as { code?: string; message?: string };
  return (
    dbError.code === "42P01" ||
    /relation .* does not exist/i.test(dbError.message ?? "")
  );
}

/* 
  todo : bikin interface
  - pindahin error filter ke /common
*/
function isDatabaseServiceUnavailableError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;

  const dbError = error as {
    code?: string;
    message?: string;
    name?: string;
    errno?: string | number;
    cause?: { code?: string; message?: string };
    errors?: unknown[];
  };

  const errorCode = dbError.code ?? dbError.cause?.code;
  const errorMessage = `${dbError.message ?? ""} ${dbError.cause?.message ?? ""}`;
  const childErrors = Array.isArray(dbError.errors) ? dbError.errors : [];

  const matchesLocal =
    errorCode === "ECONNREFUSED" ||
    errorCode === "ETIMEDOUT" ||
    errorCode === "EHOSTUNREACH" ||
    errorCode === "ENETUNREACH" ||
    errorCode === "ECONNRESET" ||
    errorCode === "EPIPE" ||
    errorCode === "08006" ||
    errorCode === "08001" ||
    errorCode === "57P03" ||
    errorCode === "57P01" ||
    (typeof dbError.errno === "string" &&
      /ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|ECONNRESET|EPIPE/i.test(
        dbError.errno,
      )) ||
    (typeof dbError.name === "string" &&
      /PostgresError|AggregateError/i.test(dbError.name) &&
      /connection|connect|terminated|closed/i.test(errorMessage)) ||
    /connection refused/i.test(errorMessage) ||
    /server closed the connection unexpectedly/i.test(errorMessage) ||
    /could not connect to server/i.test(errorMessage) ||
    /terminating connection/i.test(errorMessage) ||
    /connection terminated/i.test(errorMessage) ||
    /connection was terminated/i.test(errorMessage) ||
    /connect failed/i.test(errorMessage);

  return (
    matchesLocal ||
    childErrors.some((childError) =>
      isDatabaseServiceUnavailableError(childError),
    )
  );
}

/**
 * Application composition root.
 *
 * Registers global middleware, OpenAPI/Scalar documentation,
 * error handling, and feature modules.
 * * @see https://elysiajs.com/concepts/plugin.html
 */
export const createApp = () => {
  const app = new Elysia()
    .use(requestLogger)
    .use(globalRateLimit)
    .use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      }),
    )
    // ---  API Documentation (open at /docs) ---
    .use(
      swagger({
        path: "/docs",
        documentation: {
          info: {
            title: "Elysia Production API",
            version: "1.0.0",
            description:
              "Production-ready Elysia.js backend with auth, database, and best practices.\n\n" +
              "Full Better Auth documentation: https://better-auth.com",
          },
          tags: [
            { name: "Health", description: "Health check endpoints" },
            {
              name: "Auth",
              description: "Authentication endpoints (Better Auth)",
            },
            {
              name: "Posts",
              description: "Posts CRUD endpoints (reference implementation)",
            },
          ],
        },
        scalarConfig: {
          theme: "purple",
        },
      }),
    )
    .onError(({ code, error, set }) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      appLogger.error({
        code,
        error: errorMessage,
        stack:
          env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      });

      if (code === "NOT_FOUND") {
        set.status = 404;
        return { error: "Route not found" };
      }

      if (code === "VALIDATION") {
        set.status = 400;

        let parsedMessage = errorMessage;
        try {
          if (
            typeof errorMessage === "string" &&
            errorMessage.startsWith("{")
          ) {
            parsedMessage = JSON.parse(errorMessage);
          }
        } catch {}

        return {
          error: "Validation error",
          message: parsedMessage,
        };
      }

      if (isPostgresMissingRelationError(error)) {
        set.status = 503;
        return {
          error: "Database Not Ready",
          message:
            "Database schema is not ready. Run `bun run db:migrate` before starting the app.",
        };
      }

      if (isDatabaseServiceUnavailableError(error)) {
        set.status = 503;
        return {
          error: "Database Service Unavailable",
          message:
            "Database service is unavailable. Start the Postgres container or check DATABASE_URL before retrying.",
        };
      }

      set.status = 500;
      return {
        error: "Internal server error",
        message: env.NODE_ENV === "development" ? errorMessage : undefined,
      };
    })

    // Root endpoint - API info
    .get("/", () => ({
      name: "Elysia Production API",
      version: "1.0.0",
      docs: "/docs",
      health: "/health",
    }))

    // Feature modules
    .use(healthModule)
    .use(postsModule)
    .use(submissionsModule);

  if (env.ENABLE_AUTH) {
    app.use(authRateLimit);
    app.use(authModule);
    appLogger.info("[AUTH] Authentication module enabled");
  } else {
    appLogger.info("[AUTH] Authentication disabled (ENABLE_AUTH=false)");
  }

  return app;
};
