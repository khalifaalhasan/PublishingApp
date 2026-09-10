// src/common/middleware/error-handler.ts
import { Elysia } from "elysia";
import { env } from "@common/config/env";
import { appLogger } from "../logger";
import {
  isPostgresMissingRelationError,
  isDatabaseServiceUnavailableError,
} from "../utils/db-error";

export const errorHandler = (app: Elysia) =>
  app.onError(({ code, error, set }) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

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
        if (typeof errorMessage === "string" && errorMessage.startsWith("{")) {
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
  });
