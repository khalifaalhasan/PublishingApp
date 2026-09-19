// src/app.ts
import { env } from "@common/config/env";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authModule } from "@modules/auth";
import { healthModule } from "@modules/health";
import { submissionsModule } from "@modules/submissions";
import { Elysia } from "elysia";
import { appLogger } from "./common/logger";
import {
  authRateLimit,
  globalRateLimit,
} from "./common/middleware/rate-limiter";
import { requestLogger } from "./common/middleware/request-logger";
import { errorHandler } from "./common/middleware/error-handler";
import { catalogModule } from "./modules/catalog";
import { uploadModule } from "./modules/upload";

console.log("CORS_ORIGIN:", env.CORS_ORIGIN, Array.isArray(env.CORS_ORIGIN));

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

    .use(
      swagger({
        path: "/docs",
        documentation: {
          info: {
            title: "Elysia Production API",
            version: "1.0.0",
            description: "Production-ready Elysia.js backend...",
          },
          tags: [
            { name: "Health", description: "Health check endpoints" },
            { name: "Auth", description: "Authentication endpoints" },
            { name: "Posts", description: "Posts CRUD endpoints" },
          ],
        },
        scalarConfig: { theme: "purple" },
      }),
    )
    .use(errorHandler)

    .get("/", () => ({
      name: "Elysia Production API",
      version: "1.0.0",
      docs: "/docs",
      health: "/health",
    }))

    .use(healthModule)
    .use(submissionsModule)
    .use(catalogModule)
    .use(uploadModule);

  if (env.ENABLE_AUTH) {
    app.use(authRateLimit);
    app.use(authModule);
    appLogger.info("[AUTH] Authentication module enabled");
  } else {
    appLogger.info("[AUTH] Authentication disabled (ENABLE_AUTH=false)");
  }

  return app;
};
